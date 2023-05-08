const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')

const projectDir = path.join(__dirname, 'project-dist')
const componentsDir = path.join(__dirname, 'components')
const stylesDir = path.join(__dirname, 'styles')
const assetsDir = path.join(__dirname, 'assets/')
const templateFile = path.join(__dirname, 'template.html')
const indexFile = path.join(projectDir, 'index.html')
const styleFile = path.join(projectDir, 'style.css')

async function buildIndexHtml() {
	const template = await fsPromises.readFile(templateFile, 'utf-8')
	const components = await loadComponents()
	const indexHtml = replaceTagsWithComponents(template, components)
	await fsPromises.writeFile(indexFile, indexHtml, 'utf-8')
}

async function loadComponents() {
	const componentFiles = await fsPromises.readdir(componentsDir)
	const components = {}
	for (const file of componentFiles) {
		if (path.extname(file) === '.html') {
			const componentName = path.basename(file, '.html')
			const componentContent = await fsPromises.readFile(path.join(componentsDir, file), 'utf-8')
			components[`{{${componentName}}}`] = componentContent
		}
	}
	return components
}

function replaceTagsWithComponents(template, components) {
	let result = template
	for (const tag in components) {
		if (components.hasOwnProperty(tag)) {
			const component = components[tag]
			result = result.replace(new RegExp(tag, 'g'), component)
		}
	}
	return result
}

async function buildStyleCss() {
	const styleFiles = await fsPromises.readdir(stylesDir)
	const cssContent = await Promise.all(
		styleFiles.map((file) => {
			if (path.extname(file) === '.css') {
				return fsPromises.readFile(path.join(stylesDir, file), 'utf-8')
			}
			return ''
		})
	)
	const css = cssContent.join('\n')
	await fsPromises.writeFile(styleFile, css, 'utf-8')
}

async function copyAssets() {
	const srcDir = path.join(assetsDir, '/')
	const destDir = path.join(projectDir, 'assets')
	const files = await fsPromises.readdir(srcDir)
	await Promise.all(
		files.map(async (file) => {
			const srcFile = path.join(srcDir, file)
			const destFile = path.join(destDir, file)
			const stats = await fsPromises.stat(srcFile)
			if (stats.isDirectory()) {
				const destSubDir = path.join(destDir, file)
				await fsPromises.mkdir(destSubDir, { recursive: true })
				await copyDir(srcFile, destSubDir)
			} else {
				await fsPromises.copyFile(srcFile, destFile)
			}
		})
	)
}

async function copyDir(srcDir, destDir) {
	const files = await fsPromises.readdir(srcDir)
	await Promise.all(
		files.map(async (file) => {
			const srcFile = path.join(srcDir, file)
			const destFile = path.join(destDir, file)
			const stats = await fsPromises.stat(srcFile)
			if (stats.isDirectory()) {
				await fsPromises.mkdir(destFile)
				await copyDir(srcFile, destFile)
			} else {
				await fsPromises.copyFile(srcFile, destFile)
			}
		})
	)
}

async function buildProject() {
	try {
		try {
			await fsPromises.access(projectDir, fs.constants.F_OK)
		} catch (error) {
			await fsPromises.mkdir(projectDir)
		}
		await buildIndexHtml()
		await buildStyleCss()
		await copyAssets()
	} catch (error) {
		console.error(error)
	}
}

buildProject()

const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')
const { readStyles, writeBundle } = require('../05-merge-styles/index')
const { copyDir } = require('../04-copy-directory/index')

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
	readStyles(stylesDir)
		.then((styles) => writeBundle(styles, styleFile))
		.then(() => console.log('Styles bundled successfully'))
		.catch((err) => console.error('Error bundling styles', err))
}

async function buildProject() {
	try {
		try {
			await fsPromises.access(projectDir, fs.constants.F_OK)
		} catch (error) {
			await fsPromises.mkdir(projectDir)
		}

		await Promise.all([
			buildIndexHtml(),
			buildStyleCss(),
			copyDir(assetsDir, path.join(projectDir, 'assets')).then(() =>
				console.log('Assets copied successfully')
			),
		])

		console.log('Project built successfully')
	} catch (error) {
		console.error('Error occurred while building the project:', error)
	}
}

buildProject()

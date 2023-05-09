const path = require('path')
const fsPromises = require('fs/promises')

async function readStyles(stylesPath) {
	const files = await fsPromises.readdir(stylesPath)
	const styles = []

	for (const file of files) {
		const filePath = path.join(stylesPath, file)
		const stats = await fsPromises.stat(filePath)

		if (stats.isFile() && path.extname(file) === '.css') {
			const data = await fsPromises.readFile(filePath, 'utf8')
			styles.push(data)
		}
	}

	return styles
}

async function writeBundle(styles, bundlePath) {
	await fsPromises.writeFile(bundlePath, styles.join('\n'))
}

if (require.main === module) {
	const stylesPath = path.join(__dirname, 'styles')
	const distPath = path.join(__dirname, 'project-dist')
	const bundlePath = path.join(distPath, 'bundle.css')

	readStyles(stylesPath)
		.then((styles) => writeBundle(styles, bundlePath))
		.then(() => console.log('Styles bundled successfully'))
		.catch((err) => console.error('Error bundling styles', err))
}

module.exports = {
	readStyles,
	writeBundle,
}

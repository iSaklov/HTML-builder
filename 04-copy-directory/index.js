const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')

const sourcePath = path.join(__dirname, 'files')
const targetPath = path.join(__dirname, 'files-copy')

async function copyDir(sourceDir, targetDir) {
	try {
		await fsPromises.mkdir(targetDir, { recursive: true })

		const files = await fsPromises.readdir(sourceDir)

		for (const file of files) {
			const sourcePath = path.join(sourceDir, file)
			const targetPath = path.join(targetDir, file)

			const stats = await fsPromises.stat(sourcePath)

			if (stats.isFile()) {
				await fsPromises.copyFile(sourcePath, targetPath)
			} else if (stats.isDirectory()) {
				await copyDir(sourcePath, targetPath)
			}
		}

		// Remove files in target directory that no longer exist in source directory
		const targetFiles = await fsPromises.readdir(targetDir)
		for (const targetFile of targetFiles) {
			const sourceFilePath = path.join(sourceDir, targetFile)
			const targetFilePath = path.join(targetDir, targetFile)

			if (!fs.existsSync(sourceFilePath)) {
				await fsPromises.unlink(targetFilePath)
			}
		}
	} catch (error) {
		console.error(error)
	}
}

copyDir(sourcePath, targetPath)
	.then(() => console.log('Копирование завершено'))
	.catch((error) => console.error(error))

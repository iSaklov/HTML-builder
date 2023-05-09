const { readdir, stat } = require('fs/promises')
const path = require('path')

const folderPath = path.join(__dirname, 'secret-folder')

readdir(folderPath, { withFileTypes: true })
	.then((files) => {
		for (const file of files) {
			if (file.isFile()) {
				const fileName = path.parse(file.name).name
				const fileExtension = path.extname(file.name).slice(1)
				stat(path.join(folderPath, file.name))
					.then((stats) => {
						const fileSizeInBytes = stats.size
						const fileSizeInKb = fileSizeInBytes / 1024
						console.log(`${fileName}-${fileExtension}-${fileSizeInKb.toFixed(3)}kb`)
					})
					.catch((err) => {
						console.error(`Не удалось получить информацию о файле: ${err}`)
					})
			}
		}
	})
	.catch((err) => {
		console.error(`Не удалось прочитать содержимое папки: ${err}`)
	})

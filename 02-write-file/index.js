const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { stdin, stdout } = process
const rl = readline.createInterface({
	input: stdin,
	output: stdout,
})

const filePath = path.join(__dirname, 'output.txt')
const writeStream = fs.createWriteStream(filePath, { flags: 'a' })

rl.write('Введите какой-либо текст или "exit" для завершения программы:\n')

rl.on('line', (input) => {
	if (input.toLowerCase() === 'exit') {
		rl.close()
	} else {
		writeStream.write(`${input}\n`)
	}
})

rl.on('close', () => {
	writeStream.end()
	stdout.write('Программа завершена\n')
})

rl.on('SIGINT', () => {
	rl.close()
})

writeStream.on('error', (err) => {
	console.error(`Ошибка записи в файл: ${err}`)
	writeStream.end(() => {
		process.exit(1)
	})
})

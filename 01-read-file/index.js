const path = require('path');
const fs = require('fs');

const { stdout } = process;
const filePath = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(filePath, 'utf-8')

readableStream.on('data', (chunk) => {
	// console.log(chunk)
	stdout.write(chunk)
})

readableStream.on('error', (error) => {
	console.log('Error', error.message)
})

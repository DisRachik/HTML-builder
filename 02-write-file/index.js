const fs = require('fs');
const path = require('path');

const { stdin, exit } = process;
const filePath = path.join(__dirname, '02-write-file.txt');

const writableStream = fs.createWriteStream(filePath, {
  encoding: 'utf8',
  flags: 'a',
});

stdin.setEncoding('utf8');

console.log(
  'Enter your message. To save, type "exit".\nTo exit the program, press Ctrl + C or type "exit".',
);

stdin.on('data', (chunk) => {
  const text = chunk.trim();

  if (text.toLowerCase() === 'exit') {
    writableStream.end(() => {
      console.log('Your messages has been written to ' + filePath);
      exit(0);
    });
  } else {
    writableStream.write(`${text}\n`);
  }
});

process.on('SIGINT', () => {
  writableStream.end(() => {
    console.log('\nYour messages has been written to ' + filePath);
    exit(0);
  });
});

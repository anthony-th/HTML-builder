const fs = require('fs');
const path = require('path');
const { stdout } = process;

const address = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(address, { encoding: 'utf-8' });
stream.on('error', (err) => {
  console.error('Error:', err);
});
stream.on('data', (data) => {
  stdout.write(data);
});

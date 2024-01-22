const { stdin, stdout } = process;
const fs = require('fs');
const create = fs.createWriteStream(
  '02-write-file/yougoddamnright.txt',
  'utf8',
);

create.on('error', (err) => {
  console.error(`Error creating the file yougoddamnright.txt: ${err}`);
  process.exit(1);
});

stdout.write('Do you believe in God?\n');
process.on('SIGINT', () => {
  process.exit();
});

stdin.on('data', (data) => {
  const value = data.toString().toLowerCase().trim();
  value === 'exit' ? process.exit() : create.write(data);
});

process.on('exit', (exitCode) => {
  const message =
    exitCode === 0
      ? 'We will call you back!\n'
      : `An error occurred, the process has exited with code ${exitCode}\n`;
  stdout.write(message);
  process.exitCode = exitCode;
});

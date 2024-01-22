const fs = require('fs');
const path = require('path');
const sourceFolder = path.join(__dirname, 'styles');
const outFile = fs.createWriteStream(
  path.join(__dirname, 'project-dist', 'bundle.css'),
);

fs.readdir(sourceFolder, (err, files) => {
  if (err) {
    console.log('\x1b[35m%s\x1b[0m', 'Folder not found');
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === '.css') {
      let readStream = fs.createReadStream(path.join(sourceFolder, file));
      readStream.pipe(outFile, { end: false });
      readStream.on('end', () => {
        outFile.end();
      });
    }
  });

  outFile.on('finish', () => {
    console.log(
      '\x1b[32m%s\x1b[0m',
      'bundle.css in `project-dist` folder complete =)',
    );
  });
});

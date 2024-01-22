const fs = require('fs');
const path = require('path');
const pathDir = path.join(__dirname, 'secret-folder');

function getFileDetails(file) {
  const filename = path.parse(file.name).name;
  const extension = path.extname(file.name).slice(1);
  return {
    filename,
    extension,
  };
}

fs.access(pathDir, (err) => {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', '404');
    console.error('\x1b[35m%s\x1b[0m', 'Folder not found');
    return;
  }
  fs.readdir(pathDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('\x1b[35m%s\x1b[0m', 'Files from secretfolder:');
    console.log('\x1b[36m%s\x1b[0m', 'File - extension - size');
    files.forEach((file) => {
      if (!file.isFile()) {
        return;
      }
      fs.stat(
        path.join(__dirname, 'secret-folder', file.name),
        (err, stats) => {
          if (err) {
            console.log(err);
            return;
          }
          const { filename, extension } = getFileDetails(file);
          const fileSize = (stats.size / 1024).toFixed(3);
          console.log(
            `${filename} - \x1b[31m${extension}\x1b[0m - \x1b[32m${fileSize}\x1b[0m Kb`,
          );
        },
      );
    });
  });
});

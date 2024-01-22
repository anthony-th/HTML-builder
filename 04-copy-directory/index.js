const fsProm = require('fs/promises');
const path = require('path');
const dirOriginal = path.join(__dirname, 'files');
const dirCopy = path.join(__dirname, 'files-copy');

fsProm
  .rm(dirCopy, { recursive: true, force: true })
  .then(() => {
    return fsProm.mkdir(dirCopy, { recursive: true });
  })
  .then(() => {
    return fsProm.readdir(dirOriginal, { withFileTypes: true });
  })
  .then((filesFind) => {
    const copyPromises = filesFind.map((element) => {
      return fsProm.copyFile(
        path.join(dirOriginal, element.name),
        path.join(dirCopy, element.name),
      );
    });
    return Promise.all(copyPromises);
  })
  .then(() => {
    console.log('\x1b[35m%s\x1b[0m', 'Copying is complete. Check the folders!');
  })
  .catch(() => {
    console.log('\x1b[31m%s\x1b[0m', 'Folder `files` not found');
  });

const fs = require('fs');
const path = require('path');
const fsProm = require('fs/promises');
const newFolder = path.join(__dirname, 'project-dist');
const componentsFolder = path.join(__dirname, 'components');
const assetsFolder = path.join(__dirname, 'assets');

fs.access(newFolder, (err) => {
  if (err) {
    fs.mkdir(newFolder, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '\x1b[34m%s\x1b[0m',
          'Folder `project-dist` successfully created =)',
        );
        createHtml(newFolder);
        createCssBundle(newFolder);
        copyAssets(newFolder);
      }
    });
  } else {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'Folder `project-dist` already exists =\\',
    );
    createHtml(newFolder);
    createCssBundle(newFolder);
    copyAssets(newFolder);
  }
});

async function createHtml(newFolder) {
  const templateFile = path.join(__dirname, 'template.html');
  const destFile = path.join(newFolder, 'index.html');
  try {
    const data = await fsProm.readFile(templateFile, { encoding: 'utf8' });
    const components = {};
    const componentPromises = [];
    const files = await fsProm.readdir(componentsFolder);
    for (const file of files) {
      if (path.extname(file) === '.html') {
        const componentName = path.basename(file, '.html');

        componentPromises.push(
          fsProm
            .readFile(path.join(componentsFolder, file), { encoding: 'utf8' })
            .then((componentData) => {
              components[componentName] = componentData;
            })
            .catch((err) => {
              console.error(`Error reading component ${componentName}:`, err);
            }),
        );
      }
    }
    await Promise.all(componentPromises);
    let result = data;
    Object.keys(components).forEach((key) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(pattern, components[key]);
    });
    await fsProm.writeFile(destFile, result);
    console.log(
      '\x1b[35m%s\x1b[0m',
      'Edited index.html in `project-dist` folder complete =)',
    );
  } catch (err) {
    console.error('Error creating HTML:', err);
  }
}
async function createCssBundle(newFolder) {
  const sourceFolder = path.join(__dirname, 'styles');
  const outFile = fs.createWriteStream(path.join(newFolder, 'style.css'));
  const fileOrder = ['header.css', 'main.css', 'footer.css'];
  try {
    const existingFiles = await Promise.all(
      fileOrder.map(async (file) => {
        try {
          await fs.promises.stat(path.join(sourceFolder, file));
          return file;
        } catch (err) {
          return null;
        }
      }),
    );
    const filteredExistingFiles = existingFiles.filter((file) => file !== null);
    const allFiles = await fs.promises.readdir(sourceFolder);
    const sortedFiles = filteredExistingFiles.concat(
      allFiles.filter((file) => !fileOrder.includes(file)),
    );
    await Promise.all(
      sortedFiles.map(async (file) => {
        if (path.extname(file) === '.css') {
          let readStream = fs.createReadStream(path.join(sourceFolder, file));
          readStream.pipe(outFile, { end: false });
          await new Promise((resolve, reject) => {
            readStream.on('end', () => {
              resolve();
            });
            readStream.on('error', (err) => {
              reject(err);
            });
          });
        }
      }),
    );
    console.log(
      '\x1b[32m%s\x1b[0m',
      'Style.css bundle in `project-dist` folder complete =)',
    );
  } catch (err) {
    console.error(err);
  }
  outFile.end();
}
async function copyAssets(newFolder) {
  try {
    const assetsDist = path.join(newFolder, 'assets');
    await fsProm.mkdir(assetsDist, { recursive: true });
    const files = await fsProm.readdir(assetsFolder);
    for (const file of files) {
      const filePath = path.join(assetsFolder, file);
      const fileDistPath = path.join(assetsDist, file);
      const stat = await fsProm.stat(filePath);
      if (stat.isFile()) {
        await fsProm.copyFile(filePath, fileDistPath);
      } else {
        await copyDir(filePath, fileDistPath);
      }
    }
    console.log(
      '\x1b[33m%s\x1b[0m',
      'Folder `assets` has been successfully copied to folder `project-dist` =)',
    );
  } catch (err) {
    console.error(err);
  }
}
async function copyDir(src, dest) {
  await fsProm.mkdir(dest, { recursive: true });
  const files = await fsProm.readdir(src);
  for (const file of files) {
    const filePath = path.join(src, file);
    const fileDistPath = path.join(dest, file);
    const stat = await fsProm.stat(filePath);
    if (stat.isFile()) {
      await fsProm.copyFile(filePath, fileDistPath);
    } else {
      await copyDir(filePath, fileDistPath);
    }
  }
}

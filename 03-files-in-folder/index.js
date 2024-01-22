const fs = require('fs').promises;
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true })
  .then((files) => {
    files.map(async (file) => {
      if (file.isFile()) {
        const filePath = path.join(folderPath, file.name);
        const { size } = await fs.stat(filePath);
        const { name, ext } = path.parse(filePath);

        const sizeInKB = (size / 1024).toFixed(2);
        console.log(`${name} - ${ext.replace('.', '')} - ${sizeInKB}kb`);
      }
    });
  })
  .catch((err) => {
    console.error(err.message);
  });

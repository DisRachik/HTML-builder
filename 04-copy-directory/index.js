const fs = require('fs').promises;
const path = require('path');

const folderPath = path.join(__dirname, 'files');
const folderForCopyPath = path.join(__dirname, 'files-copy');

(async () => {
  try {
    await fs.mkdir(folderForCopyPath, { recursive: true });

    const files = await fs.readdir(folderPath);
    const copyFiles = await fs.readdir(folderForCopyPath);

    copyFiles.forEach(async (file) => {
      const targetFilePath = path.join(folderForCopyPath, file);
      await fs.unlink(targetFilePath);
    });

    files.forEach(async (file) => {
      const sourceFile = path.join(folderPath, file);
      const targetFile = path.join(folderForCopyPath, file);

      await fs.copyFile(sourceFile, targetFile);
    });

    console.log('Copying done.');
  } catch (err) {
    console.error(err.message);
  }
})();

const fs = require('fs').promises;
const path = require('path');

const stylesFolderPath = path.join(__dirname, 'styles');
const distFolderPath = path.join(__dirname, 'project-dist');
const bundleCssPath = path.join(distFolderPath, 'bundle.css');

(async () => {
  try {
    await fs.mkdir(distFolderPath, { recursive: true });
    const stylesArray = [];

    const files = await fs.readdir(stylesFolderPath);

    await Promise.all(
      files.map(async (file) => {
        const isFile = path.extname(file).toLowerCase() === '.css';

        if (isFile) {
          const filePath = path.join(stylesFolderPath, file);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          stylesArray.push(fileContent);
        }
      }),
    );

    await fs.writeFile(bundleCssPath, stylesArray.join('\n'), 'utf-8');

    console.log('Compiled successfully.');
  } catch (err) {
    console.error(err.message);
  }
})();

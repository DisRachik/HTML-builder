const fs = require('fs').promises;
const path = require('path');

const projectDistPath = path.join(__dirname, 'project-dist');
const templatePath = path.join(__dirname, 'template.html');
const indexPath = path.join(projectDistPath, 'index.html');
const stylePath = path.join(projectDistPath, 'style.css');
const componentsPath = path.join(__dirname, 'components');
const stylesPath = path.join(__dirname, 'styles');
const assetsPath = path.join(__dirname, 'assets');

async function replaceTemplateTags(templateContent, components) {
  Object.entries(components).forEach(([tag, content]) => {
    const tagRegex = new RegExp(`{{${tag}}}`, 'g');
    templateContent = templateContent.replace(tagRegex, content);
  });

  return templateContent;
}

async function compileStyles(stylesPath) {
  const files = await fs.readdir(stylesPath);
  const stylesArray = await Promise.all(
    files.map(async (file) => {
      if (path.extname(file).toLowerCase() === '.css') {
        const filePath = path.join(stylesPath, file);
        return await fs.readFile(filePath, 'utf-8');
      }
    }),
  );

  return stylesArray.join('\n');
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function removeDeletedFiles(src, dest) {
  const destEntries = await fs.readdir(dest, { withFileTypes: true });

  await Promise.all(
    destEntries.map(async (destEntry) => {
      const destPath = path.join(dest, destEntry.name);
      const srcPath = path.join(src, destEntry.name);

      try {
        await fs.stat(srcPath, fs.constants.F_OK);
        if (destEntry.isDirectory()) {
          await removeDeletedFiles(srcPath, destPath);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          if (destEntry.isDirectory()) {
            await fs.rmdir(destPath, { recursive: true });
          } else {
            await fs.unlink(destPath);
          }
        } else {
          throw err;
        }
      }
    }),
  );
}

(async () => {
  try {
    await fs.mkdir(projectDistPath, { recursive: true });
    await copyDir(assetsPath, path.join(projectDistPath, 'assets'));

    const templateContent = await fs.readFile(templatePath, 'utf-8');

    const components = {};
    const componentsFiles = await fs.readdir(componentsPath);
    await Promise.all(
      componentsFiles.map(async (file) => {
        const filePath = path.join(componentsPath, file);

        if (path.extname(file).toLowerCase() === '.html') {
          const componentName = path.basename(file, '.html');
          const componentContent = await fs.readFile(filePath, 'utf-8');
          components[componentName] = componentContent;
        }
      }),
    );

    const updatedTemplateContent = await replaceTemplateTags(
      templateContent,
      components,
    );

    await fs.writeFile(indexPath, updatedTemplateContent, 'utf-8');

    const compiledStyles = await compileStyles(stylesPath);
    await fs.writeFile(stylePath, compiledStyles, 'utf-8');
    await removeDeletedFiles(assetsPath, path.join(projectDistPath, 'assets'));

    console.log('Build completed successfully.');
  } catch (err) {
    console.error(err.message);
  }
})();

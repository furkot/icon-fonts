const fs = require('node:fs/promises');
const path = require('node:path');
const handlebars = require('handlebars');

module.exports = {
  writeResults
};

function writeResults(toDir, name, { pixelRatio, layout, image }) {
  const basename = pixelRatio === 1 ? name : `${name}@${pixelRatio}x`;
  const spriteSrc = path.join('sprite', `${basename}.png`);
  const imgPath = path.join(toDir, spriteSrc);
  const jsonPath = path.join(toDir, 'sprite', `${basename}.json`);

  const tasks = [
    writeFile(jsonPath, JSON.stringify(layout, null, 2)),
    writeFile(imgPath, image)
  ];

  if (pixelRatio === 2) {
    tasks.push(writeHtml(toDir, name, layout, spriteSrc));
  }

  return Promise.all(tasks);
}

async function writeHtml(toDir, spriteName, layout, spriteSrc) {
  const images = Object.entries(layout)
    .map(([name, { x, y, width, height }]) => ({
      name,
      position: `-${x}px -${y}px`,
      width: `${width}px`,
      height: `${height}px`
    }));

  const htmlPath = path.join(toDir, `${spriteName}.html`);
  const templatePath = path.resolve(__dirname, '../../templates/sprite.html.hbs');
  const source = await fs.readFile(templatePath, 'utf8');
  const spriteTemplate = handlebars.compile(source);

  return writeFile(htmlPath, spriteTemplate({
    spriteName,
    spriteSrc,
    images
  }));
}

async function writeFile(filename, ...args) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  return fs.writeFile(filename, ...args);
}

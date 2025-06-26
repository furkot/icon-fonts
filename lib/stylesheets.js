const path = require('node:path');
const fs = require('node:fs/promises');
const handlebars = require('handlebars');

module.exports = stylesheets;

async function colorsStylesheet({ iconGroups }) {
  const colors = {};
  iconGroups.forEach(({ icons = [], paths = [], pattern: { backdrop } }) => {
    if (backdrop.length) {
      const [{ fill }] = backdrop;
      if (fill) {
        icons.concat(paths).forEach(icon => (colors[icon] = fill));
      }
    }
  });
  const templatePath = path.resolve(__dirname, '../templates/colors.less.hbs');
  const source = await fs.readFile(templatePath, 'utf8');
  const colorsTemplate = handlebars.compile(source);
  return colorsTemplate({
    colors: Object.entries(colors).map(([icon, color]) => ({ icon, color }))
  });
}

async function stylesheets(from, { colorScheme }) {
  if (colorScheme) {
    const prefix = path.join(path.dirname(from), `${path.basename(from, '.svg')}`);
    const schemes = Object.entries(colorScheme).map(async ([name, scheme]) =>
      fs.writeFile(`${prefix}-${name}.less`, await colorsStylesheet(scheme))
    );
    await Promise.all(schemes);
  }
}

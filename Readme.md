[![NPM version][npm-image]][npm-url]
[![Dependency Status][deps-image]][deps-url]

# furkot-icon-fonts

SVG files and scripts to create icon fonts used by [Furkot] road trip planner

## Usage

Install the tools using npm

    npm install

Use `make` to generate the icons

To generate fonts and style files in `build` directory

    make clean build

To view generated icons in the browser

    make demo

It is used to generate:

- [furkot font] - used in buttons and markers on the furkot map
- [furkot sprites] - used in furkot map

In order to add new icons drop SVG anywhere in the `svg/furkot` directory:
- SVG file name needs to be unique
- SVG viewBox should be square
- for best results SVG should be rescaled to 512x512

To verify SVGs run:

    make verify

To optimize non-conforming SVGs:

    make optimize

It'll merge path, apply transforms and change the viewport aspect ratio to square (it will center the path preserving aspect ration). If resulting file needs to be further tweaked try [inkscape] and [svgo].

## License

All files in `svg` directory are published under the licenses provided by their owners. Check `svg` folder for iconset license files.

Everything outside of the `svg` directory is published under MIT license.

[Furkot]:https://trips.furkot.com
[furkot font]:https://furkot.github.io/icon-fonts/build/furkot.html
[furkot sprites]:https://furkot.github.io/icon-fonts/build/sprite-streets.html
[inkscape]: https://inkscape.org
[svgo]: https://github.com/svg/svgo

[npm-image]: https://img.shields.io/npm/v/furkot-icon-fonts.svg
[npm-url]: https://npmjs.org/package/furkot-icon-fonts

[deps-image]: https://img.shields.io/librariesio/release/npm/furkot-icon-fonts
[deps-url]: https://libraries.io/npm/furkot-icon-fonts

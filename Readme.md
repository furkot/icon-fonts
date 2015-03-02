#furkot-icon-fonts

SVG files and scripts to create icon fonts used by [Furkot] road trip planner


# Usage

Install the tools using npm

    npm install

Use `make` to generate the icons

To generate fonts and style files in `build` directory

    make clean build

To view generated icons in the browser

    make demo

It is used to generate:

- [furkot font] - used in buttons and toolbars
- [marker font] - used for markers displayed on the furkot map

Make will generate only one font at a time. You can select which font is generated passing `FONT` variable.

    make build FONT=marker # generate marker font
    make build FONT=furkot # default

## License

All files in `svg` directory are published under the licenses provided by their owners.
Check `svg` folder for iconset license files.

Everything outside of the `svg` directory is published under MIT license.

[Furkot]:https://trips.furkot.com
[furkot font]:http://furkot.github.io/icon-fonts/build/furkot.html
[marker font]:http://furkot.github.io/icon-fonts/build/marker.html
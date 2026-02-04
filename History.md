
2.5.7 / 2026-02-04
==================

 * replace `yarn` with `pnpm`
 * upgrade `marked` to ~17
 * optimize sprite-streets icons
 * upgrade `svgo` to ~4
 * upgrade `el-component` to ~2
 * use `biome` as a linter and formatter

2.5.6 / 2024-12-10
==================

 * generate webp files instead of png files
 * fix `deploy` target
 * soft dependency update
 * upgrade marked to ~15
 * upgrade spriteone to 1.1.0

2.5.5 / 2024-03-19
==================

 * free skiing icon

2.5.4 / 2024-02-08
==================

 * icon for propane/lpg

2.5.3 / 2024-01-06
==================

 * use @pirpilot/jshint instead of jshint
 * upgrade marked to ~11
 * use xml2js directly instead of using xmljson
 * remove async module
 * normalize xmljson usage
 * remove `find` dependency
 * soft dependency upgrade
 * stop generating references to `.woff` files in CSS

2.5.2 / 2024-01-05
==================

 * icon for offline
 * stop building fonts in woff format (no longer used)

2.5.1 / 2023-04-22
==================

 * cross symbols is not for markers

2.5.0 / 2023-04-14
==================

 * make sprites slightly bigger
 * change icon colors to use only light background
 * assign color to all icons, not just the ones in sprite
 * define short list of icons for a simple sprite
 * remove shield-less small icons from sprite that are not used by Furkot map style
 * generate stylesheet with icon colors
 * separate color scheme from sprite specification
 * remove geometric shapes from paths
 * move mapping from svg source files to sprite entries from paths to sprite section of configuration file
 * remove clock from the list of icons that represent stop markers
 * can use food_shop as stop marker
 * remove reference to already removed multinight icon
 * specify margins in the same units as iconDim
 * add missing icon group
 * add support for overwriting size in icon group
 * upgrade @furkot/webfonts-generator to ~2

2.4.0 / 2023-04-06
==================

 * redraw icons for bolder more angular look
 * re-organize source svg icons
 * use @mapwhit/spriteone to generate sprite
 * render sprites for all pixel ratios in one shot
 * optimize svgo to 3.0.2
 * promisify optimize code
 * use sharp to render images
 * modify API
 * replace spritezero
 * stop using minimist to parse args
 * update webfonts-generator

2.3.0 / 2022-01-16
==================

 * replace webfonts-generator
 * upgrade dependencies

2.2.1 / 2020-09-13
==================

 * simplify paths of connectors

2.2.0 / 2020-09-11
==================

 * electric sockets
 * clean up licenses
 * typo in Readme
 * clean svg files with svgcleaner
 * task to clean and pack svg files
 * optimize unoptimized icons

2.1.4 / 2020-04-21
==================

 * swimming icon
 * add missing viewBox

2.1.3 / 2020-04-19
==================

 * directory icon
 * crowdsource icon
 * highlighter icon
 * remove deprecated `speak` CSS property
 * upgrade dependencies

2.1.2 / 2019-05-20
==================

 * add link to icon licenses
 * remove empty icon name

2.1.1 / 2019-04-23
==================

 * invert color for lodging sprite icons
 * fix sprite icons
 * generate multiple sprite icons from one svg icon
 * generate sprite icons in sizes 1x, 2x, 3x

2.1.0 / 2019-04-16
==================

 * make off-road icon bigger
 * fix optimize after upgrading async module
 * generate woff2 instead of ttf fonts
 * optimize svg files
 * update dependencies

2.0.4 / 2019-04-11
==================

 * add icon arrow-top

2.0.3 / 2019-03-18
==================

 * output list of icons as JSON
 * icon for ethanol-free fuel
 * icon for diesel fuel
 * redesign fuel icons

2.0.2 / 2019-03-16
==================

 * icon for fuel guage with more than half tank

2.0.1 / 2019-03-12
==================

 * add garden icon different than park

2.0.0 / 2019-03-11
==================

 * fix Makefile so that we only run generate once
 * demo pages for sprites
 * generate sprites with map icons
 * optimize and scale icons
 * generate icon paths as JSON

1.2.24 / 2019-01-07
===================

 * update Foursquare icon

1.2.23 / 2018-11-17
===================

 * add satellite icon

1.2.22 / 2018-08-31
===================

 * add missing map icons

1.2.21 / 2018-04-10
===================

 * add reddit icon

1.2.20 / 2018-04-08
===================

 * Furkot icon

1.2.19 / 2018-01-04
===================

 * add path for off-road icon

1.2.18 / 2017-11-02
===================

 * icons for taxi, bus, entertainment, music
 * generate path for the film icon

1.2.17 / 2017-10-13
===================

 * icon for my location

1.2.16 / 2017-06-17
===================

 * generate path for the clock icon

1.2.15 / 2017-05-31
===================

 * switch to yarn
 * add instagram icon
 * fix DOS/Windows line endings

1.2.14 / 2017-04-13
===================

 * icons for map types

1.2.13 / 2017-02-08
===================

 * select all icon
 * sunrise and sunset icons
 * add bird icon

1.2.12 / 2016-03-23
===================

 * more icons, mostly representing transport options

1.2.11 / 2015-11-21
===================

 * 'alternative road' icon

1.2.10 / 2015-10-25
===================

 * lightbulb icon
 * generate only font files used by Furkot

1.2.9 / 2015-10-25
==================

 * puzzle icon
 * pull fonts from furkot instead of pushing

1.2.8 / 2015-08-05
==================

 * fire icon
 * navigation icon

1.2.7 / 2015-07-16
==================

 * menu icon

1.2.6 / 2015-06-22
==================

 * arrows to move an element to begin and to end

1.2.5 / 2015-04-01
==================

 * update pets icon

1.2.4 / 2015-04-01
==================

 * use pets icon as map pin

1.2.3 / 2015-03-30
==================

 * pets icon

1.2.2 / 2015-03-27
==================

 * 'atv' and 'off-road' icons
 * better version of 'hostel' icon
 * remove unused 'bypass' icon
 * generate icon-license.md
 * clean up license files

1.2.1 / 2015-03-12
==================

 * stop inlining fonts in data-url

1.2.0 / 2015-03-09
==================

 * search options icons
 * sort icons
 * filter icon

1.1.0 / 2015-03-07
==================

 * fix svgs: make all viewboxes square, fix origin, add missing viewBox
 * add verify and optimize targets
 * remove unnecessary icon aliases
 * consolidate markers in furkot font
 * generate icon paths to be used by map markers
 * font data now kept in external .json file

1.0.1 / 2015-02-16
==================

 * add copy icon

1.0.0 / 2015-02-16
==================

 * add furkot specific icons
 * add webfonts-generator

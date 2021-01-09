# Tridi
[![npm (latest)](https://img.shields.io/npm/v/tridi/latest.svg)](https://www.npmjs.com/package/tridi)
[![Build status](https://ci.appveyor.com/api/projects/status/h427w8jgqks4qm9h/branch/master?svg=true)](https://ci.appveyor.com/project/lwojcik/tridi/branch/master)
[![codecov](https://codecov.io/gh/lukemnet/tridi/branch/master/graph/badge.svg?token=3c2TX2NWAE)](https://codecov.io/gh/lukemnet/tridi)

Tridi is a flexible JavaScript library for 360-degree 3D product visualizations based on series of images. Works on mobile and desktop browsers.

![Tridi in action (GIF)](https://raw.githubusercontent.com/lukemnet/tridi/master/dist/images/example.gif)

## Install

```
npm install tridi
```

## Download

* [Latest release](https://github.com/lukemnet/tridi/releases/latest) &mdash; full package from GitHub
* [Source code](https://raw.githubusercontent.com/lukemnet/tridi/master/src/tridi.ts) &mdash; contains full uncompiled TypeScript source code
* [Compiled version](https://tridi.lukem.net/js/tridi.js) &mdash; contains unminified JS code
* [Production-ready version](https://tridi.lukem.net/js/tridi.min.js) &mdash; minified JS code

## Quick start
Import Tridi as a module:

```js
import * as Tridi from 'tridi';
// or:
import { Tridi } from 'tridi';
// or:
const Tridi = require('tridi');
```

Or add Tridi to your site via a traditional script tag:

```HTML
<script src="path/to/tridi.js"></script>
```
For minimum styling add [tridi.css](https://tridi.lukem.net/css/tridi.css) to head section of your page:
```HTML
<link rel="stylesheet" href="path/to/tridi.css">
```

See [Basic viewer](https://tridi.lukem.net/examples/basic.html) for a minimal viable example.

## Documentation

See [tridi.lukem.net](https://tridi.lukem.net/) for complete documentation and examples.

## Contributions

Contributions of any kind are welcome.

You can contribute to Tridi by:

* submiting bug reports or feature suggestions
* improving documentation
* submitting pull requests

Before contributing be sure to read [Contributing Guidelines](https://github.com/lukemnet/tridi/blob/master/CONTRIBUTING.md) and [Code of Conduct](https://github.com/lukemnet/tridi/blob/master/CODE_OF_CONDUCT.md).

## Acknowledgements

Tridi was loosely inspired by [3D-Product-Viewer-JavaScript-Plugin](https://github.com/Jeya-Prakash/3D-Product-Viewer-JavaScript-Plugin) by [Jeya Prakash](https://github.com/Jeya-Prakash).

## License

Licensed under MIT License. See [LICENSE](https://github.com/lukemnet/tridi/blob/master/LICENSE) for more information.

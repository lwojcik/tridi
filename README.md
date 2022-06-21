# Tridi

**This library is no longer supported or maintained. [Read the story of Tridi on my blog &raquo;](https://www.offbeatbits.com/that-tiny-javascript-library-that-couldnt/)**

Tridi is a flexible JavaScript library for 360-degree 3D product visualizations based on series of images. Works on mobile and desktop browsers.

![Tridi in action (GIF)](https://raw.githubusercontent.com/tridijs/tridi/master/dist/images/example.gif)

## Install

```
npm install tridi
```

## Download

* [Latest release](https://github.com/tridijs/tridi/releases/latest) &mdash; full package from GitHub
* [Source code](https://raw.githubusercontent.com/tridijs/tridi/master/src/tridi.ts) &mdash; contains full uncompiled TypeScript source code

## Quick start
Import Tridi as a module:

```js
import * as Tridi from 'tridi';
// or:
const Tridi = require('tridi');
```

Or add Tridi to your site via a traditional script tag:

```HTML
<script src="path/to/tridi.js"></script>
```
For minimum styling add [tridi.css](https://raw.githubusercontent.com/tridijs/tridi/master/dist/css/tridi.css) to head section of your page:

```HTML
<link rel="stylesheet" href="path/to/tridi.css">
```

## Using React?

Check out [react-tridi](https://github.com/nevestuan/react-tridi) by [Tuan Pham](https://github.com/nevestuan) which implements Tridi as a fully fledged React component.

## Documentation

Documentation site is no longer available, but its content can still be found in [dist folder](https://github.com/tridijs/tridi/tree/master/dist). 

## Acknowledgements

Tridi was loosely inspired by [3D-Product-Viewer-JavaScript-Plugin](https://github.com/Jeya-Prakash/3D-Product-Viewer-JavaScript-Plugin) by [Jeya Prakash](https://github.com/Jeya-Prakash).

## License

Licensed under MIT License. See [LICENSE](https://github.com/tridijs/tridi/blob/master/LICENSE) for more information.

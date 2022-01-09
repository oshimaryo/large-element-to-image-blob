# largeElementToImageBlob
convert too large element (> max canvas size for each browser) to Blob (jpg/png)

## Problem this package solved

In order to convert an `HTMLElement` into an image in the web front end, it is necessary to convert the `HTMLElement` into a `canvas` and then export the image from the `canvas`.

However, each browser has its own limit on the size of a `canvas` . (Reference: [canvas-size](https://github.com/jhildenbiddle/canvas-size#test-results))

 Therefore, it is usually not possible to export an extremely large `HTMLElement` as an image in its original size.

This package makes it possible to export an image of a `HTMLElement` that are larger than the maximum `canvas` size for each browser.

## Installation
This module is installed via npm.
```sh
$ npm install @oshimaryo/large-element-to-image-blob
```

## Example Usage
```js
import { largeElementToImageBlob } from '@oshimaryo/large-element-to-image-blob'

const blob = await largeElementToImageBlob(document.querySelector('#super-large'), { type: 'image/jpeg'})

const a = document.createElement('a')
a.href = URL.createObjectURL(blob)
a.download = 'super-large.jpg'
a.click()
```

## Limitations
* In order to draw elements on canvas, this module uses [html2canvas](https://html2canvas.hertzen.com/). Therefore, [CSS propeties that are not supported by html2canvas](https://html2canvas.hertzen.com/features#unsupported-css-properties) cannot be drawn.
* Currently, cross-origin images will not be drawn. ([Related issue](https://github.com/oshimaryo/large-element-to-image-blob/issues/6))

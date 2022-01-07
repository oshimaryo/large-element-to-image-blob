import html2canvas from 'html2canvas'
import jpegJs from 'jpeg-js'
import { PNG } from 'pngjs/browser'
import { getCanvasMaxSize } from '@oshimaryo/get-canvas-max-size'

import { splitSizeIntoViewports } from './splitSizeIntoViewports'
import { isSmallerThanMaxSize } from './isSmallerThanMaxSize'
import { Uint32ArrayToUint8ClampedArray, Uint8ClampedArrayToUint32Array } from './UintConversions'

//  Size { width: number; height: number }
//  Offset { top: number; left: number }
//  ViewPort { width: number; height: number, top: number, left: number }
//  ImageData: {data: Uint8ClampedArray, width: number, height: number}

// baseData: Uint32Array,
// baseSize: Size,
// srcData: ImageData,
// offset: Offset
function mergeImageData(baseData, baseSize, srcData, offset) {
  const { data, width, height } = srcData
  const { top, left } = offset

  const srcDataUint32Array = Uint8ClampedArrayToUint32Array(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstIndex = (y + top) * baseSize.width + x + left
      const srcIndex = y * width + x
      // Arrayは参照渡しなので、引数のbaseDataそのものが書き換えられる
      baseData[dstIndex] = srcDataUint32Array[srcIndex]
    }
  }
}

// imageData: ImageData
// type: 'image/jpeg' | 'image/png'
// quality: number(0.0-1.0)
function imageDataToBlob(imageData, type, quality) {
  switch (type) {
    case 'image/jpeg':
      const jpegData = jpegJs.encode(imageData, quality ? quality * 100 : undefined)
      return new Blob([jpegData.data], { type })
    case 'image/png':
      // TODO: #3 add `deflateLevel` params for PNG.sync.write
      // https://github.com/lukeapage/pngjs#options
      // deflateLevelは、zlib.jsのパラメータ。
      // in pngjs, default value is 9
      imageData.interlace = false
      imageData.palette = false
      imageData.depth = 8
      imageData.color = true
      imageData.colorType = 6 // colorType: 6 = color & alpha.
      imageData.gamma = 0

      const pngData = PNG.sync.write(imageData)
      return new Blob([pngData], { type })
  }
}

// html2canvas specs: https://html2canvas.hertzen.com/features
// 既知の問題点:　font-features-settings: 'halt' が未対応のため、『、「、・等のあとの１文字が、半角ズレる
// element: HTMLElement
// viewport: ViewPort
async function renderElementInViewport(element, viewport) {
  const { left: x, top: y, width, height } = viewport
  const canvas = await html2canvas(element, { x, y, width, height })
  return canvas
}

// element: HTMLElement
export async function largeElementToImageBlob(element, options = { type: 'image/jpeg' | 'image/png', quality: 1.0 }) {
  const width = element.clientWidth
  const height = element.clientHeight

  const { type, quality } = options

  const originalSize = { width, height }

  // canvasMaxSize: { width: number; height: number, pixels: number }
  const canvasMaxSize = getCanvasMaxSize()
  console.log(canvasMaxSize)

  // maxSize以下なら、普通にrenderして返す
  if (isSmallerThanMaxSize(originalSize, canvasMaxSize)) {
    console.log('small element')
    const canvas = await html2canvas(element)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality))
    // TODO: #2 largeElementToImageBlobは、Promiseを返すように
    return blob
  }

  // 8bit 4チャンネル（RGBA）を、Uint32Arrayの1要素にまとめる
  // すべてのcanvasをmergeしたあとに Uint8ClampedArray に変換する
  let resultData = new Uint32Array(width * height)

  // 領域の大きさ（Size）を分割して複数の viewport に変換し、
  // それぞれの viewport について、canvasを作成して描画
  // canvasは都度、1つの　Uint32Arrayにまとめてから破棄する
  console.log('start rendering')
  for (const viewport of splitSizeIntoViewports(originalSize, canvasMaxSize)) {
    const canvas = await renderElementInViewport(element, viewport)
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, viewport.width, viewport.height)
    mergeImageData(resultData, originalSize, imageData, viewport)
    // release canvas
    // https://qiita.com/minimo/items/b724c6793f45aca5e6f5
    canvas.width = canvas.height = 0
    console.count('viewport rendered')
  }

  const data = Uint32ArrayToUint8ClampedArray(resultData)

  // TODO: #2 largeElementToImageBlobは、Promiseを返すように
  return imageDataToBlob({ data, width, height }, type, quality)
}

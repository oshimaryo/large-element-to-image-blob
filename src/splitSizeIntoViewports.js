import canvasSize from 'canvas-size'

import { isSmallerThanMaxSize } from './isSmallerThanMaxSize'

// Type 1. height > maxSize.height：　横幅をoriginalSize.widthで固定して、領域を水平方向に切る
// Type 2. width > maxSize.width：　縦幅をoriginalSize.heightで固定して、領域を垂直方向に切る
// Type 3. width　 > maxSize.width && height > maxSize.height：
// 一番少なくてすむ分割方法が不明。とりあえず、正方形に分割する
// - 縦横比を保持して分割する?
// - どちらかを小さい方を、最低限必要な数で分割して、逆は可能なかぎり大きくする？
// - 正方形で分割する?

export function splitSizeIntoViewports(originalSize, maxSize) {
  const { width, height } = originalSize
  console.log('originalSize:', originalSize.width, 'x', originalSize.height)

  if (isSmallerThanMaxSize(originalSize, maxSize)) return originalSize

  //
  if (height > maxSize.height && width <= maxSize.width) {
    console.log('Split Type 1 [-]: Holizontal Slice ')
    return horizontalSlice(originalSize, maxSize)
  }

  if (width > maxSize.width && height <= maxSize.height) {
    console.log('Split Type 2 [|]: Vertical Slice ')
    return verticalSlice(originalSize, maxSize)
  }

  console.log('Split Type 3 [+]: Divide into Squares (+ Rectangles)')
  return devideIntoSquares(originalSize, maxSize)
}

function horizontalSlice(originalSize, maxSize) {
  const { width, height } = originalSize

  let viewportMaxHeight = Math.floor(maxSize.pixels / width)
  const result = recursiveCanvasSizeTest({ width, height: viewportMaxHeight, fixedEdge: 'width' })
  viewportMaxHeight = result.height

  const verticalCount = Math.ceil(height / viewportMaxHeight)

  const viewports = []
  for (let y = 0; y < verticalCount; y++) {
    const top = y * viewportMaxHeight
    const viewport = {
      left: 0,
      top,
      width,
      height: y !== verticalCount - 1 ? viewportMaxHeight : height - top
    }
    viewports.push(viewport)
  }

  return viewports
}

function verticalSlice(originalSize, maxSize) {
  const { width, height } = originalSize

  let viewportMaxWidth = Math.floor(maxSize.pixels / height)
  const result = recursiveCanvasSizeTest({ width: viewportMaxWidth, height, fixedEdge: 'height' })
  viewportMaxWidth = result.width

  const horizontalCount = Math.ceil(width / viewportMaxWidth)

  const viewports = []
  for (let x = 0; x < horizontalCount; x++) {
    const left = x * viewportMaxWidth
    const viewport = {
      left,
      top: 0,
      width: x !== horizontalCount - 1 ? viewportMaxWidth : width - left,
      height
    }
    viewports.push(viewport)
  }

  return viewports
}

function devideIntoSquares(originalSize, maxSize) {
  const { width, height } = originalSize

  const longestEdge = Math.floor(Math.sqrt(maxSize.pixels))

  const horizontalCount = Math.ceil(width / longestEdge)
  const verticalCount = Math.ceil(height / longestEdge)

  const viewports = []
  for (let y = 0; y < verticalCount; y++) {
    for (let x = 0; x < horizontalCount; x++) {
      const left = x * longestEdge
      const top = y * longestEdge
      viewports.push({
        left,
        top,
        width: x !== horizontalCount - 1 ? longestEdge : width - left,
        height: y !== verticalCount - 1 ? longestEdge : height - top
      })
    }
  }

  return viewports
}

function recursiveCanvasSizeTest({ width, height, fixedEdge = 'width' | 'height' }) {
  let result = { width, height }
  console.count('try')
  if (!canvasSize.test({ width, height })) {
    console.log('failed:', width, height)

    result =
      fixedEdge === 'width'
        ? recursiveCanvasSizeTest({ width, height: height - 2, fixedEdge })
        : recursiveCanvasSizeTest({ width: width - 2, height, fixedEdge })
  }
  console.log('success:', result.width, result.height)
  return result
}

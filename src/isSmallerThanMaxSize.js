export function isSmallerThanMaxSize(size, canvasMaxSize) {
  return (
    size.width <= canvasMaxSize.width &&
    size.height <= canvasMaxSize.height &&
    size.width * size.height <= canvasMaxSize.pixels
  )
}

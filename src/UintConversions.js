export function Uint8ClampedArrayToUint32Array(uint8ClampedArray) {
  const uint32Array = new Uint32Array(uint8ClampedArray.length / 4)
  for (let i = 0; i < uint32Array.length; i++) {
    uint32Array[i] =
      uint8ClampedArray[i * 4] +
      (uint8ClampedArray[i * 4 + 1] << 8) +
      (uint8ClampedArray[i * 4 + 2] << 16) +
      (uint8ClampedArray[i * 4 + 3] << 24)
  }
  return uint32Array
}

export function Uint32ArrayToUint8ClampedArray(uint32Array) {
  const uint8ClampedArray = new Uint8ClampedArray(uint32Array.length * 4)
  for (let i = 0; i < uint32Array.length; i++) {
    const uint32 = uint32Array[i]
    uint8ClampedArray[i * 4 + 0] = uint32 & 0xff
    uint8ClampedArray[i * 4 + 1] = (uint32 >> 8) & 0xff
    uint8ClampedArray[i * 4 + 2] = (uint32 >> 16) & 0xff
    uint8ClampedArray[i * 4 + 3] = (uint32 >> 24) & 0xff
  }
  return uint8ClampedArray
}

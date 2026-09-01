// Facility pictures are stored inline on the document as data URIs, so a
// straight 4MB phone photo would be pasted into every facility query. This
// downscales and re-encodes as JPEG in the browser before it is ever sent.
const MAX_EDGE = 1200
const QUALITY = 0.82

export function fileToResizedDataUrl(file, { maxEdge = MAX_EDGE, quality = QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Only ever shrink — upscaling a small image just wastes bytes.
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // JPEG rather than PNG: these are photographs, and PNG would be several
      // times larger for no visible gain.
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }

    img.src = url
  })
}

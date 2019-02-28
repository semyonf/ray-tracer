import { Vec3 } from './Vec3'
import { Ray } from './Ray'

const canvas = window.vpCanvas

const imageWidth = 640
const imageHeight = 480

canvas.width = imageWidth
canvas.height = imageHeight
canvas.style.height = `${imageHeight / devicePixelRatio}px`
canvas.style.width = `${imageWidth / devicePixelRatio}px`

const context = canvas.getContext('2d')
const data = context.getImageData(0, 0, imageWidth, imageHeight)
data.data.fill(255)

const camOrigin = new Vec3(0, 0, -10)
const camTarget = new Vec3(0, 0, 0)
const fieldOfView = Math.PI / 2

const camDirection = camTarget.sub(camOrigin)
const camDirectionNormalized = camDirection.normalize()

const bn = Vec3.UP.xProduct(camDirection).normalize()
const vn = camDirectionNormalized.xProduct(bn)

const aspectRatio = imageHeight / imageWidth

const viewportHalfWidth = Math.tan(fieldOfView / 2)
const viewportHalfHeight = viewportHalfWidth * aspectRatio

const viewportWidth = 2 * viewportHalfWidth
const shiftX = bn.scale(viewportWidth / (imageWidth - 1))

const viewportHeight = 2 * viewportHalfHeight
const shiftY = vn.scale(viewportHeight / (imageHeight - 1))

const leftBottomPixelCenter = camDirectionNormalized
  .sub(bn.scale(viewportHalfWidth))
  .sub(vn.scale(viewportHalfHeight))

const sphere = {
  origin: new Vec3(3, 0, 10),
  radius: 8
}

for (let x = 0; x < imageWidth; x++) {
  for (let y = 0; y < imageHeight; y++) {
    const nextPixelCenter = leftBottomPixelCenter
      .add(shiftX.scale(x - 1))
      .add(shiftY.scale(y - 1))
      .normalize()

    const colorVector = traceRay(new Ray(camOrigin, nextPixelCenter))

    const byte = (x * 4) + (y * imageWidth * 4)
    data.data[byte + 0] = colorVector.x
    data.data[byte + 1] = colorVector.y
    data.data[byte + 2] = colorVector.z
  }
}

context.putImageData(data, 0, 0)

/**
 * @param {Ray} ray
 */
function traceRay(ray) {
  const rayOriginToSphereCenter = sphere.origin.sub(ray.origin)
  const rayLen = rayOriginToSphereCenter.dotProduct(ray.direction)
  const rayOriginToSphereCenterLen = rayOriginToSphereCenter.calcNorm()
  const D = sphere.radius ** 2 - rayOriginToSphereCenterLen ** 2 + rayLen ** 2

  if (D >= 0) {
    /**
     * @todo investigate Math.sqrt(D * λ) expression
     */
    const intersectionPoint = ray.direction.scale(rayLen - Math.sqrt(D))
    const lightDirection = new Vec3(5, -5, -10).normalize()
    const normal = sphere.origin.sub(intersectionPoint).normalize()
    const intensity = lightDirection.dotProduct(normal)
    const redColor = new Vec3(244, 67, 54).scale(Math.min(intensity, 1))

    return redColor
  }

  return ray.direction.scale(220)
}

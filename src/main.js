import { Vec3 } from './Vec3'
import { Ray } from './Ray'

const canvas = window.vpCanvas

const imageWidth = 640 * devicePixelRatio
const imageHeight = 480 * devicePixelRatio

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

function specular(eyeVector, normal, light) {
  const n = 14
  const k = eyeVector
    .sub(normal.scale(2).scale(normal.dotProduct(eyeVector)))
    .dotProduct(light) ** (n * 2)

  return k
}

/**
 * @param {Ray} ray
 */
function traceRay(ray) {
  const camToSphereCenter = sphere.origin.sub(ray.origin)
  const sight = camToSphereCenter.dotProduct(ray.direction)
  const D = sphere.radius ** 2 - camToSphereCenter.calcNorm() ** 2 + sight ** 2

  if (D >= 0) {
    const dist = sight - Math.sqrt(D)
    const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
    const lightDirection = new Vec3(1, 1, 1).normalize()
    const normal = sphere.origin.sub(intersectionPoint).normalize()
    const intensity = lightDirection.dotProduct(normal)

    const redColor = new Vec3(244, 67, 54)

    const spec = specular(ray.direction, normal, lightDirection)

    return redColor
      .scale(Math.min(1, intensity))
      .add((new Vec3(125, 125, 125).scale(Math.min(1, spec))))
      .add(normal.scale(70))
  }

  return ray.direction.scale(150)
}

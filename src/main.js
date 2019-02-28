import { Vec3 } from './Vec3'
import { Ray } from './Ray'

/**
 * @danger HORRIBLE CODE AHEAD
 */

;(function (canvas) {
  'use strict'

  const imageWidth = 640 * 2
  const imageHeight = 480 * 2
  const zoom = 0

  canvas.width = imageWidth
  canvas.height = imageHeight
  canvas.style.height = `${imageHeight / devicePixelRatio}px`
  canvas.style.width = `${imageWidth / devicePixelRatio}px`

  const context = canvas.getContext('2d')
  const data = context.getImageData(0, 0, imageWidth, imageHeight)
  data.data.fill(255)

  const E = new Vec3(0, 0, -10)
  const T = new Vec3(0, 0, 0)
  const theta = Math.PI / 2

  const t = T.sub(E)
  const tn = t.normalize()

  const b = Vec3.UP.xProduct(t)
  const bn = b.normalize()

  const vn = tn.xProduct(bn)

  const aspectRatio = imageHeight / imageWidth

  const gx = Math.tan(theta / 2)
  const hx = 2 * gx
  const gy = gx * aspectRatio
  const hy = 2 * gy

  const qx = bn.scale(hx / (imageWidth - 1))
  const qy = vn.scale(hy / (imageHeight - 1))

  const p1m = tn.sub(bn.scale(gx)).sub(vn.scale(gy))

  const sphere = {
    origin: new Vec3(3, 0, 10),
    radius: 8
  }

  for (let i = 0; i < imageWidth; i++) {
    for (let j = 0; j < imageHeight; j++) {
      const pij = p1m.add(qx.scale(i - 1)).add(qy.scale(j - 1))
      const rij = pij.normalize().scale(1 + zoom * 0.1)

      const ray = new Ray(E, rij)

      const colorVector = traceRay(ray)

      const byte = (i * 4) + (j * imageWidth * 4)
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
      const i1 = ray.direction.scale(rayLen - Math.sqrt(D * 0.2))
      const lightDirection = new Vec3(5, 5, -10).normalize()
      const normal = sphere.origin.sub(i1).normalize()
      const intensity = lightDirection.dotProduct(normal)
      const redColor = new Vec3(244, 67, 54).scale(Math.min(intensity, 1))

      const i2 = ray.direction.scale(rayLen - Math.sqrt(D * 10))
      const normal2 = sphere.origin.sub(i2).normalize()
      const intensity2 = lightDirection.dotProduct(normal2)
      const weirdColor = new Vec3(255, 0, 0).scale(Math.min(intensity2, 1))

      return redColor.add(new Vec3(0, 50).scale(0.3)).add(weirdColor.scale(0.3))
    }

    return ray.direction.scale(220)
  }
})(window.vpCanvas)

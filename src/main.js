import { Vec3 } from './Vec3'
import { Ray } from './Ray'

;(function (canvas) {
  'use strict'

  const k = 640
  const m = 480
  const zoom = 0

  canvas.width = k
  canvas.height = m

  canvas.style.height = m / devicePixelRatio + 'px'
  canvas.style.width = k / devicePixelRatio + 'px'

  const ctx = canvas.getContext('2d')
  const data = ctx.getImageData(0, 0, k, m)
  data.data.fill(255)

  const E = new Vec3(0, 0, -10)
  const T = new Vec3(0, 0, 0)
  const theta = Math.PI / 2

  const t = T.sub(E)
  const tn = t.normalize()

  const b = Vec3.UP.xProduct(t)
  const bn = b.normalize()

  const vn = tn.xProduct(bn)

  const aspectRatio = m / k

  const gx = Math.tan(theta / 2)
  const hx = 2 * gx
  const gy = gx * aspectRatio

  const hy = 2 * gy

  const qx = bn.scale(hx / (k - 1))
  const qy = vn.scale(hy / (m - 1))

  const p1m = tn.sub(bn.scale(gx)).sub(vn.scale(gy))

  const sphere = {
    origin: new Vec3(2, 0, 10),
    radius: 3
  }

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < m; j++) {
      const pij = p1m.add(qx.scale(i - 1)).add(qy.scale(j - 1))
      const rij = pij.normalize().scale(1 + zoom * 0.1)

      const ray = new Ray(E, rij)

      const colorVector = traceRay(ray)

      const byte = (i * 4) + (j * k * 4)
      data.data[byte + 0] = colorVector.x
      data.data[byte + 1] = colorVector.y
      data.data[byte + 2] = colorVector.z
    }
  }

  ctx.putImageData(data, 0, 0)

  /**
   * @todo WIP
   * @param {Ray} ray
   */
  function traceRay(ray) {
    const rayOriginToSphereCenter = sphere.origin.sub(ray.origin)
    const rayLen = rayOriginToSphereCenter.dotProduct(ray.direction)
    const rayOriginToSphereCenterLen = rayOriginToSphereCenter.calcNorm()
    const D = sphere.radius ** 2 - rayOriginToSphereCenterLen ** 2 + rayLen ** 2

    if (D >=0) {
      return new Vec3(244, 67, 54)
    }

    return ray.direction.scale(250)
  }
})(window.vpCanvas)

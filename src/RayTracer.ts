import { Intersection } from './Intersection'
import { Light } from './Light'
import { Ray } from './Ray'
import { Sphere } from './Sphere'
import { Vec3 } from './Vec3'

export class RayTracer {
  private canvas: HTMLCanvasElement
  private imageWidth: number
  private imageHeight: number
  private fieldOfView: number = Math.PI / 6
  private objects: Sphere[] = [
    new Sphere(new Vec3(5, -3, 2), new Vec3(150, 90, 30), 0.1, 3),
    new Sphere(new Vec3(-3, 0, 3), new Vec3(77, 109, 109), 0.1, 5),
    new Sphere(new Vec3(5.5, 7, 5), new Vec3(150, 76, 76), 0.1, 5),
  ]

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas
    this.imageWidth = width * devicePixelRatio
    this.imageHeight = height * devicePixelRatio

    canvas.width = this.imageWidth
    canvas.height = this.imageHeight
    canvas.style.height = `${this.imageHeight / devicePixelRatio}px`
    canvas.style.width = `${this.imageWidth / devicePixelRatio}px`
  }

  public render() {
    const context = this.canvas.getContext('2d')
    const data = context.getImageData(0, 0, this.imageWidth, this.imageHeight)
    data.data.fill(255)

    const camOrigin = new Vec3(0, 0, -10).scale(7)
    const camTarget = new Vec3(0, 0, 0)
    const camDirection = camTarget.sub(camOrigin)
    const camDirectionNormalized = camDirection.normalize()

    const bn = Vec3.globalUp.xProduct(camDirection).normalize()
    const vn = camDirectionNormalized.xProduct(bn)

    const aspectRatio = this.imageHeight / this.imageWidth

    const viewportHalfWidth = Math.tan(this.fieldOfView / 2)
    const viewportHalfHeight = viewportHalfWidth * aspectRatio

    const viewportWidth = 2 * viewportHalfWidth
    const shiftX = bn.scale(viewportWidth / (this.imageWidth - 1))

    const viewportHeight = 2 * viewportHalfHeight
    const shiftY = vn.scale(viewportHeight / (this.imageHeight - 1))

    const leftBottomPixelCenter = camDirectionNormalized
      .sub(bn.scale(viewportHalfWidth))
      .sub(vn.scale(viewportHalfHeight))

    for (let x = 0; x < this.imageWidth; x++) {
      for (let y = 0; y < this.imageHeight; y++) {
        const nextPixelCenter = leftBottomPixelCenter
          .add(shiftX.scale(x - 1))
          .add(shiftY.scale(y - 1))
          .normalize()

        const colorVector = this.traceRay(new Ray(camOrigin, nextPixelCenter))

        const byte = (x * 4) + (y * this.imageWidth * 4)
        data.data[byte + 0] = colorVector.x
        data.data[byte + 1] = colorVector.y
        data.data[byte + 2] = colorVector.z
      }
    }

    context.putImageData(data, 0, 0)
  }

  public shade(intersection: Intersection): Vec3 {
    const { object, ray, dist } = intersection

    let colorAccumulator = object.color.scale(object.ambient)

    const lights: Light[] = [
      new Light(new Vec3(-11, 3, -5)),
      new Light((new Vec3(4, -4, -6)).scale(1.2)),
      new Light((new Vec3(0, -19, 2)).scale(10)),
    ]

    const iSectionPoint = ray.origin.add(ray.direction.scale(dist))
    const normal = object.normal(iSectionPoint)

    for (const light of lights) {
      const closestIntersection = this.checkIntersections(
        new Ray(iSectionPoint, iSectionPoint.sub(light.origin).normalize()),
      )

      if (closestIntersection.dist < -0.1) {
        colorAccumulator = colorAccumulator
          .add(this.calcDiffuse(object, light, normal))
      } else {
        colorAccumulator = colorAccumulator
          .add(this.calcDiffuse(object, light, normal))
          .add(this.calcSpecular(ray, normal, light))
      }
    }

    return colorAccumulator
  }

  private calcSpecular(ray: Ray, normal: Vec3, light: Light): Vec3 {
    const hardness = 8
    const intensity = ray.direction
      .sub(normal.scale(2 * normal.dotProduct(ray.direction)))
      .dotProduct(light.direction) ** (hardness * 2)

    return new Vec3(255, 255, 255).scale(0.2 * Math.min(1, intensity))
  }

  private calcDiffuse(object: Sphere, light: Light, normal: Vec3): Vec3 {
    const lightDistance = object.origin.sub(light.origin).calcNorm()
    const inverseSquare = (lightDistance ** -2) * light.power
    const intensity = light.direction.dotProduct(normal) * inverseSquare

    return object.color.scale(Math.min(1, intensity))
  }

  private checkIntersections(ray: Ray): Intersection {
    let closest: Intersection = null

    for (const object of this.objects) {
      const intersection = object.checkIntersection(ray)

      if (!closest || (intersection && closest.dist > intersection.dist)) {
        closest = intersection
      }
    }

    return closest
  }

  private traceRay(rayToTrace: Ray, bounce: number = 0): Vec3 {
    const closest = this.checkIntersections(rayToTrace)
    const background = new Vec3(76, 76, 76).scale(0.7)

    if (!closest) {
      return background
    }

    const { ray, dist, object } = closest
    const color = this.shade(closest)

    if (bounce < 2) {
      const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
      const normal = object.normal(intersectionPoint)

      return color.add(this.traceRay(
        new Ray(intersectionPoint, normal), ++bounce,
      ).scale(0.2))
    }

    return color
  }
}

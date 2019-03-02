import { Intersection } from './Intersection'
import { IObject3D } from './IObject3D'
import { Light } from './Light'
import { Ray } from './Ray'
import { Sphere } from './Sphere'
import { Vec3 } from './Vec3'

export class Renderer {
  private canvas: HTMLCanvasElement
  private imageWidth: number
  private imageHeight: number
  private fieldOfView: number = Math.PI / 2
  private objects: IObject3D[] = [
    new Sphere(new Vec3(5, -3, 2), new Vec3(255), 0.2, 3),
    new Sphere(new Vec3(-3, 0, 4), new Vec3(0, 255), 0.2, 5),
    new Sphere(new Vec3(3, 5, 10), new Vec3(0, 255, 255), 0.2, 2),
    new Sphere(new Vec3(6, 10, 4), new Vec3(123, 220, 44), 0.2, 5),
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

    const camOrigin = new Vec3(0, 0, -10)
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

    /**
     * @todo handle multiple lights correctly
     */
    const lights: Light[] = [
      new Light(new Vec3(-10, -15, -10)),
      // new Light(new Vec3(15, -10, -10)),
    ]

    const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
    const normal = object.normal(intersectionPoint)

    for (const light of lights) {
      const closestIntersection = this.checkIntersections(
        new Ray(
          intersectionPoint,
          intersectionPoint
            .sub(light.origin)
            .normalize(),
        ),
      )

      if (closestIntersection.dist < -0.005) {
        continue
      } else {
        colorAccumulator = colorAccumulator
          .add(this.calcDiffuse(object, light, normal))
          .add(this.calcSpecular(ray, normal, light))
          .add(object.color.scale(object.ambient))
      }
    }

    return colorAccumulator
  }

  private calcSpecular(ray: Ray, normal: Vec3, light: Light): Vec3 {
    const hardness = 40

    const intensity = ray.direction
      .sub(normal.scale(2).scale(normal.dotProduct(ray.direction)))
      .dotProduct(light.direction) ** (hardness * 2)

    return new Vec3(255, 255, 255)
      .scale(0.5)
      .scale(Math.min(1, intensity))
  }

  private calcDiffuse(object: IObject3D, light: Light, normal: Vec3): Vec3 {
    const lightDistance = object.origin.sub(light.origin).calcNorm()
    const inverseSquare = (lightDistance ** -2) * light.power
    const intensity = light.direction.dotProduct(normal) * inverseSquare

    return object.color
      .scale(Math.min(1, intensity))
      .add(normal.scale(90))
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
    const background = new Vec3(190, 190, 190)

    if (!closest) {
      return background.add(rayToTrace.direction.scale(60))
    }

    const { ray, dist, object } = closest
    const color = this.shade(closest)

    if (bounce < 2) {
      const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
      const normal = object.normal(intersectionPoint)

      return color.add(this.traceRay(
        new Ray(intersectionPoint, normal), ++bounce,
      ).scale(0.2)).add(normal.scale(50))
    }

    return color
  }
}

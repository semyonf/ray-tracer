import { Intersection } from './Intersection'
import { IObject3D } from './IObject3D'
import { Ray } from './Ray'
import { Sphere } from './Sphere'
import { Vec3 } from './Vec3'

export class Renderer {
  private canvas: HTMLCanvasElement
  private imageWidth: number
  private imageHeight: number
  private fieldOfView: number = Math.PI / 2
  private objects: IObject3D[] = [
    new Sphere(new Vec3(3, -3, 0), new Vec3(255), 0.2, 3),
    new Sphere(new Vec3(-3, 0, 4), new Vec3(0, 255), 0.2, 5),
    new Sphere(new Vec3(3, 3, 10), new Vec3(0, 255, 255), 0.2, 2),
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
    const colorAccumulator = new Vec3()

    /**
     * @todo handle multiple lights
     */
    const light = {
      origin: new Vec3(-15, 10, 0.1),
      power: 150,
      target: intersection.object.origin,
    }

    const { ray, dist, object } = intersection

    const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
    const normal = object.normal(intersectionPoint)
    const lightDirection = light.target.sub(light.origin).normalize()

    const closestIntersection = this.checkIntersections(
      new Ray(
        intersectionPoint,
        intersectionPoint
          .sub(light.origin)
          .normalize(),
      ),
    )

    if (closestIntersection.dist < -0.005) {
      return object.color.scale(object.ambient)
    }

    return colorAccumulator
      .add(diffuse())
      .add(specular())
      .add(object.color.scale(object.ambient))

    function diffuse(): Vec3 {
      const lightDistance = object.origin.sub(light.origin).calcNorm()
      const inverseSquareCoeff = (lightDistance ** -2) * light.power
      const intensity = lightDirection.dotProduct(normal) * inverseSquareCoeff

      return object.color.scale(Math.min(1, intensity))
    }

    function specular(): Vec3 {
      const hardness = 10

      const intensity = ray.direction
        .sub(normal.scale(2).scale(normal.dotProduct(ray.direction)))
        .dotProduct(lightDirection) ** (hardness * 2)

      return new Vec3(255, 255, 255)
        .scale(0.5)
        .scale(Math.min(1, intensity))
    }
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

  private traceRay(ray: Ray): Vec3 {
    const closest = this.checkIntersections(ray)
    const background = new Vec3(80, 80, 80)

    if (!closest) {
      return background
    }

    return this.shade(closest)
  }
}

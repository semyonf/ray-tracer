import { Intersection } from './Intersection'
import { Light } from './Light'
import { Ray } from './Ray'
import { Sphere } from './Sphere'
import { Vec3 } from './Vec3'

/**
 * Ray tracer implementation for rendering 3D scenes
 */
export class RayTracer {
  // Rendering constants
  private static readonly AMBIENT_LIGHT = 0.1
  private static readonly REFLECTION_INTENSITY = 0.2
  private static readonly BACKGROUND_BRIGHTNESS = 0.7
  private static readonly MAX_BOUNCE_COUNT = 2
  private static readonly SHADOW_OFFSET = -0.1

  private canvas: HTMLCanvasElement
  private imageWidth: number
  private imageHeight: number
  private fieldOfView: number = Math.PI / 6
  private objects: Sphere[] = [
    new Sphere(new Vec3(5, -3, 2), new Vec3(150, 90, 30), RayTracer.AMBIENT_LIGHT, 3),
    new Sphere(new Vec3(-3, 0, 3), new Vec3(77, 109, 109), RayTracer.AMBIENT_LIGHT, 5),
    new Sphere(new Vec3(5.5, 7, 5), new Vec3(150, 76, 76), RayTracer.AMBIENT_LIGHT, 5),
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

  /**
   * Renders the scene to the canvas
   */
  public render() {
    const context = this.canvas.getContext('2d')
    const data = context.getImageData(0, 0, this.imageWidth, this.imageHeight)
    data.data.fill(255)

    // Set up camera
    const cameraOrigin = new Vec3(0, 0, -10).scale(7)
    const cameraTarget = new Vec3(0, 0, 0)
    const cameraDirection = cameraTarget.sub(cameraOrigin)
    const cameraForward = cameraDirection.normalize()

    // Calculate camera basis vectors (right and up)
    const cameraRight = Vec3.globalUp.cross(cameraDirection).normalize()
    const cameraUp = cameraForward.cross(cameraRight)

    const aspectRatio = this.imageHeight / this.imageWidth

    const viewportHalfWidth = Math.tan(this.fieldOfView / 2)
    const viewportHalfHeight = viewportHalfWidth * aspectRatio

    const viewportWidth = 2 * viewportHalfWidth
    const pixelShiftX = cameraRight.scale(viewportWidth / (this.imageWidth - 1))

    const viewportHeight = 2 * viewportHalfHeight
    const pixelShiftY = cameraUp.scale(viewportHeight / (this.imageHeight - 1))

    const viewportBottomLeft = cameraForward
      .sub(cameraRight.scale(viewportHalfWidth))
      .sub(cameraUp.scale(viewportHalfHeight))

    for (let x = 0; x < this.imageWidth; x++) {
      for (let y = 0; y < this.imageHeight; y++) {
        const pixelDirection = viewportBottomLeft
          .add(pixelShiftX.scale(x - 1))
          .add(pixelShiftY.scale(y - 1))
          .normalize()

        const colorVector = this.traceRay(new Ray(cameraOrigin, pixelDirection))

        const byteIndex = (x * 4) + (y * this.imageWidth * 4)
        data.data[byteIndex + 0] = colorVector.x
        data.data[byteIndex + 1] = colorVector.y
        data.data[byteIndex + 2] = colorVector.z
      }
    }

    context.putImageData(data, 0, 0)
  }

  /**
   * Calculates the color at an intersection point by computing lighting
   */
  public shade(intersection: Intersection): Vec3 {
    const { object, ray, dist } = intersection

    let colorAccumulator = object.color.scale(object.ambient)

    const lights: Light[] = [
      new Light(new Vec3(-11, 3, -5)),
      new Light((new Vec3(4, -4, -6)).scale(1.2)),
      new Light((new Vec3(0, -19, 2)).scale(10)),
    ]

    const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
    const normal = object.normal(intersectionPoint)

    for (const light of lights) {
      const shadowRay = new Ray(
        intersectionPoint,
        intersectionPoint.sub(light.origin).normalize()
      )
      const shadowIntersection = this.checkIntersections(shadowRay)

      // Add diffuse lighting for all cases
      colorAccumulator = colorAccumulator.add(this.calcDiffuse(object, light, normal))

      // Add specular highlights only if not in shadow
      const isInShadow = shadowIntersection.dist < RayTracer.SHADOW_OFFSET
      if (!isInShadow) {
        colorAccumulator = colorAccumulator.add(this.calcSpecular(ray, normal, light))
      }
    }

    return colorAccumulator
  }

  /**
   * Calculates specular (shiny) reflection for a surface
   */
  private calcSpecular(ray: Ray, normal: Vec3, light: Light): Vec3 {
    const hardness = 8
    const specularIntensity = 0.2

    // Calculate reflection vector
    const reflection = ray.direction.sub(normal.scale(2 * normal.dotProduct(ray.direction)))
    const intensity = reflection.dotProduct(light.direction) ** (hardness * 2)

    return new Vec3(255, 255, 255).scale(specularIntensity * Math.min(1, intensity))
  }

  /**
   * Calculates diffuse (matte) lighting for a surface
   */
  private calcDiffuse(object: Sphere, light: Light, normal: Vec3): Vec3 {
    const lightDistance = object.origin.sub(light.origin).length()
    const inverseSquareFalloff = (lightDistance ** -2) * light.power
    const intensity = light.direction.dotProduct(normal) * inverseSquareFalloff

    return object.color.scale(Math.min(1, intensity))
  }

  /**
   * Finds the closest intersection of a ray with any object in the scene
   */
  private checkIntersections(ray: Ray): Intersection | null {
    let closest: Intersection | null = null

    for (const object of this.objects) {
      const intersection = object.checkIntersection(ray)

      if (!closest || (intersection && closest.dist > intersection.dist)) {
        closest = intersection
      }
    }

    return closest
  }

  /**
   * Traces a ray through the scene and returns the color
   * @param rayToTrace The ray to trace
   * @param bounceCount Number of reflections so far
   */
  private traceRay(rayToTrace: Ray, bounceCount: number = 0): Vec3 {
    const closestIntersection = this.checkIntersections(rayToTrace)
    const backgroundColor = new Vec3(76, 76, 76).scale(RayTracer.BACKGROUND_BRIGHTNESS)

    if (!closestIntersection) {
      return backgroundColor
    }

    const { ray, dist, object } = closestIntersection
    const color = this.shade(closestIntersection)

    // Add reflections if we haven't exceeded the bounce limit
    if (bounceCount < RayTracer.MAX_BOUNCE_COUNT) {
      const intersectionPoint = ray.origin.add(ray.direction.scale(dist))
      const normal = object.normal(intersectionPoint)
      const reflectedRay = new Ray(intersectionPoint, normal)

      const reflectionColor = this.traceRay(reflectedRay, bounceCount + 1)
      return color.add(reflectionColor.scale(RayTracer.REFLECTION_INTENSITY))
    }

    return color
  }
}

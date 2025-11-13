import { Intersection } from './Intersection'
import { Ray } from './Ray'
import { Vec3 } from './Vec3'

/**
 * Represents a sphere object in 3D space
 */
export class Sphere {
  public radius: number
  public origin: Vec3
  public color: Vec3
  public ambient: number

  constructor(origin: Vec3, color: Vec3, ambient: number, radius: number) {
    this.origin = origin
    this.radius = radius
    this.color = color
    this.ambient = ambient
  }

  /**
   * Calculates the surface normal at a given position
   */
  public normal(pos: Vec3): Vec3 {
    return this.origin.sub(pos).normalize()
  }

  /**
   * Checks if a ray intersects with this sphere
   * @returns Intersection object if hit, null otherwise
   */
  public checkIntersection(ray: Ray): Intersection | null {
    const rayToSphere = this.origin.sub(ray.origin)
    const projection = rayToSphere.dotProduct(ray.direction)
    const discriminant = this.radius ** 2 - rayToSphere.length() ** 2 + projection ** 2

    if (discriminant >= 0) {
      const distance = projection - Math.sqrt(discriminant)

      return new Intersection(this, ray, distance)
    }

    return null
  }
}

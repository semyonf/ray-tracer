import { Ray } from './Ray'
import { Sphere } from './Sphere'

/**
 * Represents an intersection between a ray and an object
 */
export class Intersection {
  public object: Sphere
  public ray: Ray
  public dist: number

  constructor(object: Sphere, ray: Ray, dist: number) {
    this.object = object
    this.ray = ray
    this.dist = dist
  }
}

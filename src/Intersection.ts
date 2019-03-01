import { Intersectable } from './Intersectable'
import { Ray } from './Ray'

export class Intersection {
  public object: Intersectable
  public ray: Ray
  public dist: number

  constructor(object: Intersectable, ray: Ray, dist: number) {
    this.object = object
    this.ray = ray
    this.dist = dist
  }
}

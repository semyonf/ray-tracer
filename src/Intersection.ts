import { IObject3D } from './IObject3D'
import { Ray } from './Ray'

export class Intersection {
  public object: IObject3D
  public ray: Ray
  public dist: number

  constructor(object: IObject3D, ray: Ray, dist: number) {
    this.object = object
    this.ray = ray
    this.dist = dist
  }
}

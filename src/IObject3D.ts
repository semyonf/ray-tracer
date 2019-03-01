import { Intersection } from './Intersection'
import { Ray } from './Ray'
import { Vec3 } from './Vec3'

export interface IObject3D {
  origin: Vec3
  color: Vec3
  checkIntersection(ray: Ray): Intersection | null
  normal(pos: Vec3): Vec3
}

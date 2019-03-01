import { Intersection } from './Intersection'
import { Ray } from './Ray'
import { Vec3 } from './Vec3'

export interface Intersectable {
  checkIntersection: (ray: Ray) => Intersection | null
  normal: (pos: Vec3) => Vec3
  origin: Vec3
}

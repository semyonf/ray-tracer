import { Intersectable } from './Intersectable'
import { Intersection } from './Intersection'
import { Obj3 } from './Obj3'
import { Ray } from './Ray'
import { Vec3 } from './Vec3'

export class Sphere extends Obj3 implements Intersectable {
  public radius: number

  constructor(origin: Vec3, radius: number) {
    super(origin)
    this.radius = radius
  }

  public normal(pos: Vec3): Vec3 {
    return this.origin.sub(pos).normalize()
  }

  public checkIntersection(ray: Ray): Intersection | null {
    const rayOtoSphereO = this.origin.sub(ray.origin)
    const sight = rayOtoSphereO.dotProduct(ray.direction)
    const D = this.radius ** 2 - rayOtoSphereO.calcNorm() ** 2 + sight ** 2

    if (D >= 0) {
      const distance = sight - Math.sqrt(D)

      return new Intersection(this, ray, distance)
    }

    return null
  }
}

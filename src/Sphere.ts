import { Intersection } from './Intersection'
import { IObject3D } from './IObject3D'
import { Ray } from './Ray'
import { Vec3 } from './Vec3'

export class Sphere implements IObject3D {
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

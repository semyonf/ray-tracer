import { Vec3 } from './Vec3'

/**
 * Represents a ray with an origin point and direction vector
 */
export class Ray {
  public origin: Vec3
  public direction: Vec3

  constructor(origin: Vec3, direction: Vec3) {
    this.origin = origin
    this.direction = direction
  }
}

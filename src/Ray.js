export class Ray {
  /**
   * A ray of light
   * @param {Vec3} origin 
   * @param {Vec3} direction 
   */
  constructor(origin, direction) {
    this.origin = origin
    this.direction = direction
  }
}
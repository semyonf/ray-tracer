export class Vec3 {
  /**
   * A three-dimensional vector
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  /**
   * @param {Vec3} other
   */
  add(other) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /**
   * @param {Vec3} other
   */
  sub(other) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  calcNorm() {
    return Math.sqrt(this.dotProduct(this))
  }

  /**
   * @param {number} factor
   */
  scale(factor) {
    return new Vec3(this.x * factor, this.y * factor, this.z * factor)
  }

  normalize() {
    return this.scale(1 / this.calcNorm())
  }

  /**
   * @param {Vec3} other
   */
  xProduct(other) {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    )
  }

  /**
   * @param {Vec3} other
   */
  dotProduct(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }
}

Vec3.UP = new Vec3(0, 1, 0)

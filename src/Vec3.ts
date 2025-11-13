/**
 * 3D vector class with common vector operations
 */
export class Vec3 {
  public static globalUp = new Vec3(0, 1, 0)

  public x: number
  public y: number
  public z: number

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  /**
   * Adds another vector to this vector
   */
  public add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /**
   * Subtracts another vector from this vector
   */
  public sub(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /**
   * Calculates the length (magnitude) of this vector
   */
  public length(): number {
    return Math.sqrt(this.dotProduct(this))
  }

  /**
   * Multiplies this vector by a scalar factor
   */
  public scale(factor: number): Vec3 {
    return new Vec3(this.x * factor, this.y * factor, this.z * factor)
  }

  /**
   * Returns a normalized (unit length) version of this vector
   */
  public normalize(): Vec3 {
    return this.scale(1 / this.length())
  }

  /**
   * Calculates the cross product of this vector with another
   */
  public cross(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    )
  }

  /**
   * Calculates the dot product of this vector with another
   */
  public dotProduct(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }
}

export class Vec3 {
  public x: number
  public y: number
  public z: number

  public static globalUp = new Vec3(0, 1, 0)

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  sub(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  calcNorm(): number {
    return Math.sqrt(this.dotProduct(this))
  }

  scale(factor: number): Vec3 {
    return new Vec3(this.x * factor, this.y * factor, this.z * factor)
  }

  normalize(): Vec3 {
    return this.scale(1 / this.calcNorm())
  }

  xProduct(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    )
  }

  dotProduct(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }
}

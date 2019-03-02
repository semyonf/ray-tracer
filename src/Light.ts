import { Vec3 } from './Vec3'

export class Light {
  public readonly origin: Vec3
  public readonly target: Vec3
  public readonly power: number
  public readonly direction: Vec3

  constructor(origin: Vec3, target: Vec3 = new Vec3(), power: number = 100) {
    this.origin = origin
    this.target = target
    this.power = power
    this.direction = this.target.sub(this.origin).normalize()
  }
}

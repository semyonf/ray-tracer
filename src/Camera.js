import { Vec3 } from './Vec3'

export class Camera {
  constructor(
    origin = new Vec3(),
    direction = Vec3.FORWARD,
    fieldOfView = Math.PI / 2,
    widthPx = 640,
    heightPx = 480
  ) {
    this.origin = origin
    this.direction = direction
    this.fieldOfView = fieldOfView
    this.widthPx = widthPx
    this.heightPx = heightPx
  }
}

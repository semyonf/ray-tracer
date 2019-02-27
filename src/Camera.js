export class Camera {
  /**
   * @param {Vec3} origin
   * @param {Vec3} target
   * @param {number} widthPx - image width in pixels
   * @param {number} heightPx - image height in pixels
   * @param {number} fieldOfView - angle in radians
   */
  constructor(origin, target, widthPx, heightPx, fieldOfView = Math.PI / 4) {
    this.origin = origin
    this.target = target
    this.fieldOfView = fieldOfView
    this.widthPx = widthPx
    this.heightPx = heightPx
  }
}

import BaseEffect from './BaseEffect.js';

/**
 * Time Slow Effect
 * Slows down physics simulation by reducing time scale
 */
export default class TimeSlowEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.physics.world.timeScale = effectConfig.timeScale;
  }
}
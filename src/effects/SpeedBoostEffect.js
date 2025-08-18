import BaseEffect from './BaseEffect.js';

/**
 * Speed Boost Effect
 * Increases player movement speed by setting a speed multiplier
 */
export default class SpeedBoostEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.effectSpeedMultiplier = effectConfig.speedMultiplier;
  }
}
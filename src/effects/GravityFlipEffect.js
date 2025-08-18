import BaseEffect from './BaseEffect.js';

/**
 * Gravity Flip Effect
 * Flips gravity by applying a negative multiplier
 */
export default class GravityFlipEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.physics.world.gravity.y = this.originalValues.gravity * effectConfig.gravityMultiplier;
  }
}
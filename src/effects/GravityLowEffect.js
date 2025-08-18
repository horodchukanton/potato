import BaseEffect from './BaseEffect.js';

/**
 * Low Gravity Effect
 * Reduces gravity by applying a multiplier to the world gravity
 */
export default class GravityLowEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.physics.world.gravity.y = this.originalValues.gravity * effectConfig.gravityMultiplier;
  }
}
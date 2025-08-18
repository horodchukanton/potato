import BaseEffect from './BaseEffect.js';

/**
 * Obstacle Reverse Effect
 * Reverses the direction of obstacles by setting negative speed multiplier
 */
export default class ObstacleReverseEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.obstacleSpeedMultiplier = effectConfig.obstacleSpeedMultiplier;
  }
}
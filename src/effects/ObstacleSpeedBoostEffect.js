import BaseEffect from './BaseEffect.js';

/**
 * Obstacle Speed Boost Effect
 * Increases the speed of obstacles
 */
export default class ObstacleSpeedBoostEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.obstacleSpeedMultiplier = effectConfig.obstacleSpeedMultiplier;
  }
}
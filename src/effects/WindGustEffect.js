import BaseEffect from './BaseEffect.js';

/**
 * Wind Gust Effect
 * Applies continuous lateral force to the player
 */
export default class WindGustEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.windForce = effectConfig.windForce;
  }
}
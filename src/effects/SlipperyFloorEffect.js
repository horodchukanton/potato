import BaseEffect from './BaseEffect.js';

/**
 * Slippery Floor Effect
 * Reduces friction making the floor slippery
 */
export default class SlipperyFloorEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      this.getPlayer().body.setDrag(this.originalValues.playerDrag.x * effectConfig.frictionMultiplier);
    }
  }
}
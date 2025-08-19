import BaseEffect from './BaseEffect.js';

/**
 * Slippery Floor Effect
 * Reduces friction making the floor slippery
 */
export default class SlipperyFloorEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      const player = this.getPlayer();
      const newDragValue = this.originalValues.playerDrag.x * effectConfig.frictionMultiplier;
      player.body.setDrag(newDragValue, this.originalValues.playerDrag.y);
    }
  }
}
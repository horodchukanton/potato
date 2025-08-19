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
      // Keep Y drag at 0 for proper gravity behavior
      player.body.setDrag(newDragValue, 0);
    }
  }
}
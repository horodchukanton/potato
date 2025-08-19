import BaseEffect from './BaseEffect.js';

/**
 * Sticky Floor Effect
 * Increases friction making the floor sticky
 */
export default class StickyFloorEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      const player = this.getPlayer();
      const newDragValue = this.originalValues.playerDrag.x * effectConfig.frictionMultiplier;
      // Keep Y drag at 0 for proper gravity behavior
      player.body.setDrag(newDragValue, 0);
    }
  }
}
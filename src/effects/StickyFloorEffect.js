import BaseEffect from './BaseEffect.js';

/**
 * Sticky Floor Effect
 * Increases friction making the floor sticky
 */
export default class StickyFloorEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      this.getPlayer().body.setDrag(this.originalValues.playerDrag.x * effectConfig.frictionMultiplier);
    }
  }
}
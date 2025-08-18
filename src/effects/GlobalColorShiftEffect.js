import BaseEffect from './BaseEffect.js';

/**
 * Global Color Shift Effect
 * Changes the color of all game elements to a specific color
 */
export default class GlobalColorShiftEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.globalColorOverride = effectConfig.globalColor;
    
    // Apply color override to all existing game elements
    if (this.scene.applyGlobalColorOverride) {
      this.scene.applyGlobalColorOverride();
    }
  }
}
import BaseEffect from './BaseEffect.js';

/**
 * Inverted Controls Effect
 * Inverts player movement controls (left becomes right, etc.)
 */
export default class InvertedControlsEffect extends BaseEffect {
  apply(effectConfig) {
    this.scene.invertedControls = effectConfig.invertControls;
  }
}
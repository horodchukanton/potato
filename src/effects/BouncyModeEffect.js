import BaseEffect from './BaseEffect.js';

/**
 * Bouncy Mode Effect
 * Makes the player bouncy by setting bounce properties
 */
export default class BouncyModeEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      this.getPlayer().body.setBounce(effectConfig.playerBounce);
    }
  }
}
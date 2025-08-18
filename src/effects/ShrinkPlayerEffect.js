import BaseEffect from './BaseEffect.js';

/**
 * Shrink Player Effect
 * Shrinks the player and adjusts position to keep them above ground
 */
export default class ShrinkPlayerEffect extends BaseEffect {
  apply(effectConfig) {
    const player = this.getPlayer();
    player.setScale(effectConfig.scaleMultiplier);
    
    // Adjust Y position to keep player above ground when shrunk
    if (this.scene.ground) {
      const groundTop = this.scene.ground.y - this.scene.ground.height / 2;
      const scaledHeight = player.height * effectConfig.scaleMultiplier;
      const newY = groundTop - scaledHeight / 2;
      player.setPosition(player.x, newY);
    }
  }
}
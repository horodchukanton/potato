import BaseEffect from './BaseEffect.js';

/**
 * Shrink Player Effect
 * Shrinks the player and adjusts position to keep them above ground
 * Also reduces speed and jump height to half
 */
export default class ShrinkPlayerEffect extends BaseEffect {
  apply(effectConfig) {
    const player = this.getPlayer();
    player.setScale(effectConfig.scaleMultiplier);
    
    // Reduce speed and jump height to half when shrunk
    this.scene.effectSpeedMultiplier = 0.5;
    this.scene.effectJumpMultiplier = 0.75;
    
    // Adjust Y position to keep player above ground when shrunk
    if (this.scene.ground) {
      const groundTop = this.scene.ground.y - this.scene.ground.height / 2;
      const scaledHeight = player.height * effectConfig.scaleMultiplier;
      const newY = groundTop - scaledHeight / 2;
      player.setPosition(player.x, newY);
    }
  }
}

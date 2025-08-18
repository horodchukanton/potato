import BaseEffect from './BaseEffect.js';

/**
 * Teleport Portal Effect
 * Teleports the player to a random safe position
 */
export default class TeleportPortalEffect extends BaseEffect {
  apply(effectConfig) {
    this.teleportPlayer();
  }

  /**
   * Teleport player to a random safe position
   */
  teleportPlayer() {
    const player = this.getPlayer();
    if (!player.body) return;
    
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    // Random X position (avoid edges)
    const newX = 50 + Math.random() * (gameWidth - 100);
    // Keep Y position reasonable (middle area)
    const newY = gameHeight * 0.3 + Math.random() * (gameHeight * 0.4);
    
    player.setPosition(newX, newY);
    player.body.setVelocity(0, 0); // Stop momentum
  }
}
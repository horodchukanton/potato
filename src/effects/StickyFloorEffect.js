import BaseEffect from './BaseEffect.js';
import { GAME_CONFIG } from '../config.js';

/**
 * Sticky Floor Effect
 * Increases friction making the floor sticky, but only when player is on ground
 */
export default class StickyFloorEffect extends BaseEffect {
  apply(effectConfig) {
    if (this.hasPlayerBody()) {
      const player = this.getPlayer();
      const scene = this.scene;
      
      // Store the sticky drag value
      const stickyDragValue = this.originalValues.playerDrag.x * effectConfig.frictionMultiplier;
      const normalDragValue = this.originalValues.playerDrag.x;
      
      // Create an update handler that checks ground contact and adjusts drag
      const stickyFloorUpdateHandler = () => {
        if (!player.body) return;
        
        // Use the same ground detection logic as the main game
        const playerBottom = player.y + (GAME_CONFIG.PHYSICS.PLAYER_BODY_HEIGHT / 2);
        const groundTop = scene.cameras.main.height - 40; // Ground surface
        const isOnGround = player.body.touching.down || Math.abs(playerBottom - groundTop) <= 2; // 2px tolerance
        
        // Apply sticky drag only when on ground, normal drag when in air
        const targetDrag = isOnGround ? stickyDragValue : normalDragValue;
        
        // Only update if different to avoid unnecessary calls
        if (player.body.drag.x !== targetDrag) {
          player.body.setDrag(targetDrag, 0);
        }
      };
      
      // Store the handler reference for cleanup
      scene.stickyFloorUpdateHandler = stickyFloorUpdateHandler;
      
      // Add the handler to the scene's update event
      scene.events.on('update', stickyFloorUpdateHandler);
      
      // Apply initial state (check if grounded immediately)
      stickyFloorUpdateHandler();
    }
  }
}
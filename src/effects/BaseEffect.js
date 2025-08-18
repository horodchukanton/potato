/**
 * Base class for dynamic effects
 * All effects should extend this class to ensure consistent interface
 */
export default class BaseEffect {
  constructor(scene, originalValues) {
    this.scene = scene;
    this.originalValues = originalValues;
  }

  /**
   * Apply the effect
   * @param {Object} effectConfig - Configuration for this effect from GAME_CONFIG
   */
  apply(effectConfig) {
    throw new Error('apply() method must be implemented by effect subclass');
  }

  /**
   * Get the player object from the scene
   * @returns {Object} Player object
   */
  getPlayer() {
    return this.scene.player;
  }

  /**
   * Helper method to check if player has physics body
   * @returns {boolean} True if player has physics body
   */
  hasPlayerBody() {
    const player = this.getPlayer();
    return player && player.body;
  }
}
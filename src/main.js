import Phaser from 'phaser';
import { GAME_CONFIG, SCENE_KEYS } from './config.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

/**
 * Main game initialization and configuration
 */
class Game {
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
      parent: 'game-container',
      backgroundColor: '#2c3e50',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: GAME_CONFIG.PHYSICS.GRAVITY },
          debug: false
        }
      },
      scene: [
        PreloadScene,
        MenuScene,
        GameScene
      ]
    };

    this.game = new Phaser.Game(this.config);
  }

  /**
   * Get the current Phaser game instance
   */
  getInstance() {
    return this.game;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Phaser Framework Test - Potato Game Starting...');
  console.log('Phaser version:', Phaser.VERSION);
  
  const game = new Game();
  
  // Make game instance available globally for debugging
  window.game = game.getInstance();
  
  console.log('Game initialized successfully!');
});
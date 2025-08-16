import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS } from '../config.js';

/**
 * PreloadScene handles loading all game assets
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  /**
   * Preload all game assets
   */
  preload() {
    // Display loading progress
    this.createLoadingBar();

    // Load placeholder assets (colored rectangles for now)
    this.createPlaceholderAssets();

    // TODO: Load actual game assets when available
    // this.load.image(ASSET_KEYS.PLAYER, 'assets/images/player.png');
    // this.load.image(ASSET_KEYS.BUBBLE, 'assets/images/bubble.png');
    // this.load.audio(ASSET_KEYS.COLLECT_SOUND, 'assets/audio/collect.wav');
  }

  /**
   * Create placeholder colored rectangles as temporary assets
   */
  createPlaceholderAssets() {
    // Create colored rectangles as placeholders
    this.load.image(ASSET_KEYS.PLAYER, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image(ASSET_KEYS.BUBBLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image(ASSET_KEYS.OBSTACLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.load.image(ASSET_KEYS.BACKGROUND, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  /**
   * Create a simple loading progress bar
   */
  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Progress bar background
    const progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x444444);
    const progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x00ff00);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.width = 400 * value;
      progressBar.x = (width / 2 - 200) + (progressBar.width / 2);
    });

    this.load.on('complete', () => {
      loadingText.setText('Loading Complete!');
    });
  }

  /**
   * Start the main game scene after loading
   */
  create() {
    // Small delay to show loading complete message
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
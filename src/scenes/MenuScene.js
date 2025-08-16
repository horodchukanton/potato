import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '../config.js';

/**
 * MenuScene provides the main menu interface
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  /**
   * Create the main menu UI
   */
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background color
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Title
    this.add.text(width / 2, height / 3, 'POTATO', {
      font: 'bold 48px Arial',
      fill: '#f39c12',
      stroke: '#34495e',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'Birthday Game', {
      font: '24px Arial',
      fill: '#ecf0f1'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
      font: 'bold 24px Arial',
      fill: '#e74c3c',
      backgroundColor: '#34495e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Make start button interactive
    startButton.setInteractive({ useHandCursor: true });
    
    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#c0392b' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#e74c3c' });
    });

    startButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    // Instructions - responsive based on device
    const isMobile = this.sys.game.device.input.touch;
    const instructionText = isMobile 
      ? 'Tap LEFT/RIGHT to move and TAP UPPER RIGHT to jump\nCollect bubbles and avoid obstacles!'
      : 'Use ARROW KEYS to move and SPACE to jump\nCollect bubbles and avoid obstacles!';
    
    this.add.text(width / 2, height - 100, instructionText, {
      font: '16px Arial',
      fill: '#bdc3c7',
      align: 'center'
    }).setOrigin(0.5);

    // Version info
    this.add.text(10, height - 30, 'Phaser Framework Test Scene', {
      font: '12px Arial',
      fill: '#7f8c8d'
    });
  }
}
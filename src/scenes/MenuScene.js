import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, UI_TEXT } from '../config.js';
import GameStateManager from '../utils/GameStateManager.js';

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

    // Check for saved progress
    const progressSummary = GameStateManager.getProgressSummary();
    const hasProgress = progressSummary.bubblesCollected > 0 || progressSummary.tetrisLines > 0;

    let buttonY = height / 2 + 50;

    // Show progress if exists
    if (hasProgress) {
      const progressText = `Progress: ${progressSummary.bubblesCollected}/${progressSummary.bubblesTarget} bubbles`;
      this.add.text(width / 2, height / 2 - 20, progressText, {
        font: '18px Arial',
        fill: '#95a5a6'
      }).setOrigin(0.5);

      if (progressSummary.tetrisLines > 0) {
        const tetrisText = `Tetris: ${progressSummary.tetrisLines}/${progressSummary.tetrisTarget} lines`;
        this.add.text(width / 2, height / 2, tetrisText, {
          font: '18px Arial',
          fill: '#95a5a6'
        }).setOrigin(0.5);
      }

      buttonY = height / 2 + 80;
    }

    // Start/Resume button
    const startButtonText = hasProgress ? 'Resume Game' : 'Start Game';
    const startButton = this.add.text(width / 2, buttonY, startButtonText, {
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
      // Resume from appropriate scene based on progress
      const resumeScene = GameStateManager.getResumeScene();
      this.scene.start(resumeScene);
    });

    // New Game button (only show if there's progress)
    if (hasProgress) {
      const newGameButton = this.add.text(width / 2, buttonY + 60, 'New Game', {
        font: 'bold 20px Arial',
        fill: '#3498db',
        backgroundColor: '#34495e',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);

      newGameButton.setInteractive({ useHandCursor: true });
      
      newGameButton.on('pointerover', () => {
        newGameButton.setStyle({ fill: '#2980b9' });
      });

      newGameButton.on('pointerout', () => {
        newGameButton.setStyle({ fill: '#3498db' });
      });

      newGameButton.on('pointerdown', () => {
        // Clear progress and start new game
        GameStateManager.clearProgress();
        this.scene.start(SCENE_KEYS.GAME);
      });

      buttonY += 120;
    } else {
      buttonY += 80;
    }

    // Instructions - responsive based on device
    const isMobile = this.sys.game.device.input.touch;
    const instructionText = isMobile 
      ? `${UI_TEXT.INSTRUCTIONS.MOBILE}\nCollect bubbles and avoid obstacles!`
      : `${UI_TEXT.INSTRUCTIONS.DESKTOP}\nCollect bubbles and avoid obstacles!`;
    
    this.add.text(width / 2, buttonY + 20, instructionText, {
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
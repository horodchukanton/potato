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

    // Smooth fade in from black (with safety check for test environment)
    if (this.cameras.main.fadeIn) {
      this.cameras.main.fadeIn(GAME_CONFIG.EFFECTS.TRANSITIONS.FADE_DURATION, 0, 0, 0);
    }

    // Title with entrance animation
    const title = this.add.text(width / 2, height / 3, 'POTATO', {
      font: 'bold 48px Arial',
      fill: '#f39c12',
      stroke: '#34495e',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Set initial animation properties with safety checks
    if (title.setAlpha) title.setAlpha(0);
    if (title.setScale) title.setScale(0.5);

    // Animate title entrance (with safety check for tweens)
    if (this.tweens && this.tweens.add) {
      this.tweens.add({
        targets: title,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0.5, to: 1 },
        scaleY: { from: 0.5, to: 1 },
        duration: 600,
        ease: 'Back.easeOut',
        delay: 200
      });

      // Add gentle floating animation to title
      this.tweens.add({
        targets: title,
        y: title.y - 10,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 800
      });
    }

    // Subtitle with delayed entrance
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Birthday Game', {
      font: '24px Arial',
      fill: '#ecf0f1'
    }).setOrigin(0.5);
    
    if (subtitle.setAlpha) subtitle.setAlpha(0);

    if (this.tweens && this.tweens.add) {
      this.tweens.add({
        targets: subtitle,
        alpha: { from: 0, to: 1 },
        y: subtitle.y - 20,
        duration: 500,
        ease: 'Power2.easeOut',
        delay: 600
      });
    }

    // Check for saved progress
    const progressSummary = GameStateManager.getProgressSummary();
    const hasProgress = progressSummary.bubblesCollected > 0 || progressSummary.tetrisLines > 0;

    let buttonY = height / 2 + 50;
    const uiElements = []; // Track elements for staggered animation

    // Show progress if exists
    if (hasProgress) {
      const progressText = this.add.text(width / 2, height / 2 - 20, 
        `Progress: ${progressSummary.bubblesCollected}/${progressSummary.bubblesTarget} bubbles`, {
        font: '18px Arial',
        fill: '#95a5a6'
      }).setOrigin(0.5);
      if (progressText.setAlpha) progressText.setAlpha(0);
      uiElements.push(progressText);

      if (progressSummary.tetrisLines > 0) {
        const tetrisText = this.add.text(width / 2, height / 2, 
          `Tetris: ${progressSummary.tetrisLines}/${progressSummary.tetrisTarget} lines`, {
          font: '18px Arial',
          fill: '#95a5a6'
        }).setOrigin(0.5);
        if (tetrisText.setAlpha) tetrisText.setAlpha(0);
        uiElements.push(tetrisText);
      }

      buttonY = height / 2 + 80;
    }

    // Start/Resume button with enhanced interactivity
    const startButtonText = hasProgress ? 'Resume Game' : 'Start Game';
    const startButton = this.add.text(width / 2, buttonY, startButtonText, {
      font: 'bold 24px Arial',
      fill: '#e74c3c',
      backgroundColor: '#34495e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    if (startButton.setAlpha) startButton.setAlpha(0);
    uiElements.push(startButton);

    // Enhanced button interactivity
    this.setupButtonInteractivity(startButton, '#e74c3c', '#c0392b', () => {
      this.transitionToScene(GameStateManager.getResumeScene());
    });

    // New Game button (only show if there's progress)
    if (hasProgress) {
      const newGameButton = this.add.text(width / 2, buttonY + 60, 'New Game', {
        font: 'bold 20px Arial',
        fill: '#3498db',
        backgroundColor: '#34495e',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);
      if (newGameButton.setAlpha) newGameButton.setAlpha(0);
      uiElements.push(newGameButton);

      this.setupButtonInteractivity(newGameButton, '#3498db', '#2980b9', () => {
        GameStateManager.clearProgress();
        this.transitionToScene(SCENE_KEYS.GAME);
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
    
    const instructions = this.add.text(width / 2, buttonY + 20, instructionText, {
      font: '16px Arial',
      fill: '#bdc3c7',
      align: 'center'
    }).setOrigin(0.5);
    if (instructions.setAlpha) instructions.setAlpha(0);
    uiElements.push(instructions);

    // Version info
    const versionInfo = this.add.text(10, height - 30, 'Phaser Framework Test Scene', {
      font: '12px Arial',
      fill: '#7f8c8d'
    });
    if (versionInfo.setAlpha) versionInfo.setAlpha(0);
    uiElements.push(versionInfo);

    // Animate all UI elements with staggered entrance
    this.animateUIElements(uiElements);
  }

  /**
   * Setup enhanced button interactivity with animations
   */
  setupButtonInteractivity(button, normalColor, hoverColor, onClick) {
    if (!button.setInteractive) return; // Safety check for test environment
    
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      button.setStyle({ fill: hoverColor });
      if (this.tweens && this.tweens.add) {
        this.tweens.add({
          targets: button,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2.easeOut'
        });
      }
    });

    button.on('pointerout', () => {
      button.setStyle({ fill: normalColor });
      if (this.tweens && this.tweens.add) {
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2.easeOut'
        });
      }
    });

    button.on('pointerdown', () => {
      // Button press animation
      if (this.tweens && this.tweens.add) {
        this.tweens.add({
          targets: button,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 100,
          yoyo: true,
          ease: 'Power2.easeOut',
          onComplete: onClick
        });
      } else {
        onClick();
      }
    });
  }

  /**
   * Animate UI elements with staggered entrance
   */
  animateUIElements(elements) {
    if (!this.tweens || !this.tweens.add) return; // Safety check for test environment
    
    elements.forEach((element, index) => {
      this.tweens.add({
        targets: element,
        alpha: { from: 0, to: 1 },
        y: element.y - 20,
        duration: 400,
        ease: 'Power2.easeOut',
        delay: 800 + (index * 100)
      });
    });
  }

  /**
   * Smooth transition to another scene
   */
  transitionToScene(sceneKey) {
    if (this.cameras.main.fadeOut) {
      this.cameras.main.fadeOut(GAME_CONFIG.EFFECTS.TRANSITIONS.FADE_DURATION, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(sceneKey);
      });
    } else {
      // Fallback for test environment
      this.scene.start(sceneKey);
    }
  }
}
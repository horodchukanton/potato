import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, ASSET_KEYS } from '../config.js';

/**
 * GameScene handles the main running and collecting gameplay
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  /**
   * Initialize scene data
   */
  init() {
    this.bubblesCollected = 0;
    this.cursors = null;
    this.player = null;
    this.bubbles = null;
    this.obstacles = null;
  }

  /**
   * Create the game world and objects
   */
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

    // Create player
    this.createPlayer();

    // Create input controls
    this.createControls();

    // Create groups for game objects
    this.createGameGroups();

    // Create initial bubbles and obstacles
    this.createInitialObjects();

    // Create UI elements
    this.createUI();

    // Set up physics and collisions
    this.setupPhysics();

    // Start spawning objects
    this.startObjectSpawning();
  }

  /**
   * Create the player character
   */
  createPlayer() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create ground platform for the player to stand on
    this.ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x8B4513);
    this.physics.add.existing(this.ground, true); // true makes it static
    
    // Create player as a colored rectangle for now
    this.player = this.add.rectangle(100, height - 60, 32, 48, 0xe74c3c);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 48);
    
    // Add collision between player and ground
    this.physics.add.collider(this.player, this.ground);
  }

  /**
   * Create input controls
   */
  createControls() {
    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Touch/mobile controls
    this.createTouchControls();
  }

  /**
   * Create touch controls for mobile devices
   */
  createTouchControls() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Touch input state
    this.touchInput = {
      left: false,
      right: false,
      jump: false
    };
    
    // Create invisible touch areas for better mobile experience
    // Left side for moving left
    this.leftTouchArea = this.add.rectangle(0, 0, width * 0.3, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive()
      .setDepth(-1);
    
    // Right side for moving right  
    this.rightTouchArea = this.add.rectangle(width * 0.3, 0, width * 0.4, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive()
      .setDepth(-1);
    
    // Jump area (top portion of screen)
    this.jumpTouchArea = this.add.rectangle(width * 0.7, 0, width * 0.3, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive()
      .setDepth(-1);
    
    // Touch events for left movement
    this.leftTouchArea.on('pointerdown', () => {
      this.touchInput.left = true;
    });
    
    this.leftTouchArea.on('pointerup', () => {
      this.touchInput.left = false;
    });
    
    this.leftTouchArea.on('pointerout', () => {
      this.touchInput.left = false;
    });
    
    // Touch events for right movement
    this.rightTouchArea.on('pointerdown', () => {
      this.touchInput.right = true;
    });
    
    this.rightTouchArea.on('pointerup', () => {
      this.touchInput.right = false;
    });
    
    this.rightTouchArea.on('pointerout', () => {
      this.touchInput.right = false;
    });
    
    // Touch events for jumping
    this.jumpTouchArea.on('pointerdown', () => {
      this.touchInput.jump = true;
    });
    
    this.jumpTouchArea.on('pointerup', () => {
      this.touchInput.jump = false;
    });
    
    this.jumpTouchArea.on('pointerout', () => {
      this.touchInput.jump = false;
    });
    
    // Add visual indicators for touch controls (semi-transparent)
    this.createTouchIndicators();
  }

  /**
   * Create visual indicators for touch controls
   */
  createTouchIndicators() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Only show touch indicators on mobile devices
    const isMobile = this.sys.game.device.input.touch;
    const alpha = isMobile ? GAME_CONFIG.TOUCH.NORMAL_ALPHA : 0;
    
    // Left arrow indicator
    this.leftIndicator = this.add.text(width * 0.15, height - 80, '←', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(alpha);
    
    // Right arrow indicator  
    this.rightIndicator = this.add.text(width * 0.5, height - 80, '→', {
      font: 'bold 32px Arial',
      fill: '#ffffff', 
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(alpha);
    
    // Jump indicator
    this.jumpIndicator = this.add.text(width * 0.85, height - 80, '↑', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000', 
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(alpha);
  }

  /**
   * Create groups for organizing game objects
   */
  createGameGroups() {
    this.bubbles = this.physics.add.group();
    this.obstacles = this.physics.add.group();
  }

  /**
   * Create initial game objects
   */
  createInitialObjects() {
    // Create a few initial bubbles
    for (let i = 0; i < 3; i++) {
      this.createBubble();
    }
  }

  /**
   * Create UI elements
   */
  createUI() {
    this.bubblesText = this.add.text(16, 16, 'Bubbles: 0', {
      font: '18px Arial',
      fill: '#2c3e50',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    });

    // Responsive instructions based on device type
    const isMobile = this.sys.game.device.input.touch;
    const instructionText = isMobile 
      ? 'Tap Left/Right to Move | Tap Upper Right to Jump'
      : 'Arrow Keys: Move | Space: Jump';
    
    this.instructionsText = this.add.text(16, 50, instructionText, {
      font: '14px Arial',
      fill: '#2c3e50',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    });

    // Back to menu button
    const menuButton = this.add.text(this.cameras.main.width - 16, 16, 'Menu', {
      font: '16px Arial',
      fill: '#e74c3c',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);

    menuButton.setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  /**
   * Set up physics and collision detection
   */
  setupPhysics() {
    // Player collects bubbles
    this.physics.add.overlap(this.player, this.bubbles, this.collectBubble, null, this);

    // Player hits obstacles (for future implementation)
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
  }

  /**
   * Start spawning bubbles and obstacles periodically
   */
  startObjectSpawning() {
    // Spawn bubbles every 2-4 seconds
    this.bubbleTimer = this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: this.createBubble,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Create a bubble at a random position
   */
  createBubble() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const x = Phaser.Math.Between(width, width - 200);
    const y = Phaser.Math.Between(100, height - 100);
    
    const bubble = this.add.circle(x, y, 16, 0x3498db);
    this.physics.add.existing(bubble);
    bubble.body.setVelocityX(-100);
    this.bubbles.add(bubble);

    // Remove bubble when it goes off screen
    bubble.body.checkWorldBounds = true;
    bubble.body.outOfBoundsKill = true;
  }

  /**
   * Handle bubble collection
   */
  collectBubble(player, bubble) {
    bubble.destroy();
    this.bubblesCollected++;
    this.bubblesText.setText(`Bubbles: ${this.bubblesCollected}`);

    // Check if reached target
    if (this.bubblesCollected >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET) {
      this.showTetrisPrompt();
    }
  }

  /**
   * Handle obstacle collision
   */
  hitObstacle(player, obstacle) {
    // Simple reaction for now - just bounce back a bit
    player.body.setVelocityX(-50);
  }

  /**
   * Show prompt to play Tetris phase
   */
  showTetrisPrompt() {
    // Simple alert for now - will be replaced with proper dialog
    const confirmed = confirm(`You collected ${GAME_CONFIG.BUBBLE_COLLECTION_TARGET} bubbles! Play Tetris phase?`);
    if (confirmed) {
      console.log('Would transition to Tetris scene');
      // this.scene.start(SCENE_KEYS.TETRIS);
    }
  }

  /**
   * Update loop - handle player movement and game logic
   */
  update() {
    this.handlePlayerMovement();
  }

  /**
   * Handle player input and movement
   */
  handlePlayerMovement() {
    const player = this.player;
    const cursors = this.cursors;
    const touch = this.touchInput;
    const isMobile = this.sys.game.device.input.touch;

    // Horizontal movement (keyboard or touch)
    if (cursors.left.isDown || touch.left) {
      player.body.setVelocityX(-GAME_CONFIG.PHYSICS.PLAYER_SPEED);
      // Visual feedback for touch
      if (touch.left && isMobile) {
        this.leftIndicator.setAlpha(GAME_CONFIG.TOUCH.FEEDBACK_ALPHA);
      }
    } else if (cursors.right.isDown || touch.right) {
      player.body.setVelocityX(GAME_CONFIG.PHYSICS.PLAYER_SPEED);
      // Visual feedback for touch
      if (touch.right && isMobile) {
        this.rightIndicator.setAlpha(GAME_CONFIG.TOUCH.FEEDBACK_ALPHA);
      }
    } else {
      player.body.setVelocityX(0);
      // Reset visual feedback
      if (isMobile) {
        this.leftIndicator.setAlpha(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
        this.rightIndicator.setAlpha(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      }
    }

    // Jumping (keyboard or touch)
    if ((this.spaceKey.isDown || touch.jump) && player.body.touching.down) {
      player.body.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      // Visual feedback for touch
      if (touch.jump && isMobile) {
        this.jumpIndicator.setAlpha(GAME_CONFIG.TOUCH.FEEDBACK_ALPHA);
      }
    } else {
      // Reset jump visual feedback
      if (!touch.jump && isMobile) {
        this.jumpIndicator.setAlpha(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      }
    }
  }
}

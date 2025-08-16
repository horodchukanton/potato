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

    // Create player as a colored rectangle for now
    this.player = this.add.rectangle(100, height - 100, 32, 48, 0xe74c3c);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 48);
  }

  /**
   * Create input controls
   */
  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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

    this.instructionsText = this.add.text(16, 50, 'Arrow Keys: Move | Space: Jump', {
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
    
    const x = Phaser.Math.Between(width + 50, width + 200);
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

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-GAME_CONFIG.PHYSICS.PLAYER_SPEED);
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(GAME_CONFIG.PHYSICS.PLAYER_SPEED);
    } else {
      player.body.setVelocityX(0);
    }

    // Jumping
    if (this.spaceKey.isDown && player.body.touching.down) {
      player.body.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
    }
  }
}
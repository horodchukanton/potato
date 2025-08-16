import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, ASSET_KEYS, STORAGE_KEYS } from '../config.js';

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
    // Load saved progress from localStorage
    this.bubblesCollected = this.loadProgress();
    this.firstBubbleCollected = this.loadFirstBubbleFlag();
    
    this.cursors = null;
    this.player = null;
    this.bubbles = null;
    this.obstacles = null;
    this.playerLives = GAME_CONFIG.OBSTACLES.LIVES;
    this.gameOver = false;
    this.invulnerable = false;
    this.invulnerabilityTimer = null;
  }

  /**
   * Load bubble collection progress from localStorage
   */
  loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEYS.BUBBLES_COLLECTED);
    return saved ? parseInt(saved, 10) : 0;
  }

  /**
   * Load first bubble collection flag from localStorage
   */
  loadFirstBubbleFlag() {
    const saved = localStorage.getItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED);
    return saved === 'true';
  }

  /**
   * Save bubble collection progress to localStorage
   */
  saveProgress() {
    localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, this.bubblesCollected.toString());
  }

  /**
   * Save first bubble collection flag to localStorage
   */
  saveFirstBubbleFlag() {
    localStorage.setItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED, 'true');
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
    this.bubblesText = this.add.text(16, 16, `Bubbles: ${this.bubblesCollected}`, {
      font: '18px Arial',
      fill: '#2c3e50',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    });

    // Lives display
    this.livesText = this.add.text(16, 42, `Lives: ${this.playerLives}`, {
      font: '18px Arial',
      fill: '#e74c3c',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    });

    // Responsive instructions based on device type
    const isMobile = this.sys.game.device.input.touch;
    const instructionText = isMobile 
      ? 'Tap Left/Right to Move | Tap Upper Right to Jump'
      : 'Arrow Keys: Move | Space: Jump';
    
    this.instructionsText = this.add.text(16, 76, instructionText, {
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

    // Spawn obstacles every 3-6 seconds
    this.obstacleTimer = this.time.addEvent({
      delay: Phaser.Math.Between(GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN, GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX),
      callback: this.createObstacle,
      callbackScope: this,
      loop: true
    });

    // Create an immediate obstacle for testing
    this.time.delayedCall(1000, this.createObstacle, [], this);
  }

  /**
   * Create a bubble at a random position
   */
  createBubble() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const x = Phaser.Math.Between(width, width + 200);
    const y = Phaser.Math.Between(100, height - 100);
    
    const bubble = this.add.circle(x, y, GAME_CONFIG.BUBBLES.RADIUS, GAME_CONFIG.BUBBLES.COLOR);
    this.physics.add.existing(bubble);
    
    // Set diagonal movement with X speed matching obstacles and random Y movement
    bubble.body.setVelocityX(GAME_CONFIG.BUBBLES.SPEED_X);
    bubble.body.setVelocityY(Phaser.Math.Between(GAME_CONFIG.BUBBLES.SPEED_Y_MIN, GAME_CONFIG.BUBBLES.SPEED_Y_MAX));
    
    this.bubbles.add(bubble);

    // Remove bubble when it goes off screen
    bubble.body.checkWorldBounds = true;
    bubble.body.outOfBoundsKill = true;
  }

  /**
   * Create an obstacle with procedural generation
   */
  createObstacle() {
    if (this.gameOver) return;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Generate obstacle properties
    const obstacleHeight = Phaser.Math.Between(GAME_CONFIG.OBSTACLES.MIN_HEIGHT, GAME_CONFIG.OBSTACLES.MAX_HEIGHT);
    const obstacleWidth = GAME_CONFIG.OBSTACLES.WIDTH;
    
    // Position obstacle just off-screen to the right, on the ground
    const x = width + (obstacleWidth / 2); // Start just off-screen
    const y = height - 40 - (obstacleHeight / 2); // Ground level minus half obstacle height
    
    // Create obstacle as a grey rock-like rectangle
    const obstacle = this.add.rectangle(x, y, obstacleWidth, obstacleHeight, GAME_CONFIG.OBSTACLES.COLOR);
    
    // Add some visual detail to make it look more rock-like
    obstacle.setStrokeStyle(2, 0x606060); // Darker grey outline
    
    // Add physics for collision detection only
    this.physics.add.existing(obstacle);
    obstacle.body.setImmovable(true);
    
    // Store initial position and movement data
    obstacle.initialY = y;
    obstacle.moveSpeed = GAME_CONFIG.OBSTACLES.SPEED;
    
    this.obstacles.add(obstacle);

    // Update the timer for next obstacle spawn with randomized delay
    this.obstacleTimer.delay = Phaser.Math.Between(
      GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN, 
      GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX
    );
  }

  /**
   * Trigger cutscene/animation for first bubble collection
   */
  triggerFirstBubbleCutscene() {
    // Pause game temporarily
    this.physics.pause();
    
    // Create glowing effect on player's belly
    const glowEffect = this.add.circle(this.player.x, this.player.y + 10, 20, 0xffff00, 0.6);
    
    // Animate the glow effect
    this.tweens.add({
      targets: glowEffect,
      alpha: { from: 0.6, to: 0.2 },
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 1000,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        glowEffect.destroy();
        this.physics.resume();
      }
    });

    // Show cutscene message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const cutsceneText = this.add.text(width / 2, height / 2 - 100, 'Magic energy flows through you!', {
      font: 'bold 24px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);

    // Fade out the cutscene text
    this.tweens.add({
      targets: cutsceneText,
      alpha: { from: 1, to: 0 },
      duration: 3000,
      onComplete: () => {
        cutsceneText.destroy();
      }
    });
  }

  /**
   * Handle bubble collection
   */
  collectBubble(player, bubble) {
    bubble.destroy();
    this.bubblesCollected++;
    this.bubblesText.setText(`Bubbles: ${this.bubblesCollected}`);

    // Save progress to localStorage
    this.saveProgress();

    // Trigger cutscene on first bubble collection
    if (!this.firstBubbleCollected) {
      this.firstBubbleCollected = true;
      this.saveFirstBubbleFlag();
      this.triggerFirstBubbleCutscene();
    }

    // Check if reached target
    if (this.bubblesCollected >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET) {
      this.showTetrisPrompt();
    }
  }

  /**
   * Handle obstacle collision
   */
  hitObstacle(player, obstacle) {
    // Don't take damage if already invulnerable or game is over
    if (this.invulnerable || this.gameOver) return;

    // Take damage
    this.playerLives -= GAME_CONFIG.OBSTACLES.DAMAGE;
    this.livesText.setText(`Lives: ${this.playerLives}`);

    // Player knockback effect
    player.body.setVelocityX(-150);
    player.body.setVelocityY(-200);

    // Make player temporarily invulnerable
    this.invulnerable = true;
    this.player.setFillStyle(0xff0000); // Red color to show damage

    // Clear existing invulnerability timer if any
    if (this.invulnerabilityTimer) {
      this.invulnerabilityTimer.remove();
    }

    // Set invulnerability timer
    this.invulnerabilityTimer = this.time.delayedCall(2000, () => {
      this.invulnerable = false;
      this.player.setFillStyle(0xe74c3c); // Restore original player color
      this.invulnerabilityTimer = null;
    });

    // Check for game over
    if (this.playerLives <= 0) {
      this.gameOver = true;
      this.showGameOverScreen();
    }

    // Remove the obstacle that was hit
    obstacle.destroy();
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
   * Show game over screen with restart option
   */
  showGameOverScreen() {
    // Stop all timers
    if (this.bubbleTimer) this.bubbleTimer.remove();
    if (this.obstacleTimer) this.obstacleTimer.remove();

    // Create semi-transparent overlay
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      font: 'bold 48px Arial',
      fill: '#e74c3c',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Score display
    const scoreText = this.add.text(width / 2, height / 2, `Bubbles Collected: ${this.bubblesCollected}`, {
      font: '24px Arial',
      fill: '#ecf0f1'
    }).setOrigin(0.5);

    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 60, 'Restart Game', {
      font: 'bold 20px Arial',
      fill: '#27ae60',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Menu button
    const menuButton = this.add.text(width / 2, height / 2 + 110, 'Back to Menu', {
      font: '18px Arial',
      fill: '#3498db',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Make buttons interactive
    restartButton.setInteractive({ useHandCursor: true });
    menuButton.setInteractive({ useHandCursor: true });

    // Button hover effects
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#2ecc71' });
    });

    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#27ae60' });
    });

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ fill: '#5dade2' });
    });

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ fill: '#3498db' });
    });

    // Button click events
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });

    menuButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  /**
   * Update loop - handle player movement and game logic
   */
  update() {
    // Don't process movement if game is over
    if (this.gameOver) return;
    
    this.handlePlayerMovement();
    this.updateObstacles();
  }

  /**
   * Update obstacle positions manually
   */
  updateObstacles() {
    if (!this.obstacles) return;
    
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.active) {
        // Move obstacle left using delta time for smooth movement
        obstacle.x += obstacle.moveSpeed * this.game.loop.delta / 1000;
        
        // Keep at correct Y position (fix the Y drift issue)
        if (obstacle.initialY) {
          obstacle.y = obstacle.initialY;
        }
        
        // Remove when off-screen
        if (obstacle.x < -obstacle.width) {
          obstacle.destroy();
        }
      }
    });
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

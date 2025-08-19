import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, ASSET_KEYS, STORAGE_KEYS } from '../config.js';
import GameStateManager from '../utils/GameStateManager.js';
import DynamicEffectsManager from '../utils/DynamicEffectsManager.js';

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
    // Load saved progress from localStorage using GameStateManager
    const gameState = GameStateManager.loadGameState();
    this.bubblesCollected = gameState.bubblesCollected;
    this.firstBubbleCollected = gameState.firstBubbleCollected;
    this.playerLives = gameState.playerLives;
    this.audioEnabled = gameState.audioEnabled;
    
    // Save current phase as game scene only if it has changed
    const currentPhase = gameState.currentPhase;
    if (currentPhase !== SCENE_KEYS.GAME) {
      GameStateManager.saveCurrentPhase(SCENE_KEYS.GAME);
    }
    
    this.cursors = null;
    this.player = null;
    this.bubbles = null;
    this.obstacles = null;
    this.gameOver = false;
    this.invulnerable = false;
    this.invulnerabilityTimer = null;
    this.tetrisPromptShowing = false;
    this.cutscenePlaying = false;
    
    // Dynamic effects system properties
    this.dynamicEffectsManager = null;
    this.effectSpeedMultiplier = 1.0;
    this.invertedControls = false;
    this.windForce = 0;
    this.obstacleSpeedMultiplier = 1.0;
    this.obstacleColorOverride = null;
  }

  /**
   * Create the game world and objects
   */
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Smooth fade in from black (with safety check for test environment)
    if (this.cameras.main.fadeIn) {
      this.cameras.main.fadeIn(GAME_CONFIG.EFFECTS.TRANSITIONS.FADE_DURATION, 0, 0, 0);
    }

    // Background - use tiled background sprite
    this.add.tileSprite(0, 0, width, height, ASSET_KEYS.BACKGROUND).setOrigin(0, 0);

    // Initialize particle systems
    this.createParticleSystems();

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

    // Initialize audio
    this.initializeAudio();

    // Set up physics and collisions
    this.setupPhysics();

    // Start spawning objects
    this.startObjectSpawning();
    
    // Initialize and start dynamic effects system
    this.dynamicEffectsManager = new DynamicEffectsManager(this);
    this.dynamicEffectsManager.start();
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
    
    // Create player using custom sprite
    this.player = this.add.image(100, height - 60, ASSET_KEYS.PLAYER);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 48);
    
    // Set default drag for friction-based effects to work properly
    this.player.body.setDrag(GAME_CONFIG.PHYSICS.PLAYER_DEFAULT_DRAG);
    
    // Store original player color tint for global color effects
    this.originalPlayerTint = 0xffffff; // Default white tint
    
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
   * Create particle systems for visual effects
   */
  createParticleSystems() {
    // Safety check for test environment
    if (!this.add.graphics || !this.add.particles) {
      // In test environment, create mock emitters
      this.bubbleCollectEmitter = { explode: () => {}, startFollow: () => {}, start: () => {}, stopFollow: () => {}, stop: () => {} };
      this.obstacleHitEmitter = { explode: () => {} };
      this.playerTrailEmitter = { setPosition: () => {}, start: () => {}, stop: () => {} };
      return;
    }

    // Create simple colored rectangles for particles since we don't have sprite assets
    const particleTexture = this.add.graphics();
    particleTexture.fillStyle(0xffffff);
    particleTexture.fillRect(0, 0, 4, 4);
    particleTexture.generateTexture('particle', 4, 4);
    particleTexture.destroy();

    // Bubble collection particle emitter
    this.bubbleCollectEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.SPEED_MIN, 
               max: GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.SPEED_MAX },
      lifespan: GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.LIFE_SPAN,
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 1, end: 0 },
      tint: GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.COLORS,
      frequency: -1, // Manual emission
      quantity: GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.PARTICLE_COUNT
    });

    // Obstacle hit particle emitter
    this.obstacleHitEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.SPEED_MIN, 
               max: GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.SPEED_MAX },
      lifespan: GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.LIFE_SPAN,
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 1, end: 0 },
      tint: GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.COLORS,
      frequency: -1, // Manual emission
      quantity: GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.PARTICLE_COUNT
    });

    // Player movement trail emitter (continuous)
    this.playerTrailEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: GAME_CONFIG.EFFECTS.PARTICLES.PLAYER_TRAIL.SPEED_MIN, 
               max: GAME_CONFIG.EFFECTS.PARTICLES.PLAYER_TRAIL.SPEED_MAX },
      lifespan: GAME_CONFIG.EFFECTS.PARTICLES.PLAYER_TRAIL.LIFE_SPAN,
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      tint: GAME_CONFIG.EFFECTS.PARTICLES.PLAYER_TRAIL.COLORS,
      frequency: 100, // Emit continuously
      quantity: GAME_CONFIG.EFFECTS.PARTICLES.PLAYER_TRAIL.PARTICLE_COUNT
    });
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
      this.transitionToScene(SCENE_KEYS.MENU);
    });

    // Audio toggle button
    this.audioButton = this.add.text(this.cameras.main.width - 16, 42, 
      this.audioEnabled ? 'Audio: ON' : 'Audio: OFF', {
      font: '14px Arial',
      fill: this.audioEnabled ? '#27ae60' : '#95a5a6',
      backgroundColor: '#ecf0f1',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);

    this.audioButton.setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', () => {
      this.toggleAudio();
      this.audioButton.setText(this.audioEnabled ? 'Audio: ON' : 'Audio: OFF');
      this.audioButton.setFill(this.audioEnabled ? '#27ae60' : '#95a5a6');
    });
  }

  /**
   * Initialize audio system and load sounds
   */
  initializeAudio() {
    // Initialize sound objects if audio is available and enabled
    this.sounds = {};
    
    if (this.audioEnabled && this.sound && this.sound.add) {
      try {
        this.sounds.collect = this.sound.add(ASSET_KEYS.COLLECT_SOUND, { 
          volume: GAME_CONFIG.AUDIO.EFFECTS_VOLUME 
        });
        this.sounds.jump = this.sound.add(ASSET_KEYS.JUMP_SOUND, { 
          volume: GAME_CONFIG.AUDIO.EFFECTS_VOLUME 
        });
        this.sounds.obstacleHit = this.sound.add(ASSET_KEYS.OBSTACLE_HIT_SOUND, { 
          volume: GAME_CONFIG.AUDIO.EFFECTS_VOLUME 
        });
        this.sounds.backgroundMusic = this.sound.add(ASSET_KEYS.BACKGROUND_MUSIC, { 
          volume: GAME_CONFIG.AUDIO.MUSIC_VOLUME,
          loop: true
        });
        
        // Start background music
        if (this.sounds.backgroundMusic) {
          this.sounds.backgroundMusic.play();
        }
      } catch (error) {
        // Gracefully handle audio loading errors
        console.warn('Audio initialization failed:', error);
        this.sounds = {};
      }
    }
  }

  /**
   * Play a sound effect if audio is enabled
   * @param {string} soundKey - Key of the sound to play
   */
  playSound(soundKey) {
    if (this.audioEnabled && this.sounds && this.sounds[soundKey]) {
      try {
        this.sounds[soundKey].play();
      } catch (error) {
        // Gracefully handle playback errors
        console.warn(`Failed to play sound ${soundKey}:`, error);
      }
    }
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    GameStateManager.saveAudioEnabled(this.audioEnabled);
    
    if (this.audioEnabled) {
      // Re-initialize audio if enabling
      this.initializeAudio();
    } else {
      // Stop all sounds if disabling
      if (this.sounds.backgroundMusic && this.sounds.backgroundMusic.isPlaying) {
        this.sounds.backgroundMusic.stop();
      }
    }
  }

  /**
   * Set background music playback speed
   * @param {number} speed - Playback rate (1.0 = normal, 2.0 = double speed, etc.)
   */
  setMusicSpeed(speed) {
    if (this.audioEnabled && this.sounds && this.sounds.backgroundMusic) {
      try {
        // Phaser uses setRate method to change playback speed
        this.sounds.backgroundMusic.setRate(speed);
      } catch (error) {
        console.warn('Failed to set music speed:', error);
      }
    }
  }

  /**
   * Speed up background music for dynamic effects
   */
  speedUpMusic() {
    this.setMusicSpeed(1.5); // 50% faster
  }

  /**
   * Reset background music to normal speed
   */
  resetMusicSpeed() {
    this.setMusicSpeed(1.0); // Normal speed
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
    
    // Spawn bubbles from above the screen and within horizontal bounds
    const x = Phaser.Math.Between(200, width - 200);
    const y = Phaser.Math.Between(-100, -20); // Above screen to fall into view
    
    const bubble = this.add.image(x, y, ASSET_KEYS.BUBBLE);
    this.physics.add.existing(bubble);
    bubble.body.setSize(32, 32); // Set collision box for bubble sprite
    
    // Apply global color override if active
    if (this.globalColorOverride) {
      bubble.setTint(this.globalColorOverride);
    }
    
    // Set Y velocity for natural falling (physics-based)
    bubble.body.setVelocityY(Phaser.Math.Between(GAME_CONFIG.BUBBLES.SPEED_Y_MIN, GAME_CONFIG.BUBBLES.SPEED_Y_MAX));
    
    // Store horizontal movement speed for manual X movement (matching obstacle movement system)
    bubble.moveSpeedX = GAME_CONFIG.BUBBLES.SPEED_X; // Horizontal speed matching obstacles exactly
    
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
    
    // Create obstacle using custom sprite
    const obstacle = this.add.image(x, y, ASSET_KEYS.OBSTACLE);
    
    // Apply color override if active (global color shift effect)
    if (this.globalColorOverride) {
      obstacle.setTint(this.globalColorOverride);
    }
    
    // Scale obstacle to match the height variation
    const baseHeight = 80; // Max height from sprite
    const scaleFactor = obstacleHeight / baseHeight;
    obstacle.setScale(1, scaleFactor);
    
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
    this.cutscenePlaying = true;
    
    // Create glowing effect on player's belly with enhanced particles
    const glowEffect = this.add.circle(this.player.x, this.player.y + 10, 20, 0xffff00, 0.6);
    
    // Add sparkle particles around the player during cutscene
    if (this.bubbleCollectEmitter) {
      this.bubbleCollectEmitter.startFollow(this.player);
      this.bubbleCollectEmitter.start();
    }
    
    // Animate the glow effect
    if (this.tweens && this.tweens.add) {
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
          if (this.bubbleCollectEmitter) {
            this.bubbleCollectEmitter.stopFollow();
            this.bubbleCollectEmitter.stop();
          }
          this.physics.resume();
          this.cutscenePlaying = false;
        }
      });
    } else {
      // Fallback for test environment
      this.time.delayedCall(3000, () => {
        glowEffect.destroy();
        if (this.bubbleCollectEmitter) {
          this.bubbleCollectEmitter.stopFollow();
          this.bubbleCollectEmitter.stop();
        }
        this.physics.resume();
        this.cutscenePlaying = false;
      });
    }

    // Show cutscene message with enhanced visual effects
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const cutsceneText = this.add.text(width / 2, height / 2 - 100, 'Magic energy flows through you!', {
      font: 'bold 24px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);
    
    if (cutsceneText.setAlpha) cutsceneText.setAlpha(0);

    // Enhanced text entrance with scale and fade
    if (this.tweens && this.tweens.add) {
      this.tweens.add({
        targets: cutsceneText,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0.5, to: 1 },
        scaleY: { from: 0.5, to: 1 },
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Hold text for a moment, then fade out
          this.tweens.add({
            targets: cutsceneText,
            alpha: { from: 1, to: 0 },
            duration: 2500,
            delay: 500,
            onComplete: () => {
              cutsceneText.destroy();
            }
          });
        }
      });
    } else {
      // Fallback for test environment
      if (cutsceneText.setAlpha) cutsceneText.setAlpha(1);
      this.time.delayedCall(3000, () => {
        cutsceneText.destroy();
      });
    }
  }

  /**
   * Handle bubble collection
   */
  collectBubble(player, bubble) {
    // Play collect sound effect
    this.playSound('collect');
    
    // Create floating score text effect
    this.createFloatingText(bubble.x, bubble.y, '+1', '#00ff00', '20px');
    
    // Emit collection particles at bubble position
    if (this.bubbleCollectEmitter) {
      this.bubbleCollectEmitter.explode(
        GAME_CONFIG.EFFECTS.PARTICLES.BUBBLE_COLLECT.PARTICLE_COUNT, 
        bubble.x, 
        bubble.y
      );
    }
    
    // Subtle screen flash effect (with safety check for test environment)
    if (this.cameras.main.flash) {
      this.cameras.main.flash(200, 255, 255, 0, false, (camera, progress) => {
        // Flash completes automatically
      });
    }

    bubble.destroy();
    this.bubblesCollected++;
    this.bubblesText.setText(`Bubbles: ${this.bubblesCollected}`);

    // Save progress to localStorage using GameStateManager
    GameStateManager.saveBubblesCollected(this.bubblesCollected);

    // Trigger cutscene on first bubble collection
    if (!this.firstBubbleCollected) {
      this.firstBubbleCollected = true;
      GameStateManager.saveFirstBubbleFlag(true);
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

    // Play obstacle hit sound effect
    this.playSound('obstacleHit');

    // Create damage floating text
    this.createFloatingText(player.x, player.y - 30, '-1', '#ff0000', '24px');
    
    // Screen shake effect
    this.addScreenShake();
    
    // Emit hit particles at collision point
    if (this.obstacleHitEmitter) {
      this.obstacleHitEmitter.explode(
        GAME_CONFIG.EFFECTS.PARTICLES.OBSTACLE_HIT.PARTICLE_COUNT,
        obstacle.x,
        obstacle.y
      );
    }

    // Take damage
    this.playerLives -= GAME_CONFIG.OBSTACLES.DAMAGE;
    this.livesText.setText(`Lives: ${this.playerLives}`);

    // Save updated lives to localStorage
    GameStateManager.savePlayerLives(this.playerLives);

    // Player knockback effect
    player.body.setVelocityX(-150);
    player.body.setVelocityY(-200);

    // Make player temporarily invulnerable with enhanced visual feedback
    this.invulnerable = true;
    this.player.setTint(0xff0000); // Red tint to show damage
    
    // Add blinking effect during invulnerability
    if (this.tweens && this.tweens.add) {
      this.tweens.add({
        targets: this.player,
        alpha: { from: 1, to: 0.3 },
        duration: 200,
        yoyo: true,
        repeat: 9, // 10 blinks total over 2 seconds
        ease: 'Power1'
      });
    }

    // Clear existing invulnerability timer if any
    if (this.invulnerabilityTimer) {
      this.invulnerabilityTimer.remove();
    }

    // Set invulnerability timer
    this.invulnerabilityTimer = this.time.delayedCall(2000, () => {
      this.invulnerable = false;
      this.player.clearTint(); // Restore original sprite color
      this.player.setAlpha(1); // Ensure full opacity
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
    // Set flag to pause the game
    this.tetrisPromptShowing = true;
    
    // Stop spawning timers while dialog is open
    if (this.bubbleTimer) this.bubbleTimer.paused = true;
    if (this.obstacleTimer) this.obstacleTimer.paused = true;

    // Create semi-transparent overlay
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // Congratulations text
    const congratsText = this.add.text(width / 2, height / 2 - 80, 'CONGRATULATIONS!', {
      font: 'bold 42px Arial',
      fill: '#f39c12',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Bubble collection achievement text
    const achievementText = this.add.text(width / 2, height / 2 - 30, `You collected ${GAME_CONFIG.BUBBLE_COLLECTION_TARGET} bubbles!`, {
      font: '24px Arial',
      fill: '#ecf0f1'
    }).setOrigin(0.5);

    // Prompt text
    const promptText = this.add.text(width / 2, height / 2 + 10, 'Ready to play the Tetris phase?', {
      font: '20px Arial',
      fill: '#bdc3c7'
    }).setOrigin(0.5);

    // Play Tetris button
    const playTetrisButton = this.add.text(width / 2, height / 2 + 60, 'Play Tetris', {
      font: 'bold 22px Arial',
      fill: '#e74c3c',
      backgroundColor: '#2c3e50',
      padding: { x: 25, y: 12 }
    }).setOrigin(0.5);

    // Continue Running button
    const continueButton = this.add.text(width / 2, height / 2 + 110, 'Continue Running', {
      font: '18px Arial',
      fill: '#3498db',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Make buttons interactive
    playTetrisButton.setInteractive({ useHandCursor: true });
    continueButton.setInteractive({ useHandCursor: true });

    // Button hover effects
    playTetrisButton.on('pointerover', () => {
      playTetrisButton.setStyle({ fill: '#c0392b' });
    });

    playTetrisButton.on('pointerout', () => {
      playTetrisButton.setStyle({ fill: '#e74c3c' });
    });

    continueButton.on('pointerover', () => {
      continueButton.setStyle({ fill: '#5dade2' });
    });

    continueButton.on('pointerout', () => {
      continueButton.setStyle({ fill: '#3498db' });
    });

    // Button click events
    playTetrisButton.on('pointerdown', () => {
      console.log('Transitioning to Tetris scene');
      // Save current phase using GameStateManager
      GameStateManager.saveCurrentPhase(SCENE_KEYS.TETRIS);
      // Start TetrisScene with smooth transition
      this.transitionToScene(SCENE_KEYS.TETRIS);
    });

    continueButton.on('pointerdown', () => {
      this.closeTetrisPrompt(overlay, congratsText, achievementText, promptText, playTetrisButton, continueButton);
    });
  }

  /**
   * Close the Tetris prompt dialog and resume game
   */
  closeTetrisPrompt(overlay, congratsText, achievementText, promptText, playTetrisButton, continueButton) {
    // Remove dialog elements
    overlay.destroy();
    congratsText.destroy();
    achievementText.destroy();
    promptText.destroy();
    playTetrisButton.destroy();
    continueButton.destroy();

    // Resume the game
    this.tetrisPromptShowing = false;
    
    // Resume spawning timers
    if (this.bubbleTimer) this.bubbleTimer.paused = false;
    if (this.obstacleTimer) this.obstacleTimer.paused = false;
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
      // Clear all saved progress before restarting
      GameStateManager.clearProgress();
      this.transitionToScene(SCENE_KEYS.GAME);
    });

    menuButton.on('pointerdown', () => {
      // Clear all saved progress before returning to menu after game over
      GameStateManager.clearProgress();
      this.transitionToScene(SCENE_KEYS.MENU);
    });
  }

  /**
   * Update loop - handle player movement and game logic
   */
  update() {
    // Don't process movement if game is over, Tetris prompt is showing, or cutscene is playing
    if (this.gameOver || this.tetrisPromptShowing || this.cutscenePlaying) return;
    
    this.handlePlayerMovement();
    this.updateObstacles();
    this.updateBubbles();
  }

  /**
   * Update bubble positions manually (synchronized X movement with obstacles)
   */
  updateBubbles() {
    if (!this.bubbles) return;
    
    this.bubbles.children.entries.forEach(bubble => {
      if (bubble.active) {
        // Move bubble horizontally using delta time (matching obstacle movement exactly)
        // Y movement is handled by physics for natural falling
        const effectiveSpeed = bubble.moveSpeedX * this.obstacleSpeedMultiplier;
        bubble.x += effectiveSpeed * this.game.loop.delta / 1000;
      }
    });
  }

  /**
   * Update obstacle positions manually
   */
  updateObstacles() {
    if (!this.obstacles) return;
    
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.active) {
        // Move obstacle left using delta time for smooth movement
        const effectiveSpeed = obstacle.moveSpeed * this.obstacleSpeedMultiplier;
        obstacle.x += effectiveSpeed * this.game.loop.delta / 1000;
        
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

    // Update player trail particles to follow player
    if (this.playerTrailEmitter && player.body.velocity.x !== 0) {
      this.playerTrailEmitter.setPosition(player.x, player.y + 20);
      this.playerTrailEmitter.start();
    } else if (this.playerTrailEmitter) {
      this.playerTrailEmitter.stop();
    }

    // Apply speed multiplier from dynamic effects
    const effectiveSpeed = GAME_CONFIG.PHYSICS.PLAYER_SPEED * this.effectSpeedMultiplier;
    
    // Determine movement direction (considering inverted controls)
    let moveLeft = cursors.left.isDown || touch.left;
    let moveRight = cursors.right.isDown || touch.right;
    
    // Apply inverted controls effect
    if (this.invertedControls) {
      const temp = moveLeft;
      moveLeft = moveRight;
      moveRight = temp;
    }

    // Horizontal movement (keyboard or touch)
    if (moveLeft) {
      player.body.setVelocityX(-effectiveSpeed);
      // Visual feedback for touch
      if (touch.left && isMobile) {
        this.leftIndicator.setAlpha(GAME_CONFIG.TOUCH.FEEDBACK_ALPHA);
      }
    } else if (moveRight) {
      player.body.setVelocityX(effectiveSpeed);
      // Visual feedback for touch
      if (touch.right && isMobile) {
        this.rightIndicator.setAlpha(GAME_CONFIG.TOUCH.FEEDBACK_ALPHA);
      }
    } else {
      // Allow drag physics to naturally slow down the player
      // Only set velocity to 0 if drag is very low to maintain normal movement feel
      if (player.body.drag.x < GAME_CONFIG.PHYSICS.PLAYER_DRAG_ZERO_VELOCITY_THRESHOLD) {
        player.body.setVelocityX(0);
      }
      // Reset visual feedback
      if (isMobile) {
        this.leftIndicator.setAlpha(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
        this.rightIndicator.setAlpha(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      }
    }

    // Apply wind force effect (additive to regular movement)
    if (this.windForce !== 0) {
      const currentVelocityX = player.body.velocity.x;
      player.body.setVelocityX(currentVelocityX + this.windForce);
    }

    // Jumping (keyboard or touch)
    if ((this.spaceKey.isDown || touch.jump) && player.body.touching.down) {
      player.body.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      
      // Play jump sound effect
      this.playSound('jump');
      
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

  /**
   * Add screen shake effect for impactful moments
   */
  addScreenShake() {
    if (this.cameras.main.shake) {
      this.cameras.main.shake(
        GAME_CONFIG.EFFECTS.SCREEN_SHAKE.DURATION,
        GAME_CONFIG.EFFECTS.SCREEN_SHAKE.INTENSITY
      );
    }
  }

  /**
   * Create floating text effect for score/damage feedback
   */
  createFloatingText(x, y, text, color, fontSize) {
    const floatingText = this.add.text(x, y, text, {
      font: `bold ${fontSize} Arial`,
      fill: color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Animate the floating text (with safety check for tweens)
    if (this.tweens && this.tweens.add) {
      this.tweens.add({
        targets: floatingText,
        y: y - 50,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          floatingText.destroy();
        }
      });
    } else {
      // Fallback for test environment
      this.time.delayedCall(1000, () => {
        floatingText.destroy();
      });
    }
  }

  /**
   * Apply global color override to all game elements
   */
  applyGlobalColorOverride() {
    if (!this.globalColorOverride) return;
    
    // Apply to player
    if (this.player) {
      this.player.setTint(this.globalColorOverride);
    }
    
    // Apply to all existing bubbles
    if (this.bubbles) {
      this.bubbles.children.entries.forEach(bubble => {
        if (bubble.active) {
          bubble.setTint(this.globalColorOverride);
        }
      });
    }
    
    // Apply to all existing obstacles
    if (this.obstacles) {
      this.obstacles.children.entries.forEach(obstacle => {
        if (obstacle.active) {
          obstacle.setTint(this.globalColorOverride);
        }
      });
    }
  }

  /**
   * Remove global color override from all game elements
   */
  removeGlobalColorOverride() {
    // Restore player to original color
    if (this.player) {
      this.player.clearTint();
    }
    
    // Restore all existing bubbles to original color
    if (this.bubbles) {
      this.bubbles.children.entries.forEach(bubble => {
        if (bubble.active) {
          bubble.clearTint();
        }
      });
    }
    
    // Restore all existing obstacles to original color
    if (this.obstacles) {
      this.obstacles.children.entries.forEach(obstacle => {
        if (obstacle.active) {
          obstacle.clearTint();
        }
      });
    }
  }

  /**
   * Clean up resources when scene is destroyed
   */
  destroy() {
    // Stop dynamic effects system
    if (this.dynamicEffectsManager) {
      this.dynamicEffectsManager.stop();
      this.dynamicEffectsManager = null;
    }

    // Clean up timers
    if (this.bubbleTimer) {
      this.bubbleTimer.remove();
      this.bubbleTimer = null;
    }
    
    if (this.obstacleTimer) {
      this.obstacleTimer.remove();
      this.obstacleTimer = null;
    }

    if (this.invulnerabilityTimer) {
      this.invulnerabilityTimer.remove();
      this.invulnerabilityTimer = null;
    }

    // Call parent destroy if it exists
    if (super.destroy) {
      super.destroy();
    }
  }
}

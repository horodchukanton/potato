import { GAME_CONFIG } from '../config.js';

/**
 * DynamicEffectsManager handles the cycling of random dynamic effects during gameplay
 */
export default class DynamicEffectsManager {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentEffect = null;
    this.effectTimer = null;
    this.normalTimer = null;
    this.originalValues = {};
    this.screenTint = null;
    
    // Get available effects from config
    this.availableEffects = Object.keys(GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS);
  }

  /**
   * Start the dynamic effects system
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;
    
    // Start with normal period, then begin cycling
    this.scheduleNextEffect();
  }

  /**
   * Stop the dynamic effects system and clean up
   */
  stop() {
    this.isActive = false;
    this.deactivateCurrentEffect();
    
    if (this.effectTimer) {
      this.effectTimer.remove();
      this.effectTimer = null;
    }
    
    if (this.normalTimer) {
      this.normalTimer.remove();
      this.normalTimer = null;
    }
  }

  /**
   * Schedule the next random effect after normal period
   */
  scheduleNextEffect() {
    if (!this.isActive) return;
    
    this.normalTimer = this.scene.time.delayedCall(
      GAME_CONFIG.EFFECTS.DYNAMIC.NORMAL_DURATION,
      () => {
        this.activateRandomEffect();
      }
    );
  }

  /**
   * Activate a random effect from the available pool
   */
  activateRandomEffect() {
    if (!this.isActive) return;
    
    // Choose random effect (fallback for test environment)
    let effectKey;
    if (typeof Phaser !== 'undefined' && Phaser.Utils && Phaser.Utils.Array) {
      effectKey = Phaser.Utils.Array.GetRandom(this.availableEffects);
    } else {
      // Fallback for test environment
      const randomIndex = Math.floor(Math.random() * this.availableEffects.length);
      effectKey = this.availableEffects[randomIndex];
    }
    
    const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS[effectKey];
    
    this.currentEffect = {
      key: effectKey,
      config: effectConfig
    };
    
    // Store original values for restoration
    this.storeOriginalValues();
    
    // Apply the effect
    this.applyEffect(effectKey, effectConfig);
    
    // Show effect notification
    this.showEffectNotification(effectConfig.name, effectConfig.color);
    
    // Schedule effect end
    this.effectTimer = this.scene.time.delayedCall(
      GAME_CONFIG.EFFECTS.DYNAMIC.EFFECT_DURATION,
      () => {
        this.deactivateCurrentEffect();
        this.scheduleNextEffect();
      }
    );
  }

  /**
   * Store original game values for restoration
   */
  storeOriginalValues() {
    const player = this.scene.player;
    
    this.originalValues = {
      gravity: this.scene.physics.world.gravity.y,
      playerSpeed: GAME_CONFIG.PHYSICS.PLAYER_SPEED,
      timeScale: this.scene.physics.world.timeScale,
      playerBounce: player.body ? player.body.bounce.y : 0,
      playerScale: player.scale,
      playerFriction: player.body ? player.body.friction : { x: 0, y: 0 },
      playerDrag: player.body ? player.body.drag : { x: 0, y: 0 },
      obstacleSpeed: GAME_CONFIG.PHYSICS.OBSTACLE_SPEED,
      obstacleColor: GAME_CONFIG.OBSTACLES.COLOR
    };
  }

  /**
   * Apply the specified effect
   */
  applyEffect(effectKey, effectConfig) {
    const player = this.scene.player;
    
    switch (effectKey) {
      case 'GRAVITY_LOW':
        this.scene.physics.world.gravity.y = this.originalValues.gravity * effectConfig.gravityMultiplier;
        break;
        
      case 'SPEED_BOOST':
        // Increase player movement speed (will be applied in movement handling)
        this.scene.effectSpeedMultiplier = effectConfig.speedMultiplier;
        break;
        
      case 'TIME_SLOW':
        this.scene.physics.world.timeScale = effectConfig.timeScale;
        break;
        
      case 'INVERTED_CONTROLS':
        this.scene.invertedControls = effectConfig.invertControls;
        break;
        
      case 'BOUNCY_MODE':
        if (player.body) {
          player.body.setBounce(effectConfig.playerBounce);
        }
        break;
        
      case 'GRAVITY_FLIP':
        this.scene.physics.world.gravity.y = this.originalValues.gravity * effectConfig.gravityMultiplier;
        break;
        
      case 'WIND_GUST':
        // Apply continuous lateral force (handled in update loop)
        this.scene.windForce = effectConfig.windForce;
        break;
        
      case 'SLIPPERY_FLOOR':
        if (player.body) {
          player.body.setDrag(this.originalValues.playerDrag.x * effectConfig.frictionMultiplier);
        }
        break;
        
      case 'STICKY_FLOOR':
        if (player.body) {
          player.body.setDrag(this.originalValues.playerDrag.x * effectConfig.frictionMultiplier);
        }
        break;
        
      case 'TELEPORT_PORTAL':
        // Teleport player to random position
        this.teleportPlayer();
        break;
        
      case 'SHRINK_PLAYER':
        player.setScale(effectConfig.scaleMultiplier);
        break;
        
      case 'OBSTACLE_SPEED_BOOST':
        this.scene.obstacleSpeedMultiplier = effectConfig.obstacleSpeedMultiplier;
        break;
        
      case 'OBSTACLE_REVERSE':
        this.scene.obstacleSpeedMultiplier = effectConfig.obstacleSpeedMultiplier;
        break;
        
      case 'OBSTACLE_COLOR_SHIFT':
        this.scene.obstacleColorOverride = effectConfig.obstacleColor;
        break;
    }
    
    // Add visual screen tint
    this.addScreenTint(effectConfig.color);
  }

  /**
   * Teleport player to a random safe position
   */
  teleportPlayer() {
    const player = this.scene.player;
    if (!player.body) return;
    
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    // Random X position (avoid edges)
    const newX = 50 + Math.random() * (gameWidth - 100);
    // Keep Y position reasonable (middle area)
    const newY = gameHeight * 0.3 + Math.random() * (gameHeight * 0.4);
    
    player.setPosition(newX, newY);
    player.body.setVelocity(0, 0); // Stop momentum
  }

  /**
   * Deactivate current effect and restore normal state
   */
  deactivateCurrentEffect() {
    if (!this.currentEffect) return;
    
    const player = this.scene.player;
    
    // Restore original values
    this.scene.physics.world.gravity.y = this.originalValues.gravity;
    this.scene.physics.world.timeScale = 1.0;
    this.scene.effectSpeedMultiplier = 1.0;
    this.scene.invertedControls = false;
    this.scene.windForce = 0;
    this.scene.obstacleSpeedMultiplier = 1.0;
    this.scene.obstacleColorOverride = null;
    
    if (player.body) {
      player.body.setBounce(this.originalValues.playerBounce);
      if (this.originalValues.playerDrag) {
        player.body.setDrag(this.originalValues.playerDrag.x);
      }
    }
    
    // Restore player scale
    if (this.originalValues.playerScale) {
      player.setScale(this.originalValues.playerScale);
    }
    
    // Remove screen tint
    this.removeScreenTint();
    
    this.currentEffect = null;
  }

  /**
   * Add visual screen tint to indicate active effect
   */
  addScreenTint(color) {
    if (this.screenTint) {
      this.screenTint.destroy();
    }
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    this.screenTint = this.scene.add.rectangle(width / 2, height / 2, width, height, color)
      .setAlpha(0.15)
      .setDepth(1000); // High depth to appear over most game objects
  }

  /**
   * Remove visual screen tint
   */
  removeScreenTint() {
    if (this.screenTint) {
      this.screenTint.destroy();
      this.screenTint = null;
    }
  }

  /**
   * Show notification text for active effect
   */
  showEffectNotification(effectName, color) {
    const width = this.scene.cameras.main.width;
    
    const notification = this.scene.add.text(width / 2, 60, effectName, {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })
    .setOrigin(0.5)
    .setDepth(1001); // Above screen tint
    
    // Animate notification appearance and fade
    if (this.scene.tweens && this.scene.tweens.add) {
      this.scene.tweens.add({
        targets: notification,
        alpha: { from: 0, to: 1 },
        y: { from: 30, to: 60 },
        duration: 500,
        ease: 'Back.out',
        onComplete: () => {
          // Fade out after showing
          this.scene.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 1000,
            delay: 1500,
            onComplete: () => {
              notification.destroy();
            }
          });
        }
      });
    } else {
      // Fallback for test environment
      this.scene.time.delayedCall(3000, () => {
        notification.destroy();
      });
    }
  }

  /**
   * Get current effect info for testing/debugging
   */
  getCurrentEffect() {
    return this.currentEffect;
  }

  /**
   * Check if effects system is active
   */
  isEffectsActive() {
    return this.isActive;
  }
}
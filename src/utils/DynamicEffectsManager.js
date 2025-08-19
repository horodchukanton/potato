import { GAME_CONFIG } from '../config.js';
import { EFFECT_REGISTRY } from '../effects/index.js';

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
      playerY: player.y,
      playerFriction: player.body ? player.body.friction : { x: 0, y: 0 },
      playerDrag: player.body ? player.body.drag : { x: 0, y: 0 },
      obstacleSpeed: GAME_CONFIG.PHYSICS.OBSTACLE_SPEED,
      originalPlayerColor: null, // Will store original player color
      originalBubbleColor: GAME_CONFIG.BUBBLES.COLOR,
      originalObstacleColor: GAME_CONFIG.OBSTACLES.COLOR
    };
  }

  /**
   * Apply the specified effect
   */
  applyEffect(effectKey, effectConfig) {
    // Get the effect class from the registry
    const EffectClass = EFFECT_REGISTRY[effectKey];
    
    if (!EffectClass) {
      console.warn(`Unknown effect: ${effectKey}`);
      return;
    }
    
    // Create and apply the effect
    const effect = new EffectClass(this.scene, this.originalValues);
    effect.apply(effectConfig);
    
    // Add visual screen tint
    this.addScreenTint(effectConfig.color);
    
    // Speed up background music during effects
    if (this.scene.speedUpMusic) {
      this.scene.speedUpMusic();
    }
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
    this.scene.globalColorOverride = null;
    
    // Remove global color override from all existing game elements
    if (this.scene.removeGlobalColorOverride) {
      this.scene.removeGlobalColorOverride();
    }
    
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
    
    // Only restore player position for effects that actually modify it
    if (this.shouldRestorePosition(this.currentEffect.key)) {
      if (this.originalValues.playerY !== undefined) {
        player.setPosition(player.x, this.originalValues.playerY);
      }
    }
    
    // Remove screen tint
    this.removeScreenTint();
    
    // Reset background music speed to normal
    if (this.scene.resetMusicSpeed) {
      this.scene.resetMusicSpeed();
    }
    
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

  /**
   * Determine if an effect requires position restoration
   * Only effects that modify player position or require specific positioning should restore position
   * @param {string} effectKey - The effect key to check
   * @returns {boolean} True if position should be restored
   */
  shouldRestorePosition(effectKey) {
    // Effects that modify player position and need restoration
    const positionRestoringEffects = [
      'SHRINK_PLAYER'  // Changes scale and adjusts position to stay above ground
    ];
    
    return positionRestoringEffects.includes(effectKey);
  }
}
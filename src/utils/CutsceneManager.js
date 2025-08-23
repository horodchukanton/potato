import { GAME_CONFIG, SCENE_KEYS } from '../config.js';

/**
 * CutsceneManager handles animated transitions between scenes,
 * specifically the growing/shrinking player animations for Runner<->Tetris transitions
 */
export default class CutsceneManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Play the growing cutscene for Runner -> Tetris transition
   * Character grows until screen is filled, creating "moving into belly" effect
   * @param {Function} onComplete - Callback when cutscene completes
   */
  playGrowingCutscene(onComplete) {
    if (!this.scene.player) {
      console.warn('No player found for growing cutscene');
      if (onComplete) onComplete();
      return;
    }

    // Store original player properties
    const originalScale = this.scene.player.scale;
    const originalX = this.scene.player.x;
    const originalY = this.scene.player.y;
    
    // Calculate screen center for growing animation
    const screenCenterX = this.scene.cameras.main.width / 2;
    const screenCenterY = this.scene.cameras.main.height / 2;
    
    // Calculate target scale to fill screen (based on screen dimensions)
    const screenDiagonal = Math.sqrt(
      Math.pow(this.scene.cameras.main.width, 2) + 
      Math.pow(this.scene.cameras.main.height, 2)
    );
    const playerSize = Math.max(this.scene.player.width, this.scene.player.height);
    const targetScale = (screenDiagonal / playerSize) * 1.2; // 1.2x for complete coverage

    // Disable physics and input during cutscene
    if (this.scene.physics && this.scene.physics.pause) {
      this.scene.physics.pause();
    }
    
    // Disable dynamic effects during cutscene
    if (this.scene.dynamicEffectsManager && this.scene.dynamicEffectsManager.pause) {
      this.scene.dynamicEffectsManager.pause();
    }

    // Stop all audio
    if (this.scene.stopAllAudio) {
      this.scene.stopAllAudio();
    }

    // Create growing animation
    if (this.scene.tweens && this.scene.tweens.add) {
      this.scene.tweens.add({
        targets: this.scene.player,
        scaleX: targetScale,
        scaleY: targetScale,
        x: screenCenterX,
        y: screenCenterY,
        duration: GAME_CONFIG.EFFECTS.CUTSCENES.GROW_DURATION,
        ease: 'Cubic.easeInOut',
        onComplete: () => {
          // Add brief pause at full size before transition
          this.scene.time.delayedCall(GAME_CONFIG.EFFECTS.CUTSCENES.PAUSE_DURATION, () => {
            // Fade out screen
            if (this.scene.cameras.main.fadeOut) {
              this.scene.cameras.main.fadeOut(GAME_CONFIG.EFFECTS.CUTSCENES.FADE_DURATION, 0, 0, 0);
              this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                if (onComplete) onComplete();
              });
            } else {
              // Fallback for test environment
              if (onComplete) onComplete();
            }
          });
        }
      });
    } else {
      // Fallback for test environment
      if (onComplete) onComplete();
    }
  }

  /**
   * Play the shrinking cutscene for Tetris -> Runner transition
   * Character starts screen-filling and shrinks to normal size, creating "exiting belly" effect
   * @param {Function} onComplete - Callback when cutscene completes
   */
  playShrinkingCutscene(onComplete) {
    // This will be called from TetrisScene, so we need to create a temporary player sprite
    // for the animation, then transition to GameScene
    
    const screenCenterX = this.scene.cameras.main.width / 2;
    const screenCenterY = this.scene.cameras.main.height / 2;
    
    // Calculate initial scale to fill screen (same as grow cutscene)
    const screenDiagonal = Math.sqrt(
      Math.pow(this.scene.cameras.main.width, 2) + 
      Math.pow(this.scene.cameras.main.height, 2)
    );
    
    // Create temporary player sprite for animation (using estimated player size)
    const tempPlayer = this.scene.add.image(screenCenterX, screenCenterY, 'player');
    if (!tempPlayer) {
      console.warn('Could not create temporary player for shrinking cutscene');
      if (onComplete) onComplete();
      return;
    }
    
    const playerSize = Math.max(tempPlayer.width, tempPlayer.height);
    const initialScale = (screenDiagonal / playerSize) * 1.2; // Match grow cutscene
    tempPlayer.setScale(initialScale);
    
    // Set highest depth to appear over Tetris UI
    tempPlayer.setDepth(10000);

    // Fade in from black first
    if (this.scene.cameras.main.fadeIn) {
      this.scene.cameras.main.fadeIn(GAME_CONFIG.EFFECTS.CUTSCENES.FADE_DURATION, 0, 0, 0);
    }

    // Brief pause before starting shrink animation
    this.scene.time.delayedCall(GAME_CONFIG.EFFECTS.CUTSCENES.PAUSE_DURATION, () => {
      // Calculate target position (slightly left of center, typical player position)
      const targetX = 100; // Typical player X position in GameScene
      const targetY = this.scene.cameras.main.height - 100; // Near ground level
      
      // Create shrinking animation
      if (this.scene.tweens && this.scene.tweens.add) {
        this.scene.tweens.add({
          targets: tempPlayer,
          scaleX: 1.0,
          scaleY: 1.0,
          x: targetX,
          y: targetY,
          duration: GAME_CONFIG.EFFECTS.CUTSCENES.SHRINK_DURATION,
          ease: 'Cubic.easeInOut',
          onComplete: () => {
            // Clean up temporary sprite
            tempPlayer.destroy();
            
            // Fade out before transitioning
            if (this.scene.cameras.main.fadeOut) {
              this.scene.cameras.main.fadeOut(GAME_CONFIG.EFFECTS.CUTSCENES.FADE_DURATION, 0, 0, 0);
              this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                if (onComplete) onComplete();
              });
            } else {
              // Fallback for test environment
              if (onComplete) onComplete();
            }
          }
        });
      } else {
        // Fallback for test environment
        tempPlayer.destroy();
        if (onComplete) onComplete();
      }
    });
  }
}
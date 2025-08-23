import { SCENE_KEYS } from '../config.js';
import CutsceneManager from './CutsceneManager.js';

/**
 * TransitionManager handles all scene transitions in the game
 * Centralizes transition logic that was previously scattered across scenes
 */
export default class TransitionManager {
  constructor(scene) {
    this.scene = scene;
    this.cutsceneManager = new CutsceneManager(scene);
  }

  /**
   * Perform transition to any scene with appropriate animation
   * @param {string} targetSceneKey - The scene to transition to
   */
  transitionToScene(targetSceneKey) {
    switch (targetSceneKey) {
      case SCENE_KEYS.TETRIS:
        this.transitionToTetrisWithCutscene();
        break;
      case SCENE_KEYS.GAME:
        this.transitionToGameWithCutscene();
        break;
      default:
        this.performRegularTransition(targetSceneKey);
        break;
    }
  }

  /**
   * Transition to Tetris scene with growing player cutscene
   */
  transitionToTetrisWithCutscene() {
    if (!this.cutsceneManager) {
      console.warn('CutsceneManager not initialized, falling back to regular transition');
      this.performRegularTransition(SCENE_KEYS.TETRIS);
      return;
    }

    this.cutsceneManager.playGrowingCutscene(() => {
      this.scene.scene.start(SCENE_KEYS.TETRIS);
    });
  }

  /**
   * Transition to Game scene with shrinking player cutscene
   */
  transitionToGameWithCutscene() {
    if (!this.cutsceneManager) {
      console.warn('CutsceneManager not initialized, falling back to regular transition');
      this.performRegularTransition(SCENE_KEYS.GAME);
      return;
    }

    this.cutsceneManager.playShrinkingCutscene(() => {
      this.scene.scene.start(SCENE_KEYS.GAME);
    });
  }

  /**
   * Perform regular fade transition to scene
   * @param {string} sceneKey - The scene to transition to
   */
  performRegularTransition(sceneKey) {
    // Use camera fade if available
    if (this.scene.cameras && this.scene.cameras.main && this.scene.cameras.main.fadeOut) {
      this.scene.cameras.main.fadeOut(500, 0, 0, 0);
      this.scene.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.scene.start(sceneKey);
      });
    } else {
      // Fallback for test environment or if cameras are not available
      this.scene.scene.start(sceneKey);
    }
  }

  /**
   * Clean up the transition manager
   */
  destroy() {
    if (this.cutsceneManager) {
      this.cutsceneManager = null;
    }
    this.scene = null;
  }
}
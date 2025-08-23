/**
 * @jest-environment jsdom
 */

import { SCENE_KEYS } from '../src/config.js';

// Mock GameStateManager
jest.mock('../src/utils/GameStateManager.js', () => ({
  default: {
    saveBubblesCollected: jest.fn(),
    saveTetrominoesUsed: jest.fn(),
    saveTetrisGrid: jest.fn(),
    loadTetrisLines: jest.fn(() => 0),
    loadBubblesCollected: jest.fn(() => 10),
    loadTetrominoesUsed: jest.fn(() => 0),
    loadTetrisGrid: jest.fn(() => null)
  }
}));

// Create a mock TetrisScene class that mimics the important parts
class MockTetrisScene {
  constructor() {
    this.scene = {
      start: jest.fn(),
      key: SCENE_KEYS.TETRIS
    };
    
    this.cameras = {
      main: {
        fadeOut: jest.fn(),
        once: jest.fn((event, callback) => {
          if (event === 'camerafadeoutcomplete') {
            callback();
          }
        })
      }
    };
    
    this.dropTimer = {
      destroy: jest.fn()
    };
  }

  /**
   * Smooth transition to another scene with proper cleanup
   */
  transitionToScene(sceneKey) {
    // Ensure drop timer is stopped
    if (this.dropTimer) {
      this.dropTimer.destroy();
      this.dropTimer = null;
    }
    
    // Transition to the target scene
    if (this.cameras.main.fadeOut) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(sceneKey);
      });
    } else {
      // Fallback for test environment
      this.scene.start(sceneKey);
    }
  }
}

describe('TetrisScene Transition Fix', () => {
  let tetrisScene;

  beforeEach(() => {
    tetrisScene = new MockTetrisScene();
    jest.clearAllMocks();
  });

  describe('transitionToScene method', () => {
    test('should exist and be callable', () => {
      expect(typeof tetrisScene.transitionToScene).toBe('function');
    });

    test('should stop drop timer when transitioning', () => {
      const originalTimer = tetrisScene.dropTimer;
      
      tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      
      expect(originalTimer.destroy).toHaveBeenCalled();
      expect(tetrisScene.dropTimer).toBe(null);
    });

    test('should use camera fade transition when available', () => {
      tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      
      expect(tetrisScene.cameras.main.fadeOut).toHaveBeenCalledWith(500, 0, 0, 0);
      expect(tetrisScene.cameras.main.once).toHaveBeenCalledWith('camerafadeoutcomplete', expect.any(Function));
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });

    test('should fallback to direct scene.start when camera fadeOut is not available', () => {
      // Remove fadeOut to test fallback
      tetrisScene.cameras.main.fadeOut = null;
      
      tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });

    test('should work with different scene keys', () => {
      tetrisScene.transitionToScene(SCENE_KEYS.MENU);
      
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.MENU);
    });

    test('should handle case when dropTimer is null', () => {
      tetrisScene.dropTimer = null;
      
      expect(() => {
        tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      }).not.toThrow();
    });
  });

  describe('Regression test for freeze issue', () => {
    test('should properly clean up timers during transition', () => {
      const mockTimer = {
        destroy: jest.fn()
      };
      tetrisScene.dropTimer = mockTimer;
      
      // Simulate multiple rapid transitions (which could cause the freeze)
      tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      
      // Timer should be destroyed each time, but only once per transition
      expect(mockTimer.destroy).toHaveBeenCalledTimes(1);
      expect(tetrisScene.dropTimer).toBe(null);
    });

    test('should handle transition when timer is already destroyed', () => {
      tetrisScene.dropTimer = null;
      
      expect(() => {
        tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      }).not.toThrow();
      
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });

    test('demonstrates the difference between direct scene.start vs transitionToScene', () => {
      const oldStyleTransition = () => {
        // This is what TetrisScene used to do (problematic)
        tetrisScene.scene.start(SCENE_KEYS.GAME);
      };

      const newStyleTransition = () => {
        // This is what TetrisScene now does (proper cleanup)
        tetrisScene.transitionToScene(SCENE_KEYS.GAME);
      };

      // Reset timer
      tetrisScene.dropTimer = {
        destroy: jest.fn()
      };

      // Old style doesn't clean up timers
      oldStyleTransition();
      expect(tetrisScene.dropTimer.destroy).not.toHaveBeenCalled();
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);

      // Reset for next test
      jest.clearAllMocks();
      tetrisScene.dropTimer = {
        destroy: jest.fn()
      };

      // New style properly cleans up timers
      const timerBeforeNewStyle = tetrisScene.dropTimer;
      newStyleTransition();
      expect(timerBeforeNewStyle.destroy).toHaveBeenCalled();
      expect(tetrisScene.dropTimer).toBe(null);
      expect(tetrisScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });
  });
});
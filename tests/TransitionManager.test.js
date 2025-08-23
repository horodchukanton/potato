import TransitionManager from '../src/utils/TransitionManager.js';
import { SCENE_KEYS } from '../src/config.js';

describe('TransitionManager', () => {
  let mockScene;
  let transitionManager;

  beforeEach(() => {
    // Mock scene object
    mockScene = {
      scene: {
        start: jest.fn()
      },
      cameras: {
        main: {
          fadeOut: jest.fn(),
          once: jest.fn()
        }
      }
    };

    transitionManager = new TransitionManager(mockScene);
  });

  afterEach(() => {
    if (transitionManager) {
      transitionManager.destroy();
    }
  });

  describe('Scene Transitions', () => {
    test('should transition to Tetris scene with cutscene', () => {
      // Mock the cutscene manager
      transitionManager.cutsceneManager = {
        playGrowingCutscene: jest.fn((callback) => callback())
      };

      transitionManager.transitionToScene(SCENE_KEYS.TETRIS);

      expect(transitionManager.cutsceneManager.playGrowingCutscene).toHaveBeenCalled();
      expect(mockScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.TETRIS);
    });

    test('should transition to Game scene with cutscene', () => {
      // Mock the cutscene manager
      transitionManager.cutsceneManager = {
        playShrinkingCutscene: jest.fn((callback) => callback())
      };

      transitionManager.transitionToScene(SCENE_KEYS.GAME);

      expect(transitionManager.cutsceneManager.playShrinkingCutscene).toHaveBeenCalled();
      expect(mockScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });

    test('should perform regular transition for other scenes', () => {
      const mockCallback = jest.fn();
      mockScene.cameras.main.once.mockImplementation((event, callback) => {
        if (event === 'camerafadeoutcomplete') {
          callback();
        }
      });

      transitionManager.transitionToScene(SCENE_KEYS.MENU);

      expect(mockScene.cameras.main.fadeOut).toHaveBeenCalledWith(500, 0, 0, 0);
      expect(mockScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.MENU);
    });

    test('should fallback to direct transition when cameras not available', () => {
      // Remove cameras mock
      mockScene.cameras = null;

      transitionManager.performRegularTransition(SCENE_KEYS.MENU);

      expect(mockScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.MENU);
    });

    test('should fallback to regular transition when cutscene manager fails', () => {
      // Set cutscene manager to null
      transitionManager.cutsceneManager = null;
      
      // Mock the regular transition method
      const mockPerformRegularTransition = jest.spyOn(transitionManager, 'performRegularTransition');
      mockPerformRegularTransition.mockImplementation(() => {});

      transitionManager.transitionToTetrisWithCutscene();

      expect(mockPerformRegularTransition).toHaveBeenCalledWith(SCENE_KEYS.TETRIS);
      
      mockPerformRegularTransition.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('should clean up properly on destroy', () => {
      expect(transitionManager.scene).toBe(mockScene);
      expect(transitionManager.cutsceneManager).toBeTruthy();

      transitionManager.destroy();

      expect(transitionManager.scene).toBeNull();
      expect(transitionManager.cutsceneManager).toBeNull();
    });
  });
});
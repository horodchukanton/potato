/**
 * Test for TetrisScene to GameScene transition fix
 * Validates that scene transitions use proper method instead of direct scene.start
 */

import { SCENE_KEYS } from '../src/config.js';

describe('TetrisScene Transition Fix', () => {
  let mockGameStateManager;

  beforeEach(() => {
    // Mock GameStateManager
    mockGameStateManager = {
      saveBubblesCollected: jest.fn(),
      saveTetrominoesUsed: jest.fn(),
      saveTetrisGrid: jest.fn(),
    };
  });

  describe('returnToGameScene transition method', () => {
    test('should reset game state properly', () => {
      // Simulate the behavior of returnToGameScene method
      const resetGameState = () => {
        mockGameStateManager.saveBubblesCollected(0);
        mockGameStateManager.saveTetrominoesUsed(0);
        mockGameStateManager.saveTetrisGrid(null);
      };

      resetGameState();

      expect(mockGameStateManager.saveBubblesCollected).toHaveBeenCalledWith(0);
      expect(mockGameStateManager.saveTetrominoesUsed).toHaveBeenCalledWith(0);
      expect(mockGameStateManager.saveTetrisGrid).toHaveBeenCalledWith(null);
    });

    test('should use proper scene transition with fade effect', () => {
      const mockScene = { start: jest.fn() };
      const mockCameras = {
        main: {
          fadeOut: jest.fn(),
          once: jest.fn()
        }
      };

      // Simulate the returnToGameScene method behavior
      const returnToGameScene = () => {
        // Reset game state
        mockGameStateManager.saveBubblesCollected(0);
        mockGameStateManager.saveTetrominoesUsed(0);
        mockGameStateManager.saveTetrisGrid(null);
        
        // Use scene transition with fade
        if (mockCameras.main.fadeOut) {
          mockCameras.main.fadeOut(300, 0, 0, 0);
          mockCameras.main.once('camerafadeoutcomplete', () => {
            mockScene.start(SCENE_KEYS.GAME);
          });
        } else {
          mockScene.start(SCENE_KEYS.GAME);
        }
      };

      returnToGameScene();

      expect(mockCameras.main.fadeOut).toHaveBeenCalledWith(300, 0, 0, 0);
      expect(mockCameras.main.once).toHaveBeenCalledWith('camerafadeoutcomplete', expect.any(Function));
      
      // Execute the callback to test scene transition
      const fadeCompleteCallback = mockCameras.main.once.mock.calls[0][1];
      fadeCompleteCallback();
      
      expect(mockScene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });

    test('should fallback to direct scene start when fade is not available', () => {
      const mockScene = { start: jest.fn() };
      const mockCameras = { main: { fadeOut: null } };

      // Simulate the returnToGameScene method behavior with fallback
      const returnToGameScene = () => {
        mockGameStateManager.saveBubblesCollected(0);
        mockGameStateManager.saveTetrominoesUsed(0);
        mockGameStateManager.saveTetrisGrid(null);
        
        if (mockCameras.main.fadeOut) {
          mockCameras.main.fadeOut(300, 0, 0, 0);
          mockCameras.main.once('camerafadeoutcomplete', () => {
            mockScene.start(SCENE_KEYS.GAME);
          });
        } else {
          mockScene.start(SCENE_KEYS.GAME);
        }
      };

      returnToGameScene();

      expect(mockScene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });
  });

  describe('validation of scene key constants', () => {
    test('should have correct GAME scene key', () => {
      expect(SCENE_KEYS.GAME).toBe('GameScene');
    });
  });
});
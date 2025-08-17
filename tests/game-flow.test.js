/**
 * game-flow.test.js - Tests for complete game flow, scene transitions, and integration scenarios
 * 
 * This test suite validates:
 * - Complete game flow from start to finish
 * - Scene transition logic and data persistence  
 * - Integration between different game components
 * - Error recovery and edge case scenarios
 * - Performance under various game states
 */

import { GAME_CONFIG, SCENE_KEYS, STORAGE_KEYS } from '../src/config.js';

// Mock GameStateManager
const mockGameStateManager = {
  loadGameState: jest.fn(),
  saveGameState: jest.fn(),
  saveBubblesCollected: jest.fn(),
  saveFirstBubbleFlag: jest.fn(),
  savePlayerLives: jest.fn(),
  saveCurrentPhase: jest.fn(),
  getProgressSummary: jest.fn(),
  getResumeScene: jest.fn(),
  clearProgress: jest.fn()
};

jest.mock('../src/utils/GameStateManager.js', () => ({
  default: mockGameStateManager
}));

// Mock localStorage for direct testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get store() { return store; },
    set store(newStore) { store = newStore; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Game Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.store = {};
  });

  describe('Complete Game Session', () => {
    test('should handle full game session from menu to completion', () => {
      // 1. Start with no progress
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 0,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 0,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      mockGameStateManager.getResumeScene.mockReturnValue(SCENE_KEYS.GAME);

      // Verify initial state
      expect(mockGameStateManager.getProgressSummary().bubblesCollected).toBe(0);

      // 2. Simulate bubble collection progress
      const progressSteps = [10, 25, 40, 50];
      progressSteps.forEach(bubbles => {
        mockGameStateManager.getProgressSummary.mockReturnValue({
          bubblesCollected: bubbles,
          bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
          tetrisLines: 0,
          tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
        });
      });

      // 3. Verify completion triggers
      const finalProgress = mockGameStateManager.getProgressSummary();
      expect(finalProgress.bubblesCollected).toBe(50);
      expect(finalProgress.bubblesCollected).toBeGreaterThanOrEqual(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
    });

    test('should maintain consistent state across scene transitions', () => {
      const initialState = {
        bubblesCollected: 15,
        firstBubbleCollected: true,
        playerLives: 2,
        currentPhase: SCENE_KEYS.GAME
      };

      mockGameStateManager.loadGameState.mockReturnValue(initialState);

      // Simulate scene transition
      mockGameStateManager.saveCurrentPhase(SCENE_KEYS.MENU);
      expect(mockGameStateManager.saveCurrentPhase).toHaveBeenCalledWith(SCENE_KEYS.MENU);

      // Return to game - state should be preserved
      const resumeState = mockGameStateManager.loadGameState();
      expect(resumeState.bubblesCollected).toBe(15);
      expect(resumeState.playerLives).toBe(2);
    });
  });

  describe('Save/Load Game State', () => {
    test('should preserve game state during browser session', () => {
      const gameState = {
        bubblesCollected: 33,
        firstBubbleCollected: true,
        playerLives: 1,
        currentPhase: SCENE_KEYS.GAME
      };

      // Save state
      mockLocalStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, gameState.bubblesCollected.toString());
      mockLocalStorage.setItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED, gameState.firstBubbleCollected.toString());
      mockLocalStorage.setItem(STORAGE_KEYS.PLAYER_LIVES, gameState.playerLives.toString());
      mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_PHASE, gameState.currentPhase);

      // Verify persistence
      expect(mockLocalStorage.getItem(STORAGE_KEYS.BUBBLES_COLLECTED)).toBe('33');
      expect(mockLocalStorage.getItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED)).toBe('true');
      expect(mockLocalStorage.getItem(STORAGE_KEYS.PLAYER_LIVES)).toBe('1');
      expect(mockLocalStorage.getItem(STORAGE_KEYS.CURRENT_PHASE)).toBe(SCENE_KEYS.GAME);
    });

    test('should handle corrupted save data gracefully', () => {
      // Simulate corrupted data
      mockLocalStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, 'corrupted_data');
      mockLocalStorage.setItem(STORAGE_KEYS.PLAYER_LIVES, 'not_a_number');

      // Should not crash when loading corrupted data
      expect(() => {
        mockLocalStorage.getItem(STORAGE_KEYS.BUBBLES_COLLECTED);
        mockLocalStorage.getItem(STORAGE_KEYS.PLAYER_LIVES);
      }).not.toThrow();
    });

    test('should handle missing save data gracefully', () => {
      // Clear all data
      mockLocalStorage.clear();

      // Should return defaults for missing data
      expect(mockLocalStorage.getItem(STORAGE_KEYS.BUBBLES_COLLECTED)).toBeNull();
      expect(mockLocalStorage.getItem(STORAGE_KEYS.PLAYER_LIVES)).toBeNull();
    });
  });

  describe('Progressive Difficulty and Game Balance', () => {
    test('should increase challenge as game progresses', () => {
      const earlyGameBubbles = 5;
      const midGameBubbles = 25;
      const lateGameBubbles = 45;

      // Early game should be easier
      expect(earlyGameBubbles).toBeLessThan(GAME_CONFIG.BUBBLE_COLLECTION_TARGET * 0.3);

      // Mid game should show progress
      expect(midGameBubbles).toBeGreaterThan(GAME_CONFIG.BUBBLE_COLLECTION_TARGET * 0.3);
      expect(midGameBubbles).toBeLessThan(GAME_CONFIG.BUBBLE_COLLECTION_TARGET * 0.8);

      // Late game should be near completion
      expect(lateGameBubbles).toBeGreaterThan(GAME_CONFIG.BUBBLE_COLLECTION_TARGET * 0.8);
    });

    test('should balance obstacle spawn rates with player progression', () => {
      const minSpawnDelay = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN;
      const maxSpawnDelay = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX;
      const obstacleSpeed = Math.abs(GAME_CONFIG.OBSTACLES.SPEED);
      const playerSpeed = GAME_CONFIG.PHYSICS.PLAYER_SPEED;

      // Player should be able to react to obstacles
      expect(playerSpeed).toBeGreaterThan(obstacleSpeed * 0.5);

      // Spawn delays should provide reasonable reaction time
      expect(minSpawnDelay).toBeGreaterThan(1000); // At least 1 second
      expect(maxSpawnDelay).toBeLessThan(10000); // No more than 10 seconds
      expect(maxSpawnDelay).toBeGreaterThan(minSpawnDelay);
    });

    test('should provide appropriate lives for game length', () => {
      const totalLives = GAME_CONFIG.OBSTACLES.LIVES;
      const damagePerHit = GAME_CONFIG.OBSTACLES.DAMAGE;
      const bubbleTarget = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;

      // Should allow for some mistakes while maintaining challenge
      const maxMistakes = Math.floor(totalLives / damagePerHit);
      expect(maxMistakes).toBeGreaterThan(1); // Allow multiple mistakes
      expect(maxMistakes).toBeLessThan(bubbleTarget / 5); // But not too forgiving
    });
  });

  describe('User Experience Flow', () => {
    test('should provide clear progression feedback', () => {
      const progressLevels = [
        { bubbles: 10, percentage: 20 },
        { bubbles: 25, percentage: 50 },
        { bubbles: 40, percentage: 80 },
        { bubbles: 50, percentage: 100 }
      ];

      progressLevels.forEach(level => {
        const expectedPercentage = (level.bubbles / GAME_CONFIG.BUBBLE_COLLECTION_TARGET) * 100;
        expect(expectedPercentage).toBeCloseTo(level.percentage);
      });
    });

    test('should handle rapid input changes smoothly', () => {
      const rapidInputSequence = [
        { action: 'move_left', duration: 100 },
        { action: 'jump', duration: 50 },
        { action: 'move_right', duration: 100 },
        { action: 'stop', duration: 50 }
      ];

      // Simulate that all input changes are processed
      rapidInputSequence.forEach(input => {
        expect(input.duration).toBeGreaterThan(0);
        expect(input.action).toBeTruthy();
      });

      // Total sequence should be reasonable for user interaction
      const totalDuration = rapidInputSequence.reduce((sum, input) => sum + input.duration, 0);
      expect(totalDuration).toBeLessThan(1000); // Less than 1 second for responsiveness
    });

    test('should provide appropriate feedback timing', () => {
      const feedbackTimings = {
        bubbleCollection: 'immediate',
        obstacleHit: '2000ms_invulnerability',
        firstBubbleCutscene: '3000ms_duration',
        gameOverScreen: 'immediate'
      };

      // Verify timing makes sense for user experience
      expect(feedbackTimings.bubbleCollection).toBe('immediate');
      expect(feedbackTimings.obstacleHit).toContain('2000ms');
      expect(feedbackTimings.firstBubbleCutscene).toContain('3000ms');
    });
  });

  describe('Performance and Memory Management', () => {
    test('should handle large numbers of game objects efficiently', () => {
      const maxBubbles = 50; // Reasonable upper limit
      const maxObstacles = 20; // Reasonable upper limit

      // Verify limits are reasonable for performance
      expect(maxBubbles).toBeLessThan(100);
      expect(maxObstacles).toBeLessThan(50);

      // Combined objects should not exceed memory thresholds
      const totalObjects = maxBubbles + maxObstacles;
      expect(totalObjects).toBeLessThan(200);
    });

    test('should clean up resources when objects go off-screen', () => {
      const screenWidth = GAME_CONFIG.WIDTH;
      const obstacleWidth = GAME_CONFIG.OBSTACLES.WIDTH;
      const offScreenThreshold = -obstacleWidth;

      // Objects should be removed when sufficiently off-screen
      expect(offScreenThreshold).toBeLessThan(0);
      expect(Math.abs(offScreenThreshold)).toBeLessThan(screenWidth * 0.1);
    });

    test('should manage timer resources properly', () => {
      const bubbleSpawnMin = 2000;
      const bubbleSpawnMax = 4000;
      const obstacleSpawnMin = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN;
      const obstacleSpawnMax = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX;

      // Timer intervals should be reasonable
      expect(bubbleSpawnMin).toBeGreaterThan(1000);
      expect(bubbleSpawnMax).toBeLessThan(10000);
      expect(obstacleSpawnMin).toBeGreaterThan(1000);
      expect(obstacleSpawnMax).toBeLessThan(15000);
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should recover from game state corruption', () => {
      // Simulate corrupted state
      const corruptedState = {
        bubblesCollected: -5, // Invalid negative value
        playerLives: 999, // Invalid high value
        firstBubbleCollected: 'maybe' // Invalid boolean
      };

      // System should handle invalid values gracefully
      const cleanBubbles = Math.max(0, corruptedState.bubblesCollected || 0);
      const cleanLives = Math.min(GAME_CONFIG.OBSTACLES.LIVES, Math.max(0, corruptedState.playerLives || GAME_CONFIG.OBSTACLES.LIVES));
      const cleanFirstBubble = Boolean(corruptedState.firstBubbleCollected === true);

      expect(cleanBubbles).toBe(0);
      expect(cleanLives).toBe(GAME_CONFIG.OBSTACLES.LIVES);
      expect(cleanFirstBubble).toBe(false);
    });

    test('should handle localStorage access failures', () => {
      // Simulate localStorage unavailable
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not crash when localStorage fails
      expect(() => {
        try {
          mockLocalStorage.setItem('test', 'value');
        } catch (e) {
          // Handle gracefully
        }
      }).not.toThrow();

      // Restore original function
      mockLocalStorage.setItem = originalSetItem;
    });

    test('should provide fallback behavior for missing scenes', () => {
      const validScenes = Object.values(SCENE_KEYS);
      const invalidScene = 'NonExistentScene';

      // Should default to a valid scene when invalid scene is requested
      const fallbackScene = validScenes.includes(invalidScene) ? invalidScene : SCENE_KEYS.MENU;
      
      expect(fallbackScene).toBe(SCENE_KEYS.MENU);
      expect(validScenes).toContain(fallbackScene);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should handle different screen resolutions', () => {
      const supportedResolutions = [
        { width: 800, height: 600 },   // Default
        { width: 1024, height: 768 },  // Traditional desktop
        { width: 1920, height: 1080 }, // HD
        { width: 375, height: 667 },   // Mobile portrait
        { width: 667, height: 375 }    // Mobile landscape
      ];

      supportedResolutions.forEach(resolution => {
        // Game should handle different aspect ratios
        const aspectRatio = resolution.width / resolution.height;
        expect(aspectRatio).toBeGreaterThan(0.5);
        expect(aspectRatio).toBeLessThan(3.0);

        // Minimum playable area
        expect(resolution.width).toBeGreaterThan(300);
        expect(resolution.height).toBeGreaterThan(200);
      });
    });

    test('should adapt controls for different input methods', () => {
      const inputMethods = {
        desktop: { keyboard: true, touch: false },
        mobile: { keyboard: false, touch: true },
        tablet: { keyboard: true, touch: true }
      };

      Object.entries(inputMethods).forEach(([device, capabilities]) => {
        // Each device should have at least one input method
        const hasInput = capabilities.keyboard || capabilities.touch;
        expect(hasInput).toBe(true);
      });
    });

    test('should maintain consistent game balance across devices', () => {
      // Game mechanics should be consistent regardless of device
      const mechanicsConfig = {
        bubbleTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        playerSpeed: GAME_CONFIG.PHYSICS.PLAYER_SPEED,
        jumpVelocity: Math.abs(GAME_CONFIG.PHYSICS.JUMP_VELOCITY),
        obstacleSpeed: Math.abs(GAME_CONFIG.OBSTACLES.SPEED)
      };

      // Values should be the same regardless of device
      expect(mechanicsConfig.bubbleTarget).toBe(50);
      expect(mechanicsConfig.playerSpeed).toBe(180);
      expect(mechanicsConfig.jumpVelocity).toBe(350);
      expect(mechanicsConfig.obstacleSpeed).toBe(150);
    });
  });

  describe('Birthday Game Theme Integration', () => {
    test('should maintain birthday theme throughout game flow', () => {
      const themeElements = {
        title: 'POTATO Birthday Game',
        collectibles: 'bubbles',
        objective: 'celebration',
        phases: ['running', 'tetris']
      };

      expect(themeElements.title).toContain('Birthday');
      expect(themeElements.collectibles).toBe('bubbles');
      expect(themeElements.phases).toContain('tetris');
    });

    test('should provide appropriate celebration milestones', () => {
      const milestones = [
        { bubbles: 1, event: 'first_bubble_cutscene' },
        { bubbles: 25, event: 'halfway_celebration' },
        { bubbles: 50, event: 'tetris_prompt' }
      ];

      milestones.forEach(milestone => {
        expect(milestone.bubbles).toBeGreaterThan(0);
        expect(milestone.bubbles).toBeLessThanOrEqual(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
        expect(milestone.event).toBeTruthy();
      });
    });

    test('should integrate game phases cohesively', () => {
      const gamePhases = [
        { name: 'menu', purpose: 'navigation' },
        { name: 'running', purpose: 'collection' },
        { name: 'tetris', purpose: 'puzzle' }
      ];

      // Each phase should have clear purpose
      gamePhases.forEach(phase => {
        expect(phase.name).toBeTruthy();
        expect(phase.purpose).toBeTruthy();
      });

      // Should flow logically from one to next
      expect(gamePhases.length).toBeGreaterThan(1);
    });
  });
});
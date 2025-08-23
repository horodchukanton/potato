import GameStateManager from '../src/utils/GameStateManager.js';
import { STORAGE_KEYS, GAME_CONFIG, SCENE_KEYS } from '../src/config.js';

describe('GameStateManager Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('localStorage availability check', () => {
    test('should detect when localStorage is available', () => {
      expect(GameStateManager.isLocalStorageAvailable()).toBe(true);
    });
  });

  describe('Bubbles Collected Management', () => {
    test('should load zero bubbles when no data saved', () => {
      expect(GameStateManager.loadBubblesCollected()).toBe(0);
    });

    test('should load saved bubbles count', () => {
      localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, '25');
      expect(GameStateManager.loadBubblesCollected()).toBe(25);
    });

    test('should save and load bubbles count', () => {
      GameStateManager.saveBubblesCollected(42);
      expect(GameStateManager.loadBubblesCollected()).toBe(42);
    });

    test('should handle invalid bubble count by returning 0', () => {
      localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, 'invalid');
      // Updated: Now properly handles NaN by returning 0
      expect(GameStateManager.loadBubblesCollected()).toBe(0);
    });

    test('should handle negative values by returning 0', () => {
      localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, '-5');
      // Updated: Now clamps negative values to 0 for safety
      expect(GameStateManager.loadBubblesCollected()).toBe(0);
    });

    test('should handle large numbers', () => {
      localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, '1000000');
      expect(GameStateManager.loadBubblesCollected()).toBe(1000000);
    });
  });

  describe('Current Phase Management', () => {
    test('should default to GAME scene when no phase saved', () => {
      expect(GameStateManager.loadCurrentPhase()).toBe(SCENE_KEYS.GAME);
    });

    test('should save and load current phase', () => {
      GameStateManager.saveCurrentPhase(SCENE_KEYS.TETRIS);
      expect(GameStateManager.loadCurrentPhase()).toBe(SCENE_KEYS.TETRIS);
    });

    test('should handle empty string phase', () => {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PHASE, '');
      expect(GameStateManager.loadCurrentPhase()).toBe(SCENE_KEYS.GAME);
    });
  });

  describe('Tetris Lines Management', () => {
    test('should load zero lines when no data saved', () => {
      expect(GameStateManager.loadTetrisLines()).toBe(0);
    });

    test('should save and load tetris lines count', () => {
      GameStateManager.saveTetrisLines(20);
      expect(GameStateManager.loadTetrisLines()).toBe(20);
    });

    test('should handle fractional tetris lines by truncating', () => {
      localStorage.setItem(STORAGE_KEYS.TETRIS_LINES, '15.7');
      expect(GameStateManager.loadTetrisLines()).toBe(15);
    });
  });

  describe('Tetrominoes Used Management', () => {
    test('should load zero tetrominoes when no data saved', () => {
      expect(GameStateManager.loadTetrominoesUsed()).toBe(0);
    });

    test('should save and load tetrominoes count', () => {
      GameStateManager.saveTetrominoesUsed(75);
      expect(GameStateManager.loadTetrominoesUsed()).toBe(75);
    });
  });

  describe('First Bubble Flag Management', () => {
    test('should load false when no flag saved', () => {
      expect(GameStateManager.loadFirstBubbleFlag()).toBe(false);
    });

    test('should save and load first bubble flag', () => {
      GameStateManager.saveFirstBubbleFlag(true);
      expect(GameStateManager.loadFirstBubbleFlag()).toBe(true);
    });

    test('should handle string boolean values', () => {
      localStorage.setItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED, 'false');
      expect(GameStateManager.loadFirstBubbleFlag()).toBe(false);
      
      localStorage.setItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED, 'true');
      expect(GameStateManager.loadFirstBubbleFlag()).toBe(true);
    });
  });

  describe('Player Lives Management', () => {
    test('should load default lives when no data saved', () => {
      expect(GameStateManager.loadPlayerLives()).toBe(GAME_CONFIG.OBSTACLES.LIVES);
    });

    test('should save and load player lives', () => {
      GameStateManager.savePlayerLives(1);
      expect(GameStateManager.loadPlayerLives()).toBe(1);
    });

    test('should handle zero lives', () => {
      GameStateManager.savePlayerLives(0);
      expect(GameStateManager.loadPlayerLives()).toBe(0);
    });
  });

  describe('Complete Game State Management', () => {
    test('should load complete game state with defaults', () => {
      const gameState = GameStateManager.loadGameState();
      
      expect(gameState).toEqual({
        bubblesCollected: 0,
        currentPhase: SCENE_KEYS.GAME,
        tetrisLines: 0,
        tetrominoesUsed: 0,
        tetrisGrid: null,
        firstBubbleCollected: false,
        playerLives: GAME_CONFIG.OBSTACLES.LIVES,
        audioEnabled: GAME_CONFIG.AUDIO.ENABLED_BY_DEFAULT
      });
    });

    test('should save and load complete game state', () => {
      const gameState = {
        bubblesCollected: 30,
        currentPhase: SCENE_KEYS.TETRIS,
        tetrisLines: 15,
        tetrominoesUsed: 50,
        firstBubbleCollected: true,
        playerLives: 2,
        audioEnabled: false
      };

      GameStateManager.saveGameState(gameState);
      const loadedState = GameStateManager.loadGameState();

      // tetrisGrid should be null when not set
      const expectedState = { ...gameState, tetrisGrid: null };
      expect(loadedState).toEqual(expectedState);
    });

    test('should save partial game state without affecting other values', () => {
      // Set initial state
      GameStateManager.saveBubblesCollected(10);
      GameStateManager.savePlayerLives(3);
      GameStateManager.saveTetrisLines(5);

      // Save partial state
      const partialState = {
        bubblesCollected: 20,
        playerLives: 1
      };
      GameStateManager.saveGameState(partialState);

      // Verify only specified values changed
      expect(GameStateManager.loadBubblesCollected()).toBe(20);
      expect(GameStateManager.loadPlayerLives()).toBe(1);
      expect(GameStateManager.loadTetrisLines()).toBe(5); // Should remain unchanged
    });
  });

  describe('Target Achievement Checks', () => {
    test('should check if bubble target is reached', () => {
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      expect(GameStateManager.hasReachedBubbleTarget()).toBe(true);

      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET - 1);
      expect(GameStateManager.hasReachedBubbleTarget()).toBe(false);

      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET + 10);
      expect(GameStateManager.hasReachedBubbleTarget()).toBe(true);
    });

    test('should check if tetris target is reached', () => {
      GameStateManager.saveTetrisLines(GAME_CONFIG.TETRIS_LINES_TARGET);
      expect(GameStateManager.hasReachedTetrisTarget()).toBe(true);

      GameStateManager.saveTetrisLines(GAME_CONFIG.TETRIS_LINES_TARGET - 1);
      expect(GameStateManager.hasReachedTetrisTarget()).toBe(false);

      GameStateManager.saveTetrisLines(GAME_CONFIG.TETRIS_LINES_TARGET + 5);
      expect(GameStateManager.hasReachedTetrisTarget()).toBe(true);
    });
  });

  describe('Resume Scene Determination', () => {
    test('should return GAME scene when bubbles not collected', () => {
      GameStateManager.saveBubblesCollected(10);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.GAME);

      expect(GameStateManager.getResumeScene()).toBe(SCENE_KEYS.GAME);
    });

    test('should return TETRIS scene when bubbles collected and tetris phase active', () => {
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.TETRIS);

      expect(GameStateManager.getResumeScene()).toBe(SCENE_KEYS.TETRIS);
    });

    test('should return GAME scene when bubbles collected but not in tetris phase', () => {
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.GAME);

      expect(GameStateManager.getResumeScene()).toBe(SCENE_KEYS.GAME);
    });

    test('should handle edge case with exactly target bubbles', () => {
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.MENU); // Some other phase

      expect(GameStateManager.getResumeScene()).toBe(SCENE_KEYS.GAME);
    });
  });

  describe('Progress Summary', () => {
    test('should generate progress summary with correct calculations', () => {
      GameStateManager.saveBubblesCollected(25);
      GameStateManager.saveTetrisLines(17);

      const summary = GameStateManager.getProgressSummary();

      expect(summary.bubblesCollected).toBe(25);
      expect(summary.bubblesTarget).toBe(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      expect(summary.bubblesProgress).toBe(50); // 25/50 * 100
      expect(summary.tetrisLines).toBe(17);
      expect(summary.tetrisTarget).toBe(GAME_CONFIG.TETRIS_LINES_TARGET);
      expect(summary.tetrisProgress).toBe(50); // 17/34 * 100
      expect(summary.bubblePhaseComplete).toBe(false);
      expect(summary.tetrisPhaseComplete).toBe(false);
      expect(summary.overallComplete).toBe(false);
    });

    test('should cap progress at 100%', () => {
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET + 10);
      GameStateManager.saveTetrisLines(GAME_CONFIG.TETRIS_LINES_TARGET + 5);

      const summary = GameStateManager.getProgressSummary();

      expect(summary.bubblesProgress).toBe(100);
      expect(summary.tetrisProgress).toBe(100);
      expect(summary.bubblePhaseComplete).toBe(true);
      expect(summary.tetrisPhaseComplete).toBe(true);
      expect(summary.overallComplete).toBe(true);
    });

    test('should handle zero progress correctly', () => {
      // Default state - no progress
      const summary = GameStateManager.getProgressSummary();

      expect(summary.bubblesProgress).toBe(0);
      expect(summary.tetrisProgress).toBe(0);
      expect(summary.bubblePhaseComplete).toBe(false);
      expect(summary.tetrisPhaseComplete).toBe(false);
      expect(summary.overallComplete).toBe(false);
    });

    test('should handle partial completion states', () => {
      // Complete bubbles but not tetris
      GameStateManager.saveBubblesCollected(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      GameStateManager.saveTetrisLines(0);

      const summary = GameStateManager.getProgressSummary();

      expect(summary.bubblePhaseComplete).toBe(true);
      expect(summary.tetrisPhaseComplete).toBe(false);
      expect(summary.overallComplete).toBe(false);
    });
  });

  describe('Clear Progress', () => {
    test('should clear all saved progress', () => {
      // Set some initial data
      GameStateManager.saveBubblesCollected(25);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.TETRIS);
      GameStateManager.saveTetrisLines(15);
      GameStateManager.saveTetrominoesUsed(50);
      GameStateManager.saveFirstBubbleFlag(true);
      GameStateManager.savePlayerLives(1);

      // Clear all progress
      GameStateManager.clearProgress();

      // Verify all data is back to defaults
      const gameState = GameStateManager.loadGameState();
      expect(gameState.bubblesCollected).toBe(0);
      expect(gameState.currentPhase).toBe(SCENE_KEYS.GAME);
      expect(gameState.tetrisLines).toBe(0);
      expect(gameState.tetrominoesUsed).toBe(0);
      expect(gameState.firstBubbleCollected).toBe(false);
      expect(gameState.playerLives).toBe(GAME_CONFIG.OBSTACLES.LIVES);
    });
  });

  describe('Data Persistence', () => {
    test('should persist data across multiple operations', () => {
      // Simulate game session
      GameStateManager.saveBubblesCollected(10);
      GameStateManager.savePlayerLives(2);
      
      // Simulate some gameplay
      GameStateManager.saveBubblesCollected(15);
      GameStateManager.saveFirstBubbleFlag(true);
      
      // Verify persistence
      expect(GameStateManager.loadBubblesCollected()).toBe(15);
      expect(GameStateManager.loadPlayerLives()).toBe(2);
      expect(GameStateManager.loadFirstBubbleFlag()).toBe(true);
    });

    test('should handle concurrent access patterns', () => {
      // Simulate rapid save/load operations
      for (let i = 0; i < 10; i++) {
        GameStateManager.saveBubblesCollected(i);
        expect(GameStateManager.loadBubblesCollected()).toBe(i);
      }
    });
  });

  describe('Audio State Management', () => {
    beforeEach(() => {
      GameStateManager.clearProgress();
    });

    test('should save and load audio enabled state', () => {
      // Test default value
      expect(GameStateManager.loadAudioEnabled()).toBe(GAME_CONFIG.AUDIO.ENABLED_BY_DEFAULT);

      // Test saving false
      GameStateManager.saveAudioEnabled(false);
      expect(GameStateManager.loadAudioEnabled()).toBe(false);

      // Test saving true
      GameStateManager.saveAudioEnabled(true);
      expect(GameStateManager.loadAudioEnabled()).toBe(true);
    });

    test('should handle invalid audio state values', () => {
      // Test that boolean conversion works for truthy/falsy values
      GameStateManager.saveAudioEnabled(0);
      expect(GameStateManager.loadAudioEnabled()).toBe(false);

      GameStateManager.saveAudioEnabled(1);
      expect(GameStateManager.loadAudioEnabled()).toBe(true);

      GameStateManager.saveAudioEnabled('');
      expect(GameStateManager.loadAudioEnabled()).toBe(false);

      GameStateManager.saveAudioEnabled('anything');
      expect(GameStateManager.loadAudioEnabled()).toBe(true);
    });

    test('should include audio state in complete game state', () => {
      GameStateManager.saveAudioEnabled(false);
      const gameState = GameStateManager.loadGameState();
      
      expect(gameState.audioEnabled).toBe(false);
    });
  });
});
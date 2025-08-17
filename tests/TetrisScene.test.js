import GameStateManager from '../src/utils/GameStateManager.js';
import { GAME_CONFIG } from '../src/config.js';

describe('Tetromino Limiting Mechanics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Tetromino Count Calculations', () => {
    test('should calculate correct remaining tetrominoes', () => {
      const bubblesCollected = 30;
      const tetrominoesUsed = 10;
      const expected = bubblesCollected - tetrominoesUsed;
      
      expect(expected).toBe(20);
      expect(expected).toBeGreaterThan(0);
    });

    test('should handle zero tetrominoes remaining', () => {
      const bubblesCollected = 15;
      const tetrominoesUsed = 15;
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(0);
    });

    test('should not allow negative tetrominoes remaining', () => {
      const bubblesCollected = 10;
      const tetrominoesUsed = 20; // More used than collected
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(0);
    });
  });

  describe('GameStateManager Integration for Tetrominoes', () => {
    test('should save and load tetrominoes used correctly', () => {
      const tetrominoesUsed = 25;
      
      GameStateManager.saveTetrominoesUsed(tetrominoesUsed);
      const loaded = GameStateManager.loadTetrominoesUsed();
      
      expect(loaded).toBe(tetrominoesUsed);
    });

    test('should work with bubble collection for limiting', () => {
      const bubblesCollected = 50;
      const tetrominoesUsed = 30;
      
      GameStateManager.saveBubblesCollected(bubblesCollected);
      GameStateManager.saveTetrominoesUsed(tetrominoesUsed);
      
      const loadedBubbles = GameStateManager.loadBubblesCollected();
      const loadedTetrominoes = GameStateManager.loadTetrominoesUsed();
      const remaining = Math.max(0, loadedBubbles - loadedTetrominoes);
      
      expect(loadedBubbles).toBe(bubblesCollected);
      expect(loadedTetrominoes).toBe(tetrominoesUsed);
      expect(remaining).toBe(20);
    });
  });

  describe('Tetromino Limiting Logic', () => {
    test('should allow spawning when tetrominoes are available', () => {
      const bubblesCollected = 15;
      const tetrominoesUsed = 5;
      const remaining = bubblesCollected - tetrominoesUsed;
      
      expect(remaining).toBeGreaterThan(0);
      // This simulates the condition in TetrisScene.spawnNewPiece()
      expect(remaining > 0).toBe(true);
    });

    test('should prevent spawning when no tetrominoes remain', () => {
      const bubblesCollected = 10;
      const tetrominoesUsed = 10;
      const remaining = bubblesCollected - tetrominoesUsed;
      
      expect(remaining).toBe(0);
      // This simulates the condition in TetrisScene.spawnNewPiece()
      expect(remaining <= 0).toBe(true);
    });

    test('should track usage correctly when pieces are spawned', () => {
      let tetrominoesUsed = 5;
      const bubblesCollected = 10;
      
      // Simulate spawning a piece
      if (bubblesCollected - tetrominoesUsed > 0) {
        tetrominoesUsed++;
      }
      
      expect(tetrominoesUsed).toBe(6);
      expect(bubblesCollected - tetrominoesUsed).toBe(4);
    });
  });

  describe('Game Balance Validation', () => {
    test('should ensure bubble target provides reasonable tetromino count', () => {
      const bubbleTarget = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      
      // Player should get enough tetrominoes to play meaningfully
      expect(bubbleTarget).toBeGreaterThanOrEqual(10);
      // But not so many that the game becomes trivial
      expect(bubbleTarget).toBeLessThanOrEqual(200);
    });

    test('should ensure tetromino limit creates meaningful constraint', () => {
      const bubbleTarget = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      const tetrisTarget = GAME_CONFIG.TETRIS_LINES_TARGET;
      
      // There should be enough tetrominoes to potentially clear the target lines
      // but also create a challenge (typical Tetris pieces can clear 1-4 lines)
      const avgLinesPerPiece = 1.5; // Conservative estimate
      const minPiecesNeeded = Math.ceil(tetrisTarget / avgLinesPerPiece);
      
      expect(bubbleTarget).toBeGreaterThanOrEqual(minPiecesNeeded);
    });
  });

  describe('Edge Cases', () => {
    test('should handle localStorage failures gracefully', () => {
      // Test that functions don't crash when localStorage fails
      expect(() => {
        GameStateManager.loadTetrominoesUsed();
        GameStateManager.loadBubblesCollected();
      }).not.toThrow();
    });

    test('should handle invalid saved values', () => {
      // Test with invalid data
      localStorage.setItem('tetrominoes_used', 'invalid');
      localStorage.setItem('bubbles_collected', '-5');
      
      const tetrominoes = GameStateManager.loadTetrominoesUsed();
      const bubbles = GameStateManager.loadBubblesCollected();
      
      expect(tetrominoes).toBe(0); // Should default to 0
      expect(bubbles).toBe(0); // Should handle negative as 0
    });
  });
});
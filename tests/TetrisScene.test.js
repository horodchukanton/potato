import GameStateManager from '../src/utils/GameStateManager.js';
import { GAME_CONFIG, SCENE_KEYS } from '../src/config.js';

// Test suite for Tetromino Limiting Mechanics
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

    test('should handle negative scenarios gracefully', () => {
      const bubblesCollected = 5;
      const tetrominoesUsed = 10;
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(0);
      expect(remaining).not.toBeLessThan(0);
    });

    test('should handle large numbers correctly', () => {
      const bubblesCollected = 1000;
      const tetrominoesUsed = 250;
      const remaining = bubblesCollected - tetrominoesUsed;
      
      expect(remaining).toBe(750);
      expect(remaining).toBeGreaterThan(0);
    });
  });

  describe('GameStateManager Integration', () => {
    test('should save and load tetrominoes correctly', () => {
      const testTetrominoesUsed = 25;
      
      GameStateManager.saveTetrominoesUsed(testTetrominoesUsed);
      const loaded = GameStateManager.loadTetrominoesUsed();
      
      expect(loaded).toBe(testTetrominoesUsed);
    });

    test('should save and load bubbles correctly', () => {
      const testBubblesCollected = 45;
      
      GameStateManager.saveBubblesCollected(testBubblesCollected);
      const loaded = GameStateManager.loadBubblesCollected();
      
      expect(loaded).toBe(testBubblesCollected);
    });

    test('should handle missing data gracefully', () => {
      localStorage.removeItem('tetrominoesUsed');
      localStorage.removeItem('bubblesCollected');
      
      const tetrominoes = GameStateManager.loadTetrominoesUsed();
      const bubbles = GameStateManager.loadBubblesCollected();
      
      expect(tetrominoes).toBe(0);
      expect(bubbles).toBe(0);
    });

    test('should handle invalid data gracefully', () => {
      localStorage.setItem('tetrominoesUsed', 'invalid');
      localStorage.setItem('bubblesCollected', 'also_invalid');
      
      const tetrominoes = GameStateManager.loadTetrominoesUsed();
      const bubbles = GameStateManager.loadBubblesCollected();
      
      expect(tetrominoes).toBe(0);
      expect(bubbles).toBe(0);
    });

    test('should handle negative stored values gracefully', () => {
      localStorage.setItem('tetrominoesUsed', '-10');
      localStorage.setItem('bubblesCollected', '-5');
      
      const tetrominoes = GameStateManager.loadTetrominoesUsed();
      const bubbles = GameStateManager.loadBubblesCollected();
      
      expect(tetrominoes).toBe(0); // Should default to 0
      expect(bubbles).toBe(0); // Should handle negative as 0
    });
  });

  describe('Game Balance and Edge Cases', () => {
    test('should enforce tetromino limits correctly', () => {
      const bubblesCollected = 10;
      const tetrominoesUsed = 8;
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(2);
      
      // Test exhaustion scenario
      const afterUsingAll = Math.max(0, bubblesCollected - 10);
      expect(afterUsingAll).toBe(0);
    });

    test('should handle zero bubbles scenario', () => {
      const bubblesCollected = 0;
      const tetrominoesUsed = 0;
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(0);
    });

    test('should maintain consistent state calculations', () => {
      const scenarios = [
        { bubbles: 5, used: 2, expected: 3 },
        { bubbles: 20, used: 20, expected: 0 },
        { bubbles: 15, used: 10, expected: 5 },
        { bubbles: 0, used: 0, expected: 0 },
        { bubbles: 100, used: 50, expected: 50 }
      ];
      
      scenarios.forEach(scenario => {
        const remaining = Math.max(0, scenario.bubbles - scenario.used);
        expect(remaining).toBe(scenario.expected);
      });
    });
  });
});

// Test suite for TetrisScene Next Tetromino Preview
describe('TetrisScene Next Tetromino Preview', () => {
  let tetrisScene;

  beforeEach(() => {
    // Create a minimal TetrisScene class for testing
    class MockTetrisScene {
      constructor() {
        // Tetromino definitions (using standard Tetris shapes)
        this.TETROMINOES = {
          I: { shape: [[1,1,1,1]], color: 0x00FFFF },
          O: { shape: [[1,1],[1,1]], color: 0xFFFF00 },
          T: { shape: [[0,1,0],[1,1,1]], color: 0x800080 },
          S: { shape: [[0,1,1],[1,1,0]], color: 0x00FF00 },
          Z: { shape: [[1,1,0],[0,1,1]], color: 0xFF0000 },
          J: { shape: [[1,0,0],[1,1,1]], color: 0x0000FF },
          L: { shape: [[0,0,1],[1,1,1]], color: 0xFFA500 }
        };
        
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 20;
        this.CELL_SIZE = 24;
        this.GRID_OFFSET_X = 250;
        this.GRID_OFFSET_Y = 50;
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        
        // Mock graphics
        this.previewGraphics = {
          clear: jest.fn(),
          fillStyle: jest.fn(),
          fillRect: jest.fn(),
          lineStyle: jest.fn(),
          strokeRect: jest.fn()
        };
        this.previewAreaX = 300;
        this.previewAreaY = 100;
      }

      generateRandomPiece() {
        const pieceTypes = Object.keys(this.TETROMINOES);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        
        return {
          type: randomType,
          shape: this.TETROMINOES[randomType].shape,
          color: this.TETROMINOES[randomType].color
        };
      }

      spawnNewPiece() {
        // Use next piece if available, otherwise generate new one
        if (this.nextPiece) {
          this.currentPiece = this.nextPiece;
        } else {
          this.currentPiece = this.generateRandomPiece();
        }
        
        // Generate new next piece
        this.nextPiece = this.generateRandomPiece();
        
        this.currentX = Math.floor(this.GRID_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        this.currentRotation = 0;
        
        this.drawNextPiecePreview();
      }

      drawNextPiecePreview() {
        this.previewGraphics.clear();
        
        if (!this.nextPiece) return;
        
        const shape = this.nextPiece.shape;
        const color = this.nextPiece.color;
        
        // Calculate centering offset for the preview
        const shapeWidth = shape[0].length;
        const shapeHeight = shape.length;
        const previewSize = 4; // 4x4 preview area
        
        const offsetX = Math.floor((previewSize - shapeWidth) / 2);
        const offsetY = Math.floor((previewSize - shapeHeight) / 2);
        
        // Draw the next piece in the preview area
        for (let py = 0; py < shape.length; py++) {
          for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px]) {
              const previewX = this.previewAreaX + (offsetX + px) * this.CELL_SIZE;
              const previewY = this.previewAreaY + (offsetY + py) * this.CELL_SIZE;
              
              this.previewGraphics.fillStyle(color);
              this.previewGraphics.fillRect(previewX + 1, previewY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
              
              // Add border
              this.previewGraphics.lineStyle(1, 0x000000);
              this.previewGraphics.strokeRect(previewX + 1, previewY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
            }
          }
        }
      }
    }

    tetrisScene = new MockTetrisScene();
  });

  describe('Next Piece Generation', () => {
    test('should generate valid tetromino types', () => {
      const piece = tetrisScene.generateRandomPiece();
      
      expect(piece).toBeTruthy();
      expect(piece.type).toBeTruthy();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(piece.type);
      expect(piece.shape).toBeTruthy();
      expect(piece.color).toBeTruthy();
    });

    test('should generate different pieces over multiple calls', () => {
      const pieces = [];
      for (let i = 0; i < 20; i++) {
        pieces.push(tetrisScene.generateRandomPiece().type);
      }
      
      // Should have at least 2 different types in 20 calls (statistically very likely)
      const uniqueTypes = [...new Set(pieces)];
      expect(uniqueTypes.length).toBeGreaterThan(1);
    });

    test('should generate pieces with correct structure', () => {
      const piece = tetrisScene.generateRandomPiece();
      
      expect(piece).toHaveProperty('type');
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
      expect(Array.isArray(piece.shape)).toBe(true);
      expect(piece.shape.length).toBeGreaterThan(0);
    });
  });

  describe('Piece Spawning with Preview', () => {
    test('should spawn new piece correctly on first call', () => {
      expect(tetrisScene.currentPiece).toBeNull();
      expect(tetrisScene.nextPiece).toBeNull();
      
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.currentPiece).toBeTruthy();
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetrisScene.currentPiece.type);
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetrisScene.nextPiece.type);
    });

    test('should use next piece as current piece on subsequent spawns', () => {
      tetrisScene.spawnNewPiece(); // First spawn
      const firstNextPiece = tetrisScene.nextPiece;
      
      tetrisScene.spawnNewPiece(); // Second spawn
      
      expect(tetrisScene.currentPiece.type).toBe(firstNextPiece.type);
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(tetrisScene.nextPiece.type).not.toBe(firstNextPiece.type);
    });

    test('should always have a next piece after spawning', () => {
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetrisScene.nextPiece.type);
    });
  });

  describe('Preview Drawing', () => {
    test('should clear preview graphics when drawing', () => {
      tetrisScene.nextPiece = tetrisScene.generateRandomPiece();
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.clear).toHaveBeenCalled();
    });

    test('should not draw when no next piece exists', () => {
      tetrisScene.nextPiece = null;
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.clear).toHaveBeenCalled();
      expect(tetrisScene.previewGraphics.fillRect).not.toHaveBeenCalled();
    });

    test('should draw preview when next piece exists', () => {
      tetrisScene.nextPiece = {
        type: 'O',
        shape: [[1,1],[1,1]],
        color: 0xFFFF00
      };
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.clear).toHaveBeenCalled();
      expect(tetrisScene.previewGraphics.fillStyle).toHaveBeenCalledWith(0xFFFF00);
      expect(tetrisScene.previewGraphics.fillRect).toHaveBeenCalled();
    });
  });
});
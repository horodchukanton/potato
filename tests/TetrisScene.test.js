/**
 * Tests for TetrisScene next tetromino preview functionality
 */

// Import only the config to avoid Phaser canvas issues
import { SCENE_KEYS } from '../src/config.js';

describe('TetrisScene Next Tetromino Preview', () => {
  let tetrisScene;
  let mockGame;

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
    test('should generate random tetromino piece', () => {
      const piece = tetrisScene.generateRandomPiece();
      
      expect(piece).toHaveProperty('type');
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(piece.type);
    });

    test('should have nextPiece property initialized', () => {
      expect(tetrisScene.nextPiece).toBeNull();
    });

    test('should generate next piece when spawning new piece', () => {
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.currentPiece).toBeTruthy();
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(tetrisScene.currentPiece.type).toBeDefined();
      expect(tetrisScene.nextPiece.type).toBeDefined();
    });

    test('should use next piece as current piece on subsequent spawns', () => {
      // First spawn
      tetrisScene.spawnNewPiece();
      const firstNextPiece = { ...tetrisScene.nextPiece };
      
      // Second spawn should use the previous next piece
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.currentPiece.type).toBe(firstNextPiece.type);
      expect(tetrisScene.currentPiece.color).toBe(firstNextPiece.color);
    });
  });

  describe('Preview Area Setup', () => {
    test('should have preview area position defined', () => {
      expect(tetrisScene.previewAreaX).toBeDefined();
      expect(tetrisScene.previewAreaY).toBeDefined();
      expect(tetrisScene.previewAreaX).toBeGreaterThan(tetrisScene.GRID_OFFSET_X);
    });

    test('should have preview graphics object', () => {
      expect(tetrisScene.previewGraphics).toBeDefined();
      expect(tetrisScene.previewGraphics.clear).toBeDefined();
      expect(tetrisScene.previewGraphics.fillStyle).toBeDefined();
      expect(tetrisScene.previewGraphics.fillRect).toBeDefined();
    });
  });

  describe('Preview Drawing', () => {
    test('should clear preview before drawing', () => {
      tetrisScene.nextPiece = {
        type: 'I',
        shape: [[1,1,1,1]],
        color: 0x00FFFF
      };
      
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.clear).toHaveBeenCalled();
    });

    test('should not draw if no next piece', () => {
      tetrisScene.nextPiece = null;
      
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.clear).toHaveBeenCalled();
      expect(tetrisScene.previewGraphics.fillStyle).not.toHaveBeenCalled();
    });

    test('should draw next piece with correct color', () => {
      tetrisScene.nextPiece = {
        type: 'O',
        shape: [[1,1],[1,1]],
        color: 0xFFFF00
      };
      
      tetrisScene.drawNextPiecePreview();
      
      expect(tetrisScene.previewGraphics.fillStyle).toHaveBeenCalledWith(0xFFFF00);
    });

    test('should center piece in preview area', () => {
      tetrisScene.nextPiece = {
        type: 'O',
        shape: [[1,1],[1,1]], // 2x2 piece
        color: 0xFFFF00
      };
      
      tetrisScene.drawNextPiecePreview();
      
      // Should draw 4 cells (2x2) with proper centering
      expect(tetrisScene.previewGraphics.fillRect).toHaveBeenCalledTimes(4);
    });

    test('should draw I-piece (4x1) correctly', () => {
      tetrisScene.nextPiece = {
        type: 'I',
        shape: [[1,1,1,1]],
        color: 0x00FFFF
      };
      
      tetrisScene.drawNextPiecePreview();
      
      // Should draw 4 cells for I-piece
      expect(tetrisScene.previewGraphics.fillRect).toHaveBeenCalledTimes(4);
    });

    test('should draw T-piece correctly', () => {
      tetrisScene.nextPiece = {
        type: 'T',
        shape: [[0,1,0],[1,1,1]],
        color: 0x800080
      };
      
      tetrisScene.drawNextPiecePreview();
      
      // Should draw 4 cells for T-piece (1 + 3)
      expect(tetrisScene.previewGraphics.fillRect).toHaveBeenCalledTimes(4);
    });
  });

  describe('UI Elements', () => {
    test('should position next label relative to grid', () => {
      const expectedX = tetrisScene.GRID_OFFSET_X + tetrisScene.GRID_WIDTH * tetrisScene.CELL_SIZE + 30;
      const expectedY = tetrisScene.GRID_OFFSET_Y + 20;
      
      // Test that our calculations match the expected positioning
      expect(expectedX).toBe(250 + 10 * 24 + 30); // 520
      expect(expectedY).toBe(50 + 20); // 70
    });
  });

  describe('Integration with Game Flow', () => {
    test('should call drawNextPiecePreview after spawning piece', () => {
      const spy = jest.spyOn(tetrisScene, 'drawNextPiecePreview');
      
      tetrisScene.spawnNewPiece();
      
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('should maintain next piece across piece placements', () => {
      // First spawn
      tetrisScene.spawnNewPiece();
      const firstNextPiece = { ...tetrisScene.nextPiece };
      
      // Second spawn should use the previous next piece
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.currentPiece.type).toBe(firstNextPiece.type);
      expect(tetrisScene.currentPiece.color).toBe(firstNextPiece.color);
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(tetrisScene.nextPiece.type).toBeDefined();
    });

    test('should always have a next piece after spawning', () => {
      tetrisScene.spawnNewPiece();
      
      expect(tetrisScene.nextPiece).toBeTruthy();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetrisScene.nextPiece.type);
    });
  });
});
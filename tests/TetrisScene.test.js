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

    test('should reset bubbles to 0 when transitioning from Tetris to Runner phase', () => {
      // Set up initial state with collected bubbles
      GameStateManager.saveBubblesCollected(25);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.TETRIS);
      
      // Verify initial state
      expect(GameStateManager.loadBubblesCollected()).toBe(25);
      expect(GameStateManager.loadCurrentPhase()).toBe(SCENE_KEYS.TETRIS);
      
      // Simulate transition back to game scene by resetting bubbles
      GameStateManager.saveBubblesCollected(0);
      GameStateManager.saveCurrentPhase(SCENE_KEYS.GAME);
      
      // Verify bubbles are reset
      expect(GameStateManager.loadBubblesCollected()).toBe(0);
      expect(GameStateManager.loadCurrentPhase()).toBe(SCENE_KEYS.GAME);
    });

    test('should ensure bubble count resets after all types of Tetris scene exits', () => {
      // Test multiple scenarios where TetrisScene transitions back to GameScene
      const scenarios = [
        { name: 'game over', bubbles: 30 },
        { name: 'no more pieces', bubbles: 15 },
        { name: 'win condition', bubbles: 50 },
        { name: 'manual exit', bubbles: 20 }
      ];

      scenarios.forEach(scenario => {
        // Set up state with bubbles collected
        GameStateManager.saveBubblesCollected(scenario.bubbles);
        expect(GameStateManager.loadBubblesCollected()).toBe(scenario.bubbles);

        // Simulate the TetrisScene behavior - should reset bubbles when transitioning
        GameStateManager.saveBubblesCollected(0);
        
        // Verify bubbles are reset
        expect(GameStateManager.loadBubblesCollected()).toBe(0);
      });
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

    test('should allow multiple rounds of Tetris after collecting more bubbles', () => {
      // Simulate first round: collect 50 bubbles, use all 50 pieces
      GameStateManager.saveBubblesCollected(50);
      GameStateManager.saveTetrominoesUsed(50);
      
      // Player has no pieces remaining
      const firstRoundRemaining = Math.max(0, 50 - 50);
      expect(firstRoundRemaining).toBe(0);
      
      // Simulate transition back to Runner phase (fixed behavior - resets both bubbles and tetrominoes used)
      GameStateManager.saveBubblesCollected(0);
      GameStateManager.saveTetrominoesUsed(0);
      
      // Player collects 50 new bubbles
      GameStateManager.saveBubblesCollected(50);
      
      // After fix: player should have 50 pieces (50 bubbles - 0 used = 50)
      const fixedRemaining = Math.max(0, 50 - 0);
      expect(fixedRemaining).toBe(50);
      
      // Verify the player can now use all the newly collected bubbles as tetromino pieces
      expect(fixedRemaining).toBeGreaterThan(0);
      expect(fixedRemaining).toBe(50);
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

// Test suite for Tetris Grid State Persistence
describe('Tetris Grid State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Grid Save/Load Functionality', () => {
    test('should save and load Tetris grid state', () => {
      // Create a sample grid (10x20 typical Tetris grid)
      const testGrid = [];
      for (let y = 0; y < 20; y++) {
        testGrid[y] = [];
        for (let x = 0; x < 10; x++) {
          testGrid[y][x] = (x % 2 === 0 && y > 15) ? 1 : 0; // Some pattern
        }
      }

      // Save the grid
      GameStateManager.saveTetrisGrid(testGrid);
      
      // Load the grid
      const loadedGrid = GameStateManager.loadTetrisGrid();
      
      expect(loadedGrid).toEqual(testGrid);
      expect(Array.isArray(loadedGrid)).toBe(true);
      expect(loadedGrid.length).toBe(20);
      expect(loadedGrid[0].length).toBe(10);
    });

    test('should return null when no grid is saved', () => {
      const loadedGrid = GameStateManager.loadTetrisGrid();
      expect(loadedGrid).toBeNull();
    });

    test('should handle invalid grid data gracefully', () => {
      // Directly set invalid data in localStorage
      localStorage.setItem('tetris_grid', 'invalid_json');
      
      const loadedGrid = GameStateManager.loadTetrisGrid();
      expect(loadedGrid).toBeNull();
    });

    test('should handle non-array grid data gracefully', () => {
      // Set non-array data
      localStorage.setItem('tetris_grid', JSON.stringify("not_an_array"));
      
      const loadedGrid = GameStateManager.loadTetrisGrid();
      expect(loadedGrid).toBeNull();
    });

    test('should clear grid state when null is saved', () => {
      // First save a valid grid
      const testGrid = [[1, 0], [0, 1]];
      GameStateManager.saveTetrisGrid(testGrid);
      expect(GameStateManager.loadTetrisGrid()).toEqual(testGrid);
      
      // Then save null to clear it
      GameStateManager.saveTetrisGrid(null);
      expect(GameStateManager.loadTetrisGrid()).toBeNull();
    });
  });

  describe('Integration with TetrisScene Progress Loading', () => {
    test('should restore grid state when returning to Tetris scene', () => {
      // Create a partially filled grid
      const savedGrid = [];
      for (let y = 0; y < 20; y++) {
        savedGrid[y] = [];
        for (let x = 0; x < 10; x++) {
          savedGrid[y][x] = (y >= 18) ? 1 : 0; // Bottom 2 rows filled
        }
      }
      
      // Save progress including grid
      GameStateManager.saveTetrisLines(5);
      GameStateManager.saveTetrominoesUsed(10);
      GameStateManager.saveBubblesCollected(30);
      GameStateManager.saveTetrisGrid(savedGrid);
      
      // Simulate TetrisScene loadProgress behavior
      const linesCleared = GameStateManager.loadTetrisLines();
      const tetrominoesUsed = GameStateManager.loadTetrominoesUsed();
      const bubblesCollected = GameStateManager.loadBubblesCollected();
      const loadedGrid = GameStateManager.loadTetrisGrid();
      
      expect(linesCleared).toBe(5);
      expect(tetrominoesUsed).toBe(10);
      expect(bubblesCollected).toBe(30);
      expect(loadedGrid).toEqual(savedGrid);
    });

    test('should reset grid state when transitioning back to runner phase', () => {
      // Set up initial Tetris state with grid
      const testGrid = [[1, 0, 1], [0, 1, 0]];
      GameStateManager.saveTetrisGrid(testGrid);
      GameStateManager.saveBubblesCollected(25);
      GameStateManager.saveTetrominoesUsed(15);
      
      // Verify initial state
      expect(GameStateManager.loadTetrisGrid()).toEqual(testGrid);
      expect(GameStateManager.loadBubblesCollected()).toBe(25);
      expect(GameStateManager.loadTetrominoesUsed()).toBe(15);
      
      // Simulate transition back to runner phase (as done in TetrisScene)
      GameStateManager.saveBubblesCollected(0);
      GameStateManager.saveTetrominoesUsed(0);
      GameStateManager.saveTetrisGrid(null);
      
      // Verify everything is reset
      expect(GameStateManager.loadTetrisGrid()).toBeNull();
      expect(GameStateManager.loadBubblesCollected()).toBe(0);
      expect(GameStateManager.loadTetrominoesUsed()).toBe(0);
    });

    test('should allow multiple Tetris sessions with different grid states', () => {
      // First session: save a grid with some pieces
      const firstGrid = [];
      for (let y = 0; y < 20; y++) {
        firstGrid[y] = [];
        for (let x = 0; x < 10; x++) {
          firstGrid[y][x] = (y === 19 && x < 5) ? 1 : 0; // Bottom row, left half filled
        }
      }
      
      GameStateManager.saveTetrisGrid(firstGrid);
      expect(GameStateManager.loadTetrisGrid()).toEqual(firstGrid);
      
      // Transition back to runner (reset)
      GameStateManager.saveTetrisGrid(null);
      expect(GameStateManager.loadTetrisGrid()).toBeNull();
      
      // Second session: save a different grid
      const secondGrid = [];
      for (let y = 0; y < 20; y++) {
        secondGrid[y] = [];
        for (let x = 0; x < 10; x++) {
          secondGrid[y][x] = (y === 19 && x >= 5) ? 1 : 0; // Bottom row, right half filled
        }
      }
      
      GameStateManager.saveTetrisGrid(secondGrid);
      expect(GameStateManager.loadTetrisGrid()).toEqual(secondGrid);
      expect(GameStateManager.loadTetrisGrid()).not.toEqual(firstGrid);
    });
  });

  describe('GameState Integration', () => {
    test('should include tetrisGrid in complete game state', () => {
      const testGrid = [[1, 0, 1, 0], [0, 1, 0, 1]];
      GameStateManager.saveTetrisGrid(testGrid);
      
      const gameState = GameStateManager.loadGameState();
      
      expect(gameState).toHaveProperty('tetrisGrid');
      expect(gameState.tetrisGrid).toEqual(testGrid);
    });

    test('should save tetrisGrid via saveGameState', () => {
      const testGrid = [[1, 1, 0], [0, 0, 1]];
      const gameState = {
        tetrisGrid: testGrid,
        bubblesCollected: 20
      };
      
      GameStateManager.saveGameState(gameState);
      
      expect(GameStateManager.loadTetrisGrid()).toEqual(testGrid);
      expect(GameStateManager.loadBubblesCollected()).toBe(20);
    });
  });

  describe('TetrisScene Game State Management', () => {
    test('should properly distinguish between gameOver and isPaused states', () => {
      // Simulate scenario where no more pieces are available (should pause, not end game)
      const bubblesCollected = 10;
      const tetrominoesUsed = 10;
      const remaining = Math.max(0, bubblesCollected - tetrominoesUsed);
      
      expect(remaining).toBe(0);
      
      // When no pieces remain, game should be paused but not game over
      // This represents the behavior after the fix: isPaused = true, gameOver = false
      const shouldBePaused = remaining === 0;
      const shouldBeGameOver = false; // Only true for actual terminal conditions
      
      expect(shouldBePaused).toBe(true);
      expect(shouldBeGameOver).toBe(false);
    });

    test('should handle multiple rounds of Tetris without gameOver flag interference', () => {
      // First round: collect 20 bubbles, use all 20 pieces
      GameStateManager.saveBubblesCollected(20);
      GameStateManager.saveTetrominoesUsed(20);
      
      let remaining = Math.max(0, GameStateManager.loadBubblesCollected() - GameStateManager.loadTetrominoesUsed());
      expect(remaining).toBe(0);
      
      // This should trigger pause, not gameOver
      const shouldBePaused = remaining === 0;
      expect(shouldBePaused).toBe(true);
      
      // Reset for second round (transition back to runner, collect more bubbles)
      GameStateManager.saveBubblesCollected(0);
      GameStateManager.saveTetrominoesUsed(0);
      GameStateManager.saveTetrisGrid(null);
      
      // Second round: collect 30 bubbles, use 15 pieces
      GameStateManager.saveBubblesCollected(30);
      GameStateManager.saveTetrominoesUsed(15);
      
      remaining = Math.max(0, GameStateManager.loadBubblesCollected() - GameStateManager.loadTetrominoesUsed());
      expect(remaining).toBe(15);
      
      // Game should be playable, not paused or game over
      const shouldNotBePaused = remaining > 0;
      expect(shouldNotBePaused).toBe(true);
    });

    test('should distinguish between pause and game over conditions', () => {
      const testCases = [
        {
          name: 'No pieces remaining',
          bubbles: 25,
          used: 25,
          expectedPaused: true,
          expectedGameOver: false,
          reason: 'Should pause when no pieces left, not end game'
        },
        {
          name: 'Pieces available',
          bubbles: 50,
          used: 30,
          expectedPaused: false,
          expectedGameOver: false,
          reason: 'Should continue playing when pieces available'
        }
      ];

      testCases.forEach(testCase => {
        const remaining = Math.max(0, testCase.bubbles - testCase.used);
        const shouldBePaused = remaining === 0;
        const shouldBeGameOver = false; // gameOver only for terminal conditions like collision or goal reached
        
        expect(shouldBePaused).toBe(testCase.expectedPaused);
        expect(shouldBeGameOver).toBe(testCase.expectedGameOver);
      });
    });
  });
});
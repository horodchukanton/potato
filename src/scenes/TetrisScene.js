import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, STORAGE_KEYS } from '../config.js';

/**
 * TetrisScene handles the Tetris gameplay inside character's belly
 */
export default class TetrisScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.TETRIS });
    
    // Tetris grid configuration
    this.GRID_WIDTH = 10;
    this.GRID_HEIGHT = 20;
    this.CELL_SIZE = 24;
    this.GRID_OFFSET_X = 250;
    this.GRID_OFFSET_Y = 50;
    
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
    
    // Game state
    this.grid = [];
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentRotation = 0;
    this.dropTimer = null;
    this.dropSpeed = 1000; // Initial drop speed in milliseconds
    this.linesCleared = 0;
    this.gameOver = false;
    this.pieces = [];
  }

  /**
   * Initialize the scene
   */
  create() {
    const { width, height } = this.scale;
    
    // Load saved progress
    this.loadProgress();
    
    // Create background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    
    // Create title
    this.add.text(width / 2, 30, 'TETRIS PHASE', {
      font: '32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Initialize grid
    this.initializeGrid();
    
    // Create UI elements
    this.createUI();
    
    // Create grid graphics
    this.createGridGraphics();
    
    // Set up input controls
    this.setupControls();
    
    // Start the game
    this.spawnNewPiece();
    this.startDropTimer();
    
    console.log('TetrisScene initialized');
  }

  /**
   * Initialize the game grid
   */
  initializeGrid() {
    this.grid = [];
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        this.grid[y][x] = 0;
      }
    }
  }

  /**
   * Create UI elements
   */
  createUI() {
    const { width } = this.scale;
    
    // Lines cleared counter
    this.linesText = this.add.text(50, 100, `Lines: ${this.linesCleared}/${GAME_CONFIG.TETRIS_LINES_TARGET}`, {
      font: '20px Arial',
      fill: '#ffffff'
    });
    
    // Speed indicator
    this.speedText = this.add.text(50, 130, `Speed: ${this.getSpeedLevel()}`, {
      font: '20px Arial',
      fill: '#ffffff'
    });
    
    // Instructions
    this.add.text(50, 200, 'Controls:', {
      font: '16px Arial',
      fill: '#cccccc'
    });
    
    this.add.text(50, 220, 'Arrow Keys: Move', {
      font: '14px Arial',
      fill: '#cccccc'
    });
    
    this.add.text(50, 240, 'Up: Rotate', {
      font: '14px Arial',
      fill: '#cccccc'
    });
    
    this.add.text(50, 260, 'Down: Drop Fast', {
      font: '14px Arial',
      fill: '#cccccc'
    });
    
    // Back to game button
    this.add.text(50, 320, 'ESC: Return to Game', {
      font: '14px Arial',
      fill: '#cccccc'
    });
  }

  /**
   * Create grid graphics
   */
  createGridGraphics() {
    this.gridGraphics = this.add.graphics();
    this.pieceGraphics = this.add.graphics();
    
    // Draw grid border
    this.gridGraphics.lineStyle(2, 0x444444);
    this.gridGraphics.strokeRect(
      this.GRID_OFFSET_X - 1,
      this.GRID_OFFSET_Y - 1,
      this.GRID_WIDTH * this.CELL_SIZE + 2,
      this.GRID_HEIGHT * this.CELL_SIZE + 2
    );
    
    // Draw grid lines
    this.gridGraphics.lineStyle(1, 0x222222);
    for (let x = 0; x <= this.GRID_WIDTH; x++) {
      this.gridGraphics.moveTo(this.GRID_OFFSET_X + x * this.CELL_SIZE, this.GRID_OFFSET_Y);
      this.gridGraphics.lineTo(this.GRID_OFFSET_X + x * this.CELL_SIZE, this.GRID_OFFSET_Y + this.GRID_HEIGHT * this.CELL_SIZE);
    }
    for (let y = 0; y <= this.GRID_HEIGHT; y++) {
      this.gridGraphics.moveTo(this.GRID_OFFSET_X, this.GRID_OFFSET_Y + y * this.CELL_SIZE);
      this.gridGraphics.lineTo(this.GRID_OFFSET_X + this.GRID_WIDTH * this.CELL_SIZE, this.GRID_OFFSET_Y + y * this.CELL_SIZE);
    }
  }

  /**
   * Set up input controls
   */
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // Prevent default arrow key behavior
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);
  }

  /**
   * Spawn a new tetromino piece
   */
  spawnNewPiece() {
    const pieceTypes = Object.keys(this.TETROMINOES);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    
    this.currentPiece = {
      type: randomType,
      shape: this.TETROMINOES[randomType].shape,
      color: this.TETROMINOES[randomType].color
    };
    
    this.currentX = Math.floor(this.GRID_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentY = 0;
    this.currentRotation = 0;
    
    // Check for game over
    if (this.isColliding(this.currentX, this.currentY, this.currentPiece.shape)) {
      this.gameOver = true;
      this.endGame();
      return;
    }
    
    this.redrawPieces();
  }

  /**
   * Check if piece position would cause collision
   */
  isColliding(x, y, shape) {
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;
          
          if (newX < 0 || newX >= this.GRID_WIDTH || newY >= this.GRID_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Move piece left
   */
  movePieceLeft() {
    if (!this.gameOver && this.currentPiece && !this.isColliding(this.currentX - 1, this.currentY, this.currentPiece.shape)) {
      this.currentX--;
      this.redrawPieces();
    }
  }

  /**
   * Move piece right
   */
  movePieceRight() {
    if (!this.gameOver && this.currentPiece && !this.isColliding(this.currentX + 1, this.currentY, this.currentPiece.shape)) {
      this.currentX++;
      this.redrawPieces();
    }
  }

  /**
   * Rotate piece
   */
  rotatePiece() {
    if (!this.gameOver && this.currentPiece) {
      const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
      if (!this.isColliding(this.currentX, this.currentY, rotatedShape)) {
        this.currentPiece.shape = rotatedShape;
        this.redrawPieces();
      }
    }
  }

  /**
   * Rotate matrix 90 degrees clockwise
   */
  rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];
    
    for (let col = 0; col < cols; col++) {
      rotated[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        rotated[col][rows - 1 - row] = matrix[row][col];
      }
    }
    
    return rotated;
  }

  /**
   * Drop piece one step
   */
  dropPiece() {
    if (!this.gameOver && this.currentPiece) {
      if (!this.isColliding(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
        this.currentY++;
        this.redrawPieces();
      } else {
        this.placePiece();
      }
    }
  }

  /**
   * Place piece on grid and spawn new one
   */
  placePiece() {
    // Add piece to grid
    for (let py = 0; py < this.currentPiece.shape.length; py++) {
      for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
        if (this.currentPiece.shape[py][px]) {
          const gridX = this.currentX + px;
          const gridY = this.currentY + py;
          if (gridY >= 0) {
            this.grid[gridY][gridX] = this.currentPiece.color;
          }
        }
      }
    }
    
    // Check for completed lines
    this.clearLines();
    
    // Spawn next piece
    this.spawnNewPiece();
  }

  /**
   * Clear completed lines
   */
  clearLines() {
    let linesThisTime = 0;
    
    for (let y = this.GRID_HEIGHT - 1; y >= 0; y--) {
      let lineComplete = true;
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        if (!this.grid[y][x]) {
          lineComplete = false;
          break;
        }
      }
      
      if (lineComplete) {
        // Remove the line
        this.grid.splice(y, 1);
        // Add new empty line at top
        this.grid.unshift(new Array(this.GRID_WIDTH).fill(0));
        linesThisTime++;
        y++; // Check this line again
      }
    }
    
    if (linesThisTime > 0) {
      this.linesCleared += linesThisTime;
      this.updateSpeed();
      this.updateUI();
      this.saveProgress();
      
      // Check win condition
      if (this.linesCleared >= GAME_CONFIG.TETRIS_LINES_TARGET) {
        this.winGame();
      }
    }
  }

  /**
   * Update drop speed based on lines cleared
   */
  updateSpeed() {
    const speedLevel = this.getSpeedLevel();
    // Increase speed every 10 lines, capped at level 10
    this.dropSpeed = Math.max(100, 1000 - (speedLevel * 100));
    
    // Restart drop timer with new speed
    if (this.dropTimer) {
      this.dropTimer.destroy();
    }
    this.startDropTimer();
  }

  /**
   * Get current speed level
   */
  getSpeedLevel() {
    return Math.min(10, Math.floor(this.linesCleared / 10) + 1);
  }

  /**
   * Update UI text
   */
  updateUI() {
    this.linesText.setText(`Lines: ${this.linesCleared}/${GAME_CONFIG.TETRIS_LINES_TARGET}`);
    this.speedText.setText(`Speed: ${this.getSpeedLevel()}`);
  }

  /**
   * Start drop timer
   */
  startDropTimer() {
    this.dropTimer = this.time.addEvent({
      delay: this.dropSpeed,
      callback: this.dropPiece,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Redraw all pieces on screen
   */
  redrawPieces() {
    this.pieceGraphics.clear();
    
    // Draw grid pieces
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        if (this.grid[y][x]) {
          this.drawCell(x, y, this.grid[y][x]);
        }
      }
    }
    
    // Draw current piece
    if (this.currentPiece) {
      for (let py = 0; py < this.currentPiece.shape.length; py++) {
        for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
          if (this.currentPiece.shape[py][px]) {
            this.drawCell(this.currentX + px, this.currentY + py, this.currentPiece.color);
          }
        }
      }
    }
  }

  /**
   * Draw a single cell
   */
  drawCell(x, y, color) {
    const pixelX = this.GRID_OFFSET_X + x * this.CELL_SIZE;
    const pixelY = this.GRID_OFFSET_Y + y * this.CELL_SIZE;
    
    this.pieceGraphics.fillStyle(color);
    this.pieceGraphics.fillRect(pixelX + 1, pixelY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    
    // Add border
    this.pieceGraphics.lineStyle(1, 0x000000);
    this.pieceGraphics.strokeRect(pixelX + 1, pixelY + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
  }

  /**
   * Handle game over
   */
  endGame() {
    if (this.dropTimer) {
      this.dropTimer.destroy();
    }
    
    const { width, height } = this.scale;
    
    // Create game over overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    
    this.add.text(width / 2, height / 2 - 50, 'Game Over!', {
      font: '32px Arial',
      fill: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2, `Lines Cleared: ${this.linesCleared}`, {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Return button
    const returnButton = this.add.text(width / 2, height / 2 + 50, 'Return to Game', {
      font: '18px Arial',
      fill: '#3498db',
      backgroundColor: '#2c3e50',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    returnButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }

  /**
   * Handle win condition
   */
  winGame() {
    if (this.dropTimer) {
      this.dropTimer.destroy();
    }
    
    const { width, height } = this.scale;
    
    // Create win overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    
    this.add.text(width / 2, height / 2 - 50, 'Happy Birthday!', {
      font: '32px Arial',
      fill: '#00ff00',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2, `Congratulations! You cleared ${this.linesCleared} lines!`, {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Return button
    const returnButton = this.add.text(width / 2, height / 2 + 50, 'Return to Game', {
      font: '18px Arial',
      fill: '#3498db',
      backgroundColor: '#2c3e50',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    returnButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }

  /**
   * Load progress from LocalStorage
   */
  loadProgress() {
    const savedLines = localStorage.getItem(STORAGE_KEYS.TETRIS_LINES);
    if (savedLines) {
      this.linesCleared = parseInt(savedLines, 10);
    }
  }

  /**
   * Save progress to LocalStorage
   */
  saveProgress() {
    localStorage.setItem(STORAGE_KEYS.TETRIS_LINES, this.linesCleared.toString());
    localStorage.setItem(STORAGE_KEYS.CURRENT_PHASE, 'tetris');
  }

  /**
   * Update loop
   */
  update() {
    if (this.gameOver) return;
    
    // Handle input with some basic key repeat prevention
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePieceLeft();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePieceRight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.rotatePiece();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.dropPiece();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start(SCENE_KEYS.GAME);
    }
  }
}
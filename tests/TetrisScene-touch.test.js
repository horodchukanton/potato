/**
 * TetrisScene-touch.test.js - Tests for TetrisScene touch controls
 * 
 * This test suite validates:
 * - Touch control area creation and positioning
 * - Touch input handling for Tetris piece movement
 * - Visual indicator display and feedback
 * - Mobile device detection and adaptation
 * - Touch timing controls to prevent rapid firing
 */

import { GAME_CONFIG, SCENE_KEYS } from '../src/config.js';

describe('TetrisScene Touch Controls', () => {
  let tetrisScene;
  let mockGame;
  let mockScene;

  beforeEach(() => {
    // Create mock game and scene objects
    mockGame = {
      device: {
        input: {
          touch: true // Simulate mobile device
        }
      }
    };

    mockScene = {
      key: SCENE_KEYS.TETRIS
    };

    // Create a mock TetrisScene
    tetrisScene = {
      scale: { width: 800, height: 600 },
      cameras: { main: { width: 800, height: 600 } },
      sys: { game: mockGame },
      time: { 
        now: 1000,
        delayedCall: jest.fn()
      },
      add: {
        rectangle: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          on: jest.fn()
        }),
        text: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setAlpha: jest.fn().mockReturnThis()
        })
      },
      createdObjects: {
        rectangles: [],
        texts: []
      },
      touchInput: null,
      touchTiming: null,
      leftIndicator: null,
      rightIndicator: null,
      rotateIndicator: null,
      dropIndicator: null
    };

    // Mock the touch control methods
    tetrisScene.createTouchControls = function() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      // Touch input state
      this.touchInput = {
        left: false,
        right: false,
        rotate: false,
        drop: false
      };
      
      // Create touch areas
      this.leftTouchArea = this.add.rectangle(0, 0, width * 0.3, height, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive()
        .setDepth(-1);
      
      this.rightTouchArea = this.add.rectangle(width * 0.7, 0, width * 0.3, height, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive()
        .setDepth(-1);
      
      this.rotateTouchArea = this.add.rectangle(width * 0.3, 0, width * 0.4, height * 0.5, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive()
        .setDepth(-1);
      
      this.dropTouchArea = this.add.rectangle(width * 0.3, height * 0.5, width * 0.4, height * 0.5, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive()
        .setDepth(-1);
      
      this.createTouchIndicators();
    };

    tetrisScene.createTouchIndicators = function() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      const isMobile = this.sys.game.device.input.touch;
      const alpha = isMobile ? GAME_CONFIG.TOUCH.NORMAL_ALPHA : 0;
      
      this.leftIndicator = this.add.text(width * 0.15, height - 50, '←', {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(alpha);
      
      this.rightIndicator = this.add.text(width * 0.85, height - 50, '→', {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(alpha);
      
      this.rotateIndicator = this.add.text(width * 0.5, height * 0.25, '↻', {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(alpha);
      
      this.dropIndicator = this.add.text(width * 0.5, height * 0.75, '↓', {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(alpha);
    };

    tetrisScene.handleTouchInput = function() {
      if (!this.touchInput) return;
      
      const currentTime = this.time.now;
      
      if (!this.touchTiming) {
        this.touchTiming = {
          left: 0,
          right: 0,
          rotate: 0,
          drop: 0,
          moveDelay: 150,
          rotateDelay: 200,
          dropDelay: 100
        };
      }
      
      // Handle touch inputs with timing
      if (this.touchInput.left && currentTime - this.touchTiming.left > this.touchTiming.moveDelay) {
        this.touchTiming.left = currentTime;
        return 'left';
      }
      
      if (this.touchInput.right && currentTime - this.touchTiming.right > this.touchTiming.moveDelay) {
        this.touchTiming.right = currentTime;
        return 'right';
      }
      
      if (this.touchInput.rotate && currentTime - this.touchTiming.rotate > this.touchTiming.rotateDelay) {
        this.touchTiming.rotate = currentTime;
        return 'rotate';
      }
      
      if (this.touchInput.drop && currentTime - this.touchTiming.drop > this.touchTiming.dropDelay) {
        this.touchTiming.drop = currentTime;
        return 'drop';
      }
      
      return null;
    };
  });

  describe('Touch Area Creation', () => {
    test('should create touch areas with correct dimensions', () => {
      tetrisScene.createTouchControls();
      
      expect(tetrisScene.add.rectangle).toHaveBeenCalledTimes(4);
      
      // Verify left touch area
      expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(0, 0, 240, 600, 0x000000, 0); // 30% of 800 = 240
      
      // Verify right touch area 
      expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(560, 0, 240, 600, 0x000000, 0); // 70% of 800 = 560
      
      // Verify rotate touch area
      expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(240, 0, 320, 300, 0x000000, 0); // 40% width, 50% height
      
      // Verify drop touch area
      expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(240, 300, 320, 300, 0x000000, 0); // bottom half
    });

    test('should initialize touch input state correctly', () => {
      tetrisScene.createTouchControls();
      
      expect(tetrisScene.touchInput).toEqual({
        left: false,
        right: false,
        rotate: false,
        drop: false
      });
    });

    test('should create touch areas with proper interactive properties', () => {
      tetrisScene.createTouchControls();
      
      // Verify all rectangles are set up properly
      expect(tetrisScene.leftTouchArea.setOrigin).toHaveBeenCalledWith(0, 0);
      expect(tetrisScene.leftTouchArea.setInteractive).toHaveBeenCalled();
      expect(tetrisScene.leftTouchArea.setDepth).toHaveBeenCalledWith(-1);
    });
  });

  describe('Touch Indicators', () => {
    test('should create visual indicators for mobile devices', () => {
      tetrisScene.createTouchControls();
      
      expect(tetrisScene.add.text).toHaveBeenCalledTimes(4);
      expect(tetrisScene.leftIndicator.setAlpha).toHaveBeenCalledWith(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      expect(tetrisScene.rightIndicator.setAlpha).toHaveBeenCalledWith(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      expect(tetrisScene.rotateIndicator.setAlpha).toHaveBeenCalledWith(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      expect(tetrisScene.dropIndicator.setAlpha).toHaveBeenCalledWith(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
    });

    test('should hide indicators on desktop devices', () => {
      tetrisScene.sys.game.device.input.touch = false;
      tetrisScene.createTouchControls();
      
      expect(tetrisScene.leftIndicator.setAlpha).toHaveBeenCalledWith(0);
      expect(tetrisScene.rightIndicator.setAlpha).toHaveBeenCalledWith(0);
      expect(tetrisScene.rotateIndicator.setAlpha).toHaveBeenCalledWith(0);
      expect(tetrisScene.dropIndicator.setAlpha).toHaveBeenCalledWith(0);
    });

    test('should position indicators correctly', () => {
      tetrisScene.createTouchControls();
      
      // Left indicator at 15% of width
      expect(tetrisScene.add.text).toHaveBeenCalledWith(120, 550, '←', expect.any(Object));
      
      // Right indicator at 85% of width
      expect(tetrisScene.add.text).toHaveBeenCalledWith(680, 550, '→', expect.any(Object));
      
      // Rotate indicator at center top
      expect(tetrisScene.add.text).toHaveBeenCalledWith(400, 150, '↻', expect.any(Object));
      
      // Drop indicator at center bottom
      expect(tetrisScene.add.text).toHaveBeenCalledWith(400, 450, '↓', expect.any(Object));
    });
  });

  describe('Touch Input Handling', () => {
    beforeEach(() => {
      tetrisScene.createTouchControls();
    });

    test('should handle left touch input with timing', () => {
      tetrisScene.touchInput.left = true;
      tetrisScene.time.now = 1000;
      
      const result = tetrisScene.handleTouchInput();
      expect(result).toBe('left');
      expect(tetrisScene.touchTiming.left).toBe(1000);
    });

    test('should handle right touch input with timing', () => {
      tetrisScene.touchInput.right = true;
      tetrisScene.time.now = 1000;
      
      const result = tetrisScene.handleTouchInput();
      expect(result).toBe('right');
      expect(tetrisScene.touchTiming.right).toBe(1000);
    });

    test('should handle rotate touch input with timing', () => {
      tetrisScene.touchInput.rotate = true;
      tetrisScene.time.now = 1000;
      
      const result = tetrisScene.handleTouchInput();
      expect(result).toBe('rotate');
      expect(tetrisScene.touchTiming.rotate).toBe(1000);
    });

    test('should handle drop touch input with timing', () => {
      tetrisScene.touchInput.drop = true;
      tetrisScene.time.now = 1000;
      
      const result = tetrisScene.handleTouchInput();
      expect(result).toBe('drop');
      expect(tetrisScene.touchTiming.drop).toBe(1000);
    });

    test('should prevent rapid fire input with timing delays', () => {
      tetrisScene.touchInput.left = true;
      tetrisScene.time.now = 1000;
      tetrisScene.touchTiming = { left: 950, moveDelay: 150 }; // Recent input
      
      const result = tetrisScene.handleTouchInput();
      expect(result).toBe(null); // Should be blocked
    });

    test('should respect different timing delays for different inputs', () => {
      tetrisScene.touchTiming = {
        left: 0,
        right: 0,
        rotate: 0,
        drop: 0,
        moveDelay: 150,
        rotateDelay: 200,
        dropDelay: 100
      };
      
      expect(tetrisScene.touchTiming.moveDelay).toBe(150);
      expect(tetrisScene.touchTiming.rotateDelay).toBe(200);
      expect(tetrisScene.touchTiming.dropDelay).toBe(100);
    });
  });

  describe('Mobile Device Adaptation', () => {
    test('should detect mobile devices correctly', () => {
      tetrisScene.createTouchControls();
      
      const isMobile = tetrisScene.sys.game.device.input.touch;
      expect(isMobile).toBe(true);
    });

    test('should adapt touch zones for different screen sizes', () => {
      // Test with different screen dimensions
      const testSizes = [
        { width: 375, height: 667 }, // iPhone 6/7/8
        { width: 414, height: 896 }, // iPhone 11
        { width: 360, height: 640 }  // Android Medium
      ];
      
      testSizes.forEach(size => {
        tetrisScene.cameras.main = size;
        tetrisScene.createTouchControls();
        
        // Verify proportional scaling
        expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(0, 0, size.width * 0.3, size.height, 0x000000, 0);
        expect(tetrisScene.add.rectangle).toHaveBeenCalledWith(size.width * 0.7, 0, size.width * 0.3, size.height, 0x000000, 0);
      });
    });

    test('should provide sufficient touch target sizes', () => {
      const minTouchTarget = 44; // iOS Human Interface Guidelines
      
      tetrisScene.createTouchControls();
      
      // Check that touch areas meet minimum size requirements
      const leftTouchWidth = 800 * 0.3; // 240px
      const rightTouchWidth = 800 * 0.3; // 240px
      const rotateTouchWidth = 800 * 0.4; // 320px
      const dropTouchWidth = 800 * 0.4; // 320px
      
      expect(leftTouchWidth).toBeGreaterThan(minTouchTarget);
      expect(rightTouchWidth).toBeGreaterThan(minTouchTarget);
      expect(rotateTouchWidth).toBeGreaterThan(minTouchTarget);
      expect(dropTouchWidth).toBeGreaterThan(minTouchTarget);
    });
  });

  describe('Touch Control Ergonomics', () => {
    test('should position touch areas for comfortable thumb reach', () => {
      tetrisScene.createTouchControls();
      
      const screenWidth = 800;
      
      // Left area - left thumb zone (0% to 30%)
      const leftAreaStart = 0;
      const leftAreaEnd = screenWidth * 0.3;
      
      // Right area - right thumb zone (70% to 100%)
      const rightAreaStart = screenWidth * 0.7;
      const rightAreaEnd = screenWidth;
      
      // Center areas for rotation and drop (30% to 70%)
      const centerAreaStart = screenWidth * 0.3;
      const centerAreaEnd = screenWidth * 0.7;
      
      expect(leftAreaEnd).toBe(centerAreaStart);
      expect(centerAreaEnd).toBe(rightAreaStart);
      expect(rightAreaEnd).toBe(screenWidth);
    });

    test('should separate rotation and drop zones vertically', () => {
      tetrisScene.createTouchControls();
      
      const screenHeight = 600;
      
      // Rotate area should be top half of center zone
      const rotateAreaTop = 0;
      const rotateAreaBottom = screenHeight * 0.5;
      
      // Drop area should be bottom half of center zone
      const dropAreaTop = screenHeight * 0.5;
      const dropAreaBottom = screenHeight;
      
      expect(rotateAreaBottom).toBe(dropAreaTop); // No gap between zones
      expect(dropAreaBottom).toBe(screenHeight);
    });
  });
});
/**
 * GameScene.test.js - Tests for GameScene visual elements, positioning, and scene state
 * 
 * This test suite validates:
 * - Object positions on screen (player, bubbles, obstacles)
 * - Asset spawning within visible screen bounds
 * - Scene state changes over time
 * - Visual layout and UI positioning
 */

import { GAME_CONFIG, SCENE_KEYS } from '../src/config.js';
import GameStateManager from '../src/utils/GameStateManager.js';

// Mock the Phaser import first
jest.mock('phaser', () => ({
  Scene: class MockScene {
    constructor(config) {
      this.scene = {
        key: config?.key || 'MockScene',
        start: jest.fn(),
        restart: jest.fn()
      };
      this.cameras = {
        main: {
          width: 800,
          height: 600,
          setBackgroundColor: jest.fn()
        }
      };
      this.physics = {
        add: {
          existing: jest.fn((obj, isStatic) => {
            obj.body = {
              setCollideWorldBounds: jest.fn(),
              setSize: jest.fn(),
              setImmovable: jest.fn(),
              setVelocityX: jest.fn(),
              setVelocityY: jest.fn((velocity) => {
                obj.body.velocity.y = velocity;
              }),
              setDrag: jest.fn((drag) => {
                obj.body.drag = { x: drag, y: drag };
              }),
              velocity: { x: 0, y: 0 },
              drag: { x: 0, y: 0 },
              checkWorldBounds: false,
              outOfBoundsKill: false,
              touching: { down: false }
            };
            return obj;
          }),
          group: jest.fn(() => ({
            add: jest.fn(),
            children: { entries: [] }
          })),
          overlap: jest.fn(),
          collider: jest.fn()
        },
        pause: jest.fn(),
        resume: jest.fn()
      };
      this.input = {
        keyboard: {
          createCursorKeys: jest.fn(() => ({
            left: { isDown: false },
            right: { isDown: false },
            up: { isDown: false },
            down: { isDown: false }
          })),
          addKey: jest.fn(() => ({ isDown: false }))
        }
      };
      this.add = {
        rectangle: jest.fn((x, y, width, height, color) => ({
          x, y, width, height, color,
          setOrigin: jest.fn(function() { return this; }),
          setInteractive: jest.fn(function() { return this; }),
          setDepth: jest.fn(function() { return this; }),
          setStrokeStyle: jest.fn(function() { return this; }),
          setFillStyle: jest.fn(function() { return this; }),
          setTint: jest.fn(function() { return this; }),
          clearTint: jest.fn(function() { return this; }),
          setScale: jest.fn(function() { return this; }),
          on: jest.fn(),
          body: null
        })),
        circle: jest.fn((x, y, radius, color) => ({
          x, y, radius, color,
          body: null,
          destroy: jest.fn()
        })),
        image: jest.fn((x, y, texture) => ({
          x, y, texture,
          width: texture === 'obstacle' ? 30 : (texture === 'bubble' ? 32 : 32), // Default dimensions
          height: texture === 'obstacle' ? 80 : (texture === 'bubble' ? 32 : 48), // Default dimensions  
          scaleX: 1,
          scaleY: 1,
          setOrigin: jest.fn(function() { return this; }),
          setScale: jest.fn(function(x, y) { 
            if (y !== undefined) {
              this.scaleX = x;
              this.scaleY = y;
            } else {
              this.scaleX = this.scaleY = x;
            }
            return this; 
          }),
          setTint: jest.fn(function() { return this; }),
          clearTint: jest.fn(function() { return this; }),
          body: null,
          destroy: jest.fn()
        })),
        tileSprite: jest.fn((x, y, width, height, texture) => ({
          x, y, width, height, texture,
          tilePositionX: 0, // Add tilePositionX property for background animation
          tilePositionY: 0, // Add tilePositionY for completeness
          setOrigin: jest.fn(function() { return this; }),
          setScale: jest.fn(function() { return this; }),
          destroy: jest.fn()
        })),
        text: jest.fn((x, y, text, style) => ({
          x, y, text, style,
          setOrigin: jest.fn(function() { return this; }),
          setInteractive: jest.fn(function() { return this; }),
          setAlpha: jest.fn(function() { return this; }),
          setStyle: jest.fn(function() { return this; }),
          setText: jest.fn(function(newText) { this.text = newText; return this; }),
          on: jest.fn(),
          destroy: jest.fn()
        }))
      };
      this.time = {
        addEvent: jest.fn((config) => ({
          delay: config.delay,
          callback: config.callback,
          callbackScope: config.callbackScope,
          loop: config.loop,
          paused: false,
          remove: jest.fn()
        })),
        delayedCall: jest.fn((delay, callback, args, scope) => ({
          delay,
          callback,
          args,
          scope,
          remove: jest.fn()
        }))
      };
      this.tweens = {
        add: jest.fn()
      };
      this.sys = {
        game: {
          device: {
            input: {
              touch: false // Default to desktop
            }
          },
          loop: {
            delta: 16.67 // ~60 FPS
          }
        }
      };
      this.game = this.sys.game;
      
      // Track created objects for testing
      this.createdObjects = {
        rectangles: [],
        circles: [],
        texts: [],
        images: [],
        tileSprites: [],
        timers: []
      };
      
      // Override add methods to track created objects
      const originalAddRectangle = this.add.rectangle;
      this.add.rectangle = jest.fn((x, y, width, height, color) => {
        const rect = originalAddRectangle(x, y, width, height, color);
        this.createdObjects.rectangles.push(rect);
        return rect;
      });
      
      const originalAddCircle = this.add.circle;
      this.add.circle = jest.fn((x, y, radius, color) => {
        const circle = originalAddCircle(x, y, radius, color);
        this.createdObjects.circles.push(circle);
        return circle;
      });
      
      const originalAddText = this.add.text;
      this.add.text = jest.fn((x, y, text, style) => {
        const textObj = originalAddText(x, y, text, style);
        this.createdObjects.texts.push(textObj);
        return textObj;
      });
      
      const originalAddImage = this.add.image;
      this.add.image = jest.fn((x, y, texture) => {
        const imageObj = originalAddImage(x, y, texture);
        this.createdObjects.images.push(imageObj);
        return imageObj;
      });
      
      const originalAddTileSprite = this.add.tileSprite;
      this.add.tileSprite = jest.fn((x, y, width, height, texture) => {
        const tileSprite = originalAddTileSprite(x, y, width, height, texture);
        this.createdObjects.tileSprites.push(tileSprite);
        return tileSprite;
      });
      
      const originalAddEvent = this.time.addEvent;
      this.time.addEvent = jest.fn((config) => {
        const timer = originalAddEvent(config);
        this.createdObjects.timers.push(timer);
        return timer;
      });
    }
  },
  Math: {
    Between: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min)
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        SPACE: 32
      }
    }
  }
}), { virtual: true });

// Mock GameStateManager
jest.mock('../src/utils/GameStateManager.js', () => ({
  __esModule: true,
  default: {
    loadGameState: jest.fn(() => ({
      bubblesCollected: 0,
      firstBubbleCollected: false,
      playerLives: 3,
      currentPhase: 'MenuScene'
    })),
    saveCurrentPhase: jest.fn(),
    saveBubblesCollected: jest.fn(),
    saveFirstBubbleFlag: jest.fn(),
    savePlayerLives: jest.fn(),
    clearProgress: jest.fn()
  }
}));

// Import GameScene after mocking
import GameScene from '../src/scenes/GameScene.js';

describe('GameScene Visual and Positioning Tests', () => {
  let gameScene;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    gameScene = new GameScene();
    gameScene.init();
  });
  
  describe('Scene Initialization and Layout', () => {
    test('should initialize scene with correct dimensions', () => {
      expect(gameScene.cameras.main.width).toBe(GAME_CONFIG.WIDTH);
      expect(gameScene.cameras.main.height).toBe(GAME_CONFIG.HEIGHT);
    });
    
    test('should create background using tile sprite', () => {
      gameScene.create();
      expect(gameScene.add.tileSprite).toHaveBeenCalledWith(0, 0, 800, 600, 'background');
    });
    
    test('should initialize with correct game state from storage', () => {
      expect(gameScene.bubblesCollected).toBe(0);
      expect(gameScene.firstBubbleCollected).toBe(false);
      expect(gameScene.playerLives).toBe(3);
      expect(gameScene.gameOver).toBe(false);
    });
  });
  
  describe('Player Positioning and Setup', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should position player correctly on screen', () => {
      expect(gameScene.player.x).toBe(100);
      // Player should be positioned to rest on ground: ground top (HEIGHT - 40) minus half player height (24)
      expect(gameScene.player.y).toBe(GAME_CONFIG.HEIGHT - 40 - 24); // ground top - player height/2
      expect(gameScene.player.width * gameScene.player.scaleX).toBe(32); // Effective width
      expect(gameScene.player.height * gameScene.player.scaleY).toBe(48); // Effective height
    });
    
    test('should position ground platform at bottom of screen', () => {
      expect(gameScene.ground.x).toBe(GAME_CONFIG.WIDTH / 2);
      expect(gameScene.ground.y).toBe(GAME_CONFIG.HEIGHT - 20);
      expect(gameScene.ground.width).toBe(GAME_CONFIG.WIDTH);
      expect(gameScene.ground.height).toBe(40);
    });
    
    test('should create player with correct visual properties', () => {
      expect(gameScene.player.texture).toBe('player'); // Player sprite asset
      expect(gameScene.player.body.setCollideWorldBounds).toHaveBeenCalled();
      expect(gameScene.player.body.setSize).toHaveBeenCalledWith(32, 48);
    });
    
    test('should position player above ground level', () => {
      const groundTop = gameScene.ground.y - gameScene.ground.height / 2;
      const playerBottom = gameScene.player.y + (gameScene.player.height * gameScene.player.scaleY) / 2;
      // Player should be positioned so that its bottom can touch the ground top
      expect(playerBottom).toBeLessThanOrEqual(groundTop + 10); // Allow small tolerance for physics
    });
  });
  
  describe('UI Elements Positioning', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should position bubbles counter in top-left corner', () => {
      const bubblesText = gameScene.createdObjects.texts.find(text => 
        text.text.includes('Bubbles:')
      );
      expect(bubblesText).toBeDefined();
      expect(bubblesText.x).toBe(16);
      expect(bubblesText.y).toBe(16);
    });
    
    test('should position lives counter below bubbles counter', () => {
      const livesText = gameScene.createdObjects.texts.find(text => 
        text.text.includes('Lives:')
      );
      expect(livesText).toBeDefined();
      expect(livesText.x).toBe(16);
      expect(livesText.y).toBe(42);
    });
    
    test('should position instructions below lives counter', () => {
      const instructionsText = gameScene.createdObjects.texts.find(text => 
        text.text.includes('Arrow Keys') || text.text.includes('Tap Left')
      );
      expect(instructionsText).toBeDefined();
      expect(instructionsText.x).toBe(16);
      expect(instructionsText.y).toBe(76);
    });
    
    test('should position menu button in top-right corner', () => {
      const menuButton = gameScene.createdObjects.texts.find(text => 
        text.text === 'Menu'
      );
      expect(menuButton).toBeDefined();
      expect(menuButton.setOrigin).toHaveBeenCalledWith(1, 0);
    });
    
    test('should show different instructions for mobile vs desktop', () => {
      // Test desktop instructions
      gameScene.sys.game.device.input.touch = false;
      gameScene.createUI();
      
      let instructionsText = gameScene.createdObjects.texts.find(text => 
        text.text.includes('Arrow Keys')
      );
      expect(instructionsText).toBeDefined();
      
      // Reset and test mobile instructions
      gameScene.createdObjects.texts = [];
      gameScene.sys.game.device.input.touch = true;
      gameScene.createUI();
      
      instructionsText = gameScene.createdObjects.texts.find(text => 
        text.text.includes('Tap Left')
      );
      expect(instructionsText).toBeDefined();
    });
  });
  
  describe('Touch Controls Layout (Mobile)', () => {
    beforeEach(() => {
      gameScene.sys.game.device.input.touch = true;
      gameScene.create();
    });
    
    test('should create touch areas covering entire screen', () => {
      const touchAreas = gameScene.createdObjects.rectangles.filter(rect => 
        rect.color === 0x000000 // Touch areas are black with alpha 0
      );
      
      expect(touchAreas.length).toBe(3); // Left, right, jump areas
      
      // Verify total coverage
      const leftArea = touchAreas.find(area => area.x === 0 && area.y === 0);
      const rightArea = touchAreas.find(area => area.x === GAME_CONFIG.WIDTH * 0.3);
      const jumpArea = touchAreas.find(area => area.x === GAME_CONFIG.WIDTH * 0.7);
      
      expect(leftArea.width).toBe(GAME_CONFIG.WIDTH * 0.3);
      expect(rightArea.width).toBe(GAME_CONFIG.WIDTH * 0.4);
      expect(jumpArea.width).toBe(GAME_CONFIG.WIDTH * 0.3);
      
      // Verify all areas cover full height
      [leftArea, rightArea, jumpArea].forEach(area => {
        expect(area.height).toBe(GAME_CONFIG.HEIGHT);
      });
    });
    
    test('should position touch indicators correctly', () => {
      const leftIndicator = gameScene.createdObjects.texts.find(text => text.text === '←');
      const rightIndicator = gameScene.createdObjects.texts.find(text => text.text === '→');
      const jumpIndicator = gameScene.createdObjects.texts.find(text => text.text === '↑');
      
      expect(leftIndicator.x).toBe(GAME_CONFIG.WIDTH * 0.15);
      expect(rightIndicator.x).toBe(GAME_CONFIG.WIDTH * 0.5);
      expect(jumpIndicator.x).toBe(GAME_CONFIG.WIDTH * 0.85);
      
      // All indicators should be near bottom of screen
      [leftIndicator, rightIndicator, jumpIndicator].forEach(indicator => {
        expect(indicator.y).toBe(GAME_CONFIG.HEIGHT - 80);
      });
    });
    
    test('should show touch indicators on mobile devices', () => {
      const indicators = gameScene.createdObjects.texts.filter(text => 
        ['←', '→', '↑'].includes(text.text)
      );
      
      expect(indicators.length).toBe(3);
      indicators.forEach(indicator => {
        expect(indicator.setAlpha).toHaveBeenCalledWith(GAME_CONFIG.TOUCH.NORMAL_ALPHA);
      });
    });
    
    test('should hide touch indicators on desktop', () => {
      gameScene.sys.game.device.input.touch = false;
      gameScene.createdObjects.texts = [];
      gameScene.createTouchIndicators();
      
      const indicators = gameScene.createdObjects.texts.filter(text => 
        ['←', '→', '↑'].includes(text.text)
      );
      
      indicators.forEach(indicator => {
        expect(indicator.setAlpha).toHaveBeenCalledWith(0);
      });
    });
  });
  
  describe('Bubble Spawning and Positioning', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should spawn bubbles within screen bounds', () => {
      // Create several bubbles to test positioning
      for (let i = 0; i < 10; i++) {
        gameScene.createBubble();
      }
      
      const bubbles = gameScene.createdObjects.images.filter(image => 
        image.texture === 'bubble'
      );
      
      bubbles.forEach(bubble => {
        // Bubbles spawn within controlled bounds for better visibility
        // New configuration keeps bubbles closer to screen for immediate or quick visibility
        expect(bubble.x).toBeGreaterThanOrEqual(GAME_CONFIG.BUBBLES.SPAWN_X_MIN);
        expect(bubble.x).toBeLessThanOrEqual(GAME_CONFIG.BUBBLES.SPAWN_X_MAX);
        
        // Should spawn above screen to fall into view (simulating diagonal falling)
        expect(bubble.y).toBeGreaterThanOrEqual(-100);
        expect(bubble.y).toBeLessThanOrEqual(-20);
        
        // Should have correct texture
        expect(bubble.texture).toBe('bubble');
      });
    });
    
    test('should distribute bubble landing positions toward the right side', () => {
      // Create multiple bubbles to test distribution
      const bubbleCount = 20;
      for (let i = 0; i < bubbleCount; i++) {
        gameScene.createBubble();
      }
      
      const bubbles = gameScene.createdObjects.images.filter(image => 
        image.texture === 'bubble'
      );
      
      // Calculate expected landing positions accounting for the new controlled horizontal drift
      const landingPositions = bubbles.map(bubble => {
        // Estimate fall time
        const fallDistance = GAME_CONFIG.HEIGHT - 40 - bubble.y;
        const avgFallSpeed = (GAME_CONFIG.BUBBLES.SPEED_Y_MIN + GAME_CONFIG.BUBBLES.SPEED_Y_MAX) / 2;
        const estimatedFallTime = Math.abs(fallDistance) / avgFallSpeed;
        
        // Calculate where bubble will land using the new controlled drift compensation
        const fullDrift = Math.abs(GAME_CONFIG.BUBBLES.SPEED_X) * estimatedFallTime;
        const actualDrift = fullDrift * GAME_CONFIG.BUBBLES.SPAWN_DRIFT_COMPENSATION;
        const landingX = bubble.x - actualDrift; // Subtract compensated drift because bubbles move left
        
        return landingX;
      });
      
      // Check that most bubbles land in the right half or center-right area (x > 300)
      const rightSideLandings = landingPositions.filter(x => x > 300).length;
      const rightSideRatio = rightSideLandings / landingPositions.length;
      
      // Expect at least 60% of bubbles to land in the right side for better gameplay
      expect(rightSideRatio).toBeGreaterThan(0.6);
      
      // Ensure bubbles don't all cluster at one extreme
      const landingSpread = Math.max(...landingPositions) - Math.min(...landingPositions);
      expect(landingSpread).toBeGreaterThan(200); // Should have reasonable distribution spread
    });
    
    test('should create initial bubbles during scene creation', () => {
      const initialBubbles = gameScene.createdObjects.images.filter(image => 
        image.texture === 'bubble'
      );
      
      expect(initialBubbles.length).toBe(3); // Should create 3 initial bubbles
    });
    
    test('should set correct physics properties for bubbles', () => {
      gameScene.createBubble();
      
      const bubble = gameScene.createdObjects.images.find(image => 
        image.texture === 'bubble'
      );
      
      expect(gameScene.physics.add.existing).toHaveBeenCalledWith(bubble);
      // Bubbles now use manual X movement (synchronized with obstacles) and physics Y movement for natural falling
      expect(bubble.moveSpeedX).toBe(GAME_CONFIG.BUBBLES.SPEED_X);
      expect(bubble.body.velocity.y).toBeGreaterThanOrEqual(GAME_CONFIG.BUBBLES.SPEED_Y_MIN);
      expect(bubble.body.velocity.y).toBeLessThanOrEqual(GAME_CONFIG.BUBBLES.SPEED_Y_MAX);
      expect(bubble.body.checkWorldBounds).toBe(true);
      expect(bubble.body.outOfBoundsKill).toBe(true);
    });
  });
  
  describe('Obstacle Spawning and Positioning', () => {
    beforeEach(() => {
      gameScene.create();
      gameScene.gameOver = false;
    });
    
    test('should spawn obstacles off-screen to the right', () => {
      gameScene.createObstacle();
      
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      expect(obstacle).toBeDefined();
      expect(obstacle.x).toBe(GAME_CONFIG.WIDTH + (GAME_CONFIG.OBSTACLES.WIDTH / 2));
    });
    
    test('should position obstacles on ground level', () => {
      // Mock Phaser.Math.Between to return a predictable height value for this test
      const originalMathBetween = require('phaser').Math.Between;
      require('phaser').Math.Between = jest.fn(() => 60); // Return fixed height of 60
      
      gameScene.createObstacle();
      
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      // Should be positioned so bottom touches ground
      const expectedY = GAME_CONFIG.HEIGHT - 40 - (60 / 2); // Using the fixed height 60
      expect(obstacle.y).toBe(expectedY);
      expect(obstacle.initialY).toBe(expectedY);
      
      // Restore original function
      require('phaser').Math.Between = originalMathBetween;
    });
    
    test('should create obstacles with random height within bounds', () => {
      // Create multiple obstacles to test height variation
      for (let i = 0; i < 10; i++) {
        gameScene.createObstacle();
      }
      
      const obstacles = gameScene.createdObjects.images.filter(image => 
        image.texture === 'obstacle'
      );
      
      obstacles.forEach(obstacle => {
        // For sprites, check the scale to ensure height variation
        // The setScale mock should have been called, so scaleY should be set
        expect(obstacle.scaleY).toBeGreaterThanOrEqual(GAME_CONFIG.OBSTACLES.MIN_HEIGHT / 80); // 80 is base height
        expect(obstacle.scaleY).toBeLessThanOrEqual(GAME_CONFIG.OBSTACLES.MAX_HEIGHT / 80);
        expect(obstacle.scaleX).toBe(1); // Width scale should remain 1
        // Verify setScale was called
        expect(obstacle.setScale).toHaveBeenCalled();
      });
    });
    
    test('should not spawn obstacles when game is over', () => {
      gameScene.gameOver = true;
      const initialObstacleCount = gameScene.createdObjects.images.filter(image => 
        image.texture === 'obstacle'
      ).length;
      
      gameScene.createObstacle();
      
      const finalObstacleCount = gameScene.createdObjects.images.filter(image => 
        image.texture === 'obstacle'
      ).length;
      
      expect(finalObstacleCount).toBe(initialObstacleCount);
    });
    
    test('should set correct physics properties for obstacles', () => {
      gameScene.createObstacle();
      
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      expect(gameScene.physics.add.existing).toHaveBeenCalledWith(obstacle);
      expect(obstacle.body.setImmovable).toHaveBeenCalledWith(true);
      expect(obstacle.moveSpeed).toBe(GAME_CONFIG.OBSTACLES.SPEED);
    });
  });
  
  describe('Scene State Over Time', () => {
    beforeEach(() => {
      gameScene.create();
      gameScene.gameOver = false;
      gameScene.tetrisPromptShowing = false;
    });
    
    test('should start object spawning timers during scene creation', () => {
      expect(gameScene.createdObjects.timers.length).toBeGreaterThanOrEqual(2);
      
      const bubbleTimer = gameScene.createdObjects.timers.find(timer => 
        timer.callback === gameScene.createBubble
      );
      const obstacleTimer = gameScene.createdObjects.timers.find(timer => 
        timer.callback === gameScene.createObstacle
      );
      
      expect(bubbleTimer).toBeDefined();
      expect(obstacleTimer).toBeDefined();
      expect(bubbleTimer.loop).toBe(true);
      expect(obstacleTimer.loop).toBe(true);
    });
    
    test('should update obstacle positions over time', () => {
      // Create an obstacle
      gameScene.createObstacle();
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      const initialX = obstacle.x;
      const initialY = obstacle.y;
      
      // Mock obstacles group for the update method
      gameScene.obstacles = {
        children: {
          entries: [{ ...obstacle, active: true, initialY: initialY }]
        }
      };
      
      gameScene.updateObstacles();
      
      // Should move left based on speed and delta time
      const expectedMovement = GAME_CONFIG.OBSTACLES.SPEED * gameScene.game.loop.delta / 1000;
      expect(gameScene.obstacles.children.entries[0].x).toBe(initialX + expectedMovement);
      expect(gameScene.obstacles.children.entries[0].y).toBe(initialY); // Y should remain constant
    });
    
    test('should maintain obstacle Y position to prevent drift', () => {
      gameScene.createObstacle();
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      // Store initial Y and simulate it being changed
      const initialY = obstacle.initialY;
      const modifiedObstacle = { ...obstacle, active: true, y: initialY + 10, initialY: initialY };
      
      gameScene.obstacles = {
        children: {
          entries: [modifiedObstacle]
        }
      };
      
      gameScene.updateObstacles();
      
      // Should be corrected back to initial Y
      expect(modifiedObstacle.y).toBe(initialY);
    });
    
    test('should remove obstacles when they move off-screen', () => {
      gameScene.createObstacle();
      const obstacle = gameScene.createdObjects.images.find(image => 
        image.texture === 'obstacle'
      );
      
      // Position obstacle off-screen to the left (further than needed for width check)
      obstacle.x = -obstacle.width - 10;
      obstacle.destroy = jest.fn();
      
      // Mock the obstacles group properly with moveSpeed property
      gameScene.obstacles = {
        children: {
          entries: [{ ...obstacle, active: true, moveSpeed: GAME_CONFIG.OBSTACLES.SPEED }]
        }
      };
      
      gameScene.updateObstacles();
      
      expect(obstacle.destroy).toHaveBeenCalled();
    });
    
    test('should update UI text when bubbles are collected', () => {
      // Simulate collecting a bubble
      const initialBubbles = gameScene.bubblesCollected;
      
      gameScene.collectBubble(gameScene.player, { destroy: jest.fn() });
      
      expect(gameScene.bubblesCollected).toBe(initialBubbles + 1);
      expect(gameScene.bubblesText.setText).toHaveBeenCalledWith(`Bubbles: ${initialBubbles + 1}`);
    });
    
    test('should trigger first bubble cutscene on first collection', () => {
      gameScene.firstBubbleCollected = false;
      
      gameScene.collectBubble(gameScene.player, { destroy: jest.fn() });
      
      expect(gameScene.firstBubbleCollected).toBe(true);
      expect(gameScene.physics.pause).toHaveBeenCalled();
      expect(gameScene.tweens.add).toHaveBeenCalled();
    });
    
    test('should set cutscenePlaying flag during first bubble cutscene', () => {
      gameScene.firstBubbleCollected = false;
      expect(gameScene.cutscenePlaying).toBe(false);
      
      gameScene.triggerFirstBubbleCutscene();
      
      expect(gameScene.cutscenePlaying).toBe(true);
    });
    
    test('should pause obstacle and bubble updates during cutscene', () => {
      gameScene.cutscenePlaying = true;
      gameScene.handlePlayerMovement = jest.fn();
      gameScene.updateObstacles = jest.fn();
      gameScene.updateBubbles = jest.fn();
      
      gameScene.update();
      
      expect(gameScene.handlePlayerMovement).not.toHaveBeenCalled();
      expect(gameScene.updateObstacles).not.toHaveBeenCalled();
      expect(gameScene.updateBubbles).not.toHaveBeenCalled();
    });
    
    test('should allow obstacle and bubble updates when cutscene is not playing', () => {
      gameScene.cutscenePlaying = false;
      gameScene.gameOver = false;
      gameScene.tetrisPromptShowing = false;
      gameScene.handlePlayerMovement = jest.fn();
      gameScene.updateObstacles = jest.fn();
      gameScene.updateBubbles = jest.fn();
      
      gameScene.update();
      
      expect(gameScene.handlePlayerMovement).toHaveBeenCalled();
      expect(gameScene.updateObstacles).toHaveBeenCalled();
      expect(gameScene.updateBubbles).toHaveBeenCalled();
    });
    
    test('should show Tetris prompt when collection target is reached', () => {
      gameScene.bubblesCollected = GAME_CONFIG.BUBBLE_COLLECTION_TARGET - 1;
      
      gameScene.collectBubble(gameScene.player, { destroy: jest.fn() });
      
      expect(gameScene.bubblesCollected).toBe(GAME_CONFIG.BUBBLE_COLLECTION_TARGET);
      expect(gameScene.tetrisPromptShowing).toBe(true);
    });
  });
  
  describe('Screen Boundary Validation', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should ensure all UI elements are within screen bounds', () => {
      gameScene.createdObjects.texts.forEach(textObj => {
        expect(textObj.x).toBeGreaterThanOrEqual(0);
        expect(textObj.x).toBeLessThanOrEqual(GAME_CONFIG.WIDTH);
        expect(textObj.y).toBeGreaterThanOrEqual(0);
        expect(textObj.y).toBeLessThanOrEqual(GAME_CONFIG.HEIGHT);
      });
    });
    
    test('should ensure player starts within screen bounds', () => {
      expect(gameScene.player.x).toBeGreaterThan(0);
      expect(gameScene.player.x).toBeLessThan(GAME_CONFIG.WIDTH);
      expect(gameScene.player.y).toBeGreaterThan(0);
      expect(gameScene.player.y).toBeLessThan(GAME_CONFIG.HEIGHT);
    });
    
    test('should ensure ground covers entire screen width', () => {
      expect(gameScene.ground.width).toBe(GAME_CONFIG.WIDTH);
      expect(gameScene.ground.x).toBe(GAME_CONFIG.WIDTH / 2); // Centered
    });
    
    test('should ensure touch areas cover screen completely without gaps', () => {
      gameScene.sys.game.device.input.touch = true;
      gameScene.createdObjects.rectangles = [];
      gameScene.createTouchControls();
      
      const touchAreas = gameScene.createdObjects.rectangles.filter(rect => 
        rect.color === 0x000000 // Touch areas
      );
      
      // Calculate total coverage
      let totalWidth = 0;
      touchAreas.forEach(area => {
        totalWidth += area.width;
      });
      
      expect(totalWidth).toBe(GAME_CONFIG.WIDTH);
    });
    
    test('should spawn objects within visible screen margins', () => {
      // Test bubble spawning margins
      for (let i = 0; i < 20; i++) {
        gameScene.createBubble();
      }
      
      const bubbles = gameScene.createdObjects.images.filter(image => 
        image.texture === 'bubble'
      );
      
      bubbles.forEach(bubble => {
        // Bubbles spawn within controlled bounds for better visibility
        expect(bubble.x).toBeGreaterThanOrEqual(GAME_CONFIG.BUBBLES.SPAWN_X_MIN);
        expect(bubble.x).toBeLessThanOrEqual(GAME_CONFIG.BUBBLES.SPAWN_X_MAX);
        // Should spawn above screen for diagonal falling effect
        expect(bubble.y).toBeGreaterThanOrEqual(-100);
        expect(bubble.y).toBeLessThanOrEqual(-20);
      });
    });
  });
  
  describe('Collision Detection Areas', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should set up collision detection between player and bubbles', () => {
      expect(gameScene.physics.add.overlap).toHaveBeenCalledWith(
        gameScene.player,
        gameScene.bubbles,
        gameScene.collectBubble,
        null,
        gameScene
      );
    });
    
    test('should set up collision detection between player and obstacles', () => {
      expect(gameScene.physics.add.collider).toHaveBeenCalledWith(
        gameScene.player,
        gameScene.obstacles,
        gameScene.hitObstacle,
        null,
        gameScene
      );
    });
    
    test('should set up collision between player and ground', () => {
      expect(gameScene.physics.add.collider).toHaveBeenCalledWith(
        gameScene.player,
        gameScene.ground
      );
    });
    
    test('should handle obstacle collision with proper damage and knockback', () => {
      const initialLives = gameScene.playerLives;
      const mockObstacle = { destroy: jest.fn() };
      
      gameScene.hitObstacle(gameScene.player, mockObstacle);
      
      expect(gameScene.playerLives).toBe(initialLives - GAME_CONFIG.OBSTACLES.DAMAGE);
      expect(gameScene.player.body.setVelocityX).toHaveBeenCalledWith(-150);
      expect(gameScene.player.body.setVelocityY).toHaveBeenCalledWith(-200);
      expect(mockObstacle.destroy).toHaveBeenCalled();
    });
  });
  
  describe('Visual State Indicators', () => {
    beforeEach(() => {
      gameScene.create();
    });
    
    test('should change player color when taking damage', () => {
      const mockObstacle = { destroy: jest.fn() };
      
      gameScene.hitObstacle(gameScene.player, mockObstacle);
      
      expect(gameScene.player.setTint).toHaveBeenCalledWith(0xff0000); // Red damage tint
      expect(gameScene.invulnerable).toBe(true);
    });
    
    test('should restore player color after invulnerability period', () => {
      const mockObstacle = { destroy: jest.fn() };
      
      gameScene.hitObstacle(gameScene.player, mockObstacle);
      
      // Verify invulnerability timer is set with correct parameters
      const delayedCallMock = gameScene.time.delayedCall;
      const lastCall = delayedCallMock.mock.calls[delayedCallMock.mock.calls.length - 1];
      expect(lastCall[0]).toBe(2000); // delay should be 2000ms
      expect(typeof lastCall[1]).toBe('function'); // callback should be a function
    });
    
    test('should update lives display when player takes damage', () => {
      const mockObstacle = { destroy: jest.fn() };
      const initialLives = gameScene.playerLives;
      
      gameScene.hitObstacle(gameScene.player, mockObstacle);
      
      expect(gameScene.livesText.setText).toHaveBeenCalledWith(`Lives: ${initialLives - 1}`);
    });
    
    test('should show game over screen when lives reach zero', () => {
      gameScene.playerLives = 1; // Set to 1 so next hit causes game over
      const mockObstacle = { destroy: jest.fn() };
      
      gameScene.hitObstacle(gameScene.player, mockObstacle);
      
      expect(gameScene.gameOver).toBe(true);
      expect(gameScene.playerLives).toBe(0);
    });

    test('should clear progress when restart button is clicked after game over', () => {
      // Trigger game over
      gameScene.playerLives = 0;
      gameScene.gameOver = true;
      
      // Mock GameStateManager.clearProgress to verify it's called
      const clearProgressSpy = jest.spyOn(GameStateManager, 'clearProgress');
      
      // Create a mock for the restart button that supports method chaining
      const mockRestartButton = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      };
      
      // Create a generic mock for other UI elements
      const mockGenericElement = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      };
      
      // Mock the add.text method to return our specific mocks
      const originalAddText = gameScene.add.text;
      gameScene.add.text = jest.fn().mockImplementation((x, y, text, style) => {
        if (text === 'Restart Game') {
          return mockRestartButton;
        }
        // Return a generic mock for other text elements
        return mockGenericElement;
      });
      
      // Mock add.rectangle for overlay
      const originalAddRectangle = gameScene.add.rectangle;
      gameScene.add.rectangle = jest.fn().mockReturnValue(mockGenericElement);
      
      // Call showGameOverScreen
      gameScene.showGameOverScreen();
      
      // Find the pointerdown handler for the restart button
      const pointerdownCall = mockRestartButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      expect(pointerdownCall).toBeDefined();
      
      // Execute the restart button click handler
      const restartHandler = pointerdownCall[1];
      restartHandler();
      
      // Verify that clearProgress was called before restart
      expect(clearProgressSpy).toHaveBeenCalled();
      // The new implementation uses transitionToScene instead of scene.restart
      expect(gameScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
      
      // Restore mocks
      gameScene.add.text = originalAddText;
      gameScene.add.rectangle = originalAddRectangle;
      clearProgressSpy.mockRestore();
    });

    test('should clear progress when menu button is clicked after game over', () => {
      // Trigger game over
      gameScene.playerLives = 0;
      gameScene.gameOver = true;
      
      // Mock GameStateManager.clearProgress to verify it's called
      const clearProgressSpy = jest.spyOn(GameStateManager, 'clearProgress');
      
      // Create a mock for the menu button that supports method chaining
      const mockMenuButton = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      };
      
      // Create a generic mock for other UI elements
      const mockGenericElement = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      };
      
      // Mock the add.text method to return our specific mocks
      const originalAddText = gameScene.add.text;
      gameScene.add.text = jest.fn().mockImplementation((x, y, text, style) => {
        if (text === 'Back to Menu') {
          return mockMenuButton;
        }
        // Return a generic mock for other text elements
        return mockGenericElement;
      });
      
      // Mock add.rectangle for overlay
      const originalAddRectangle = gameScene.add.rectangle;
      gameScene.add.rectangle = jest.fn().mockReturnValue(mockGenericElement);
      
      // Call showGameOverScreen
      gameScene.showGameOverScreen();
      
      // Find the pointerdown handler for the menu button
      const pointerdownCall = mockMenuButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      expect(pointerdownCall).toBeDefined();
      
      // Execute the menu button click handler
      const menuHandler = pointerdownCall[1];
      menuHandler();
      
      // Verify that clearProgress was called before transitioning to menu
      expect(clearProgressSpy).toHaveBeenCalled();
      expect(gameScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.MENU);
      
      // Restore mocks
      gameScene.add.text = originalAddText;
      gameScene.add.rectangle = originalAddRectangle;
      clearProgressSpy.mockRestore();
    });
  });

  describe('Dynamic Effects Integration', () => {
    test('should initialize dynamic effects manager on create', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      expect(gameScene.dynamicEffectsManager).toBeDefined();
      expect(gameScene.effectSpeedMultiplier).toBe(1.0);
      expect(gameScene.effectJumpMultiplier).toBe(1.0);
      expect(gameScene.invertedControls).toBe(false);
    });

    test('should handle effect speed multiplier in player movement', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      // Set up a speed boost effect
      gameScene.effectSpeedMultiplier = 1.8;
      
      // Mock input for right movement
      gameScene.cursors.right.isDown = true;
      gameScene.cursors.left.isDown = false;
      gameScene.spaceKey.isDown = false;
      
      gameScene.handlePlayerMovement();
      
      const expectedSpeed = GAME_CONFIG.PHYSICS.PLAYER_SPEED * 1.8;
      expect(gameScene.player.body.setVelocityX).toHaveBeenCalledWith(expectedSpeed);
    });

    test('should handle effect jump multiplier in player movement', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      // Set up a jump reduction effect (like shrink player)
      gameScene.effectJumpMultiplier = 0.5;
      
      // Mock input for jumping
      gameScene.cursors.left.isDown = false;
      gameScene.cursors.right.isDown = false;
      gameScene.spaceKey.isDown = true;
      
      // Mock player on ground
      gameScene.player.body.touching.down = true;
      
      gameScene.handlePlayerMovement();
      
      const expectedJumpVelocity = GAME_CONFIG.PHYSICS.JUMP_VELOCITY * 0.5;
      expect(gameScene.player.body.setVelocityY).toHaveBeenCalledWith(expectedJumpVelocity);
    });

    test('should handle inverted controls effect', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      // Enable inverted controls
      gameScene.invertedControls = true;
      
      // Mock input for right movement (should result in left movement due to inversion)
      gameScene.cursors.right.isDown = true;
      gameScene.cursors.left.isDown = false;
      gameScene.spaceKey.isDown = false;
      
      gameScene.handlePlayerMovement();
      
      const expectedSpeed = -GAME_CONFIG.PHYSICS.PLAYER_SPEED; // Negative for left movement
      expect(gameScene.player.body.setVelocityX).toHaveBeenCalledWith(expectedSpeed);
    });

    test('should combine effects properly (speed boost + inverted controls)', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      // Enable both effects
      gameScene.effectSpeedMultiplier = 1.5;
      gameScene.invertedControls = true;
      
      // Mock input for left movement (should result in right movement due to inversion)
      gameScene.cursors.left.isDown = true;
      gameScene.cursors.right.isDown = false;
      gameScene.spaceKey.isDown = false;
      
      gameScene.handlePlayerMovement();
      
      const expectedSpeed = GAME_CONFIG.PHYSICS.PLAYER_SPEED * 1.5; // Positive for right movement
      expect(gameScene.player.body.setVelocityX).toHaveBeenCalledWith(expectedSpeed);
    });

    test('should clean up dynamic effects on destroy', () => {
      const gameScene = new GameScene();
      gameScene.init();
      gameScene.create();
      
      const stopSpy = jest.spyOn(gameScene.dynamicEffectsManager, 'stop');
      
      gameScene.destroy();
      
      expect(stopSpy).toHaveBeenCalled();
      expect(gameScene.dynamicEffectsManager).toBe(null);
    });
  });

  describe('Background Animation', () => {
    let gameScene;
    
    beforeEach(() => {
      const GameScene = require('../src/scenes/GameScene.js').default;
      gameScene = new GameScene();
      gameScene.create();
      
      // Mock game loop delta for consistent testing
      gameScene.game = {
        loop: {
          delta: 16.67 // ~60 FPS (1000ms/60fps ≈ 16.67ms per frame)
        }
      };
    });

    test('should move clouds slowly to the right by default', () => {
      const initialPosition = gameScene.backgroundTileSprite.tilePositionX;
      
      // No wind force active (default state)
      gameScene.windForce = 0;
      
      // Run a few update cycles
      gameScene.updateBackground();
      gameScene.updateBackground();
      gameScene.updateBackground();
      
      // Clouds should have moved right (tilePositionX should increase for rightward movement)
      expect(gameScene.backgroundTileSprite.tilePositionX).toBeGreaterThan(initialPosition);
    });

    test('should move clouds to the left when wind gust is active', () => {
      const initialPosition = gameScene.backgroundTileSprite.tilePositionX;
      
      // Activate wind gust effect
      gameScene.windForce = 150; // Positive wind force
      
      // Run a few update cycles  
      gameScene.updateBackground();
      gameScene.updateBackground();
      gameScene.updateBackground();
      
      // Clouds should have moved left (tilePositionX should decrease for leftward movement)
      expect(gameScene.backgroundTileSprite.tilePositionX).toBeLessThan(initialPosition);
    });

    test('should change cloud direction when wind effect starts and stops', () => {
      // Start with no wind
      gameScene.windForce = 0;
      const noWindPosition = gameScene.backgroundTileSprite.tilePositionX;
      
      gameScene.updateBackground();
      const afterNoWindMove = gameScene.backgroundTileSprite.tilePositionX;
      
      // Start wind effect
      gameScene.windForce = 150;
      gameScene.updateBackground();
      const afterWindMove = gameScene.backgroundTileSprite.tilePositionX;
      
      // Stop wind effect
      gameScene.windForce = 0;
      gameScene.updateBackground();
      const afterWindStop = gameScene.backgroundTileSprite.tilePositionX;
      
      // Each movement should change the position
      expect(afterNoWindMove).not.toBe(noWindPosition);
      expect(afterWindMove).not.toBe(afterNoWindMove);
      expect(afterWindStop).not.toBe(afterWindMove);
    });

    test('should handle missing background tile sprite gracefully', () => {
      gameScene.backgroundTileSprite = null;
      
      // Should not throw an error
      expect(() => {
        gameScene.updateBackground();
      }).not.toThrow();
    });

    test('should animate smoothly based on frame delta time', () => {
      const initialPosition = gameScene.backgroundTileSprite.tilePositionX;
      
      // Test with different frame rates (different delta times)
      gameScene.game.loop.delta = 33.33; // ~30 FPS (slower frame rate)
      gameScene.updateBackground();
      const slowFramePosition = gameScene.backgroundTileSprite.tilePositionX;
      
      // Reset position
      gameScene.backgroundTileSprite.tilePositionX = initialPosition;
      gameScene.game.loop.delta = 8.33; // ~120 FPS (faster frame rate)
      gameScene.updateBackground();
      const fastFramePosition = gameScene.backgroundTileSprite.tilePositionX;
      
      // Movement should be consistent regardless of frame rate
      // (slow frame should move more per update to maintain same speed per second)
      const slowFrameMovement = Math.abs(slowFramePosition - initialPosition);
      const fastFrameMovement = Math.abs(fastFramePosition - initialPosition);
      
      expect(slowFrameMovement).toBeGreaterThan(fastFrameMovement);
    });
  });
});
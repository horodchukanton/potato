/**
 * PreloadScene.test.js - Tests for PreloadScene asset loading and initialization
 * 
 * This test suite validates:
 * - Asset loading functionality and progress tracking
 * - Loading bar display and animation
 * - Placeholder asset creation
 * - Scene transition after loading completion
 * - Loading state management
 */

import { SCENE_KEYS, ASSET_KEYS } from '../src/config.js';

// Mock Phaser framework
jest.mock('phaser', () => ({
  Scene: class MockScene {
    constructor(config) {
      this.scene = {
        key: config?.key || 'MockScene',
        start: jest.fn()
      };
      this.cameras = {
        main: {
          width: 800,
          height: 600
        }
      };
      this.load = {
        on: jest.fn(),
        image: jest.fn(),
        audio: jest.fn()
      };
      this.add = {
        rectangle: jest.fn((x, y, width, height, color) => ({
          x, y, width, height, color
        })),
        text: jest.fn((x, y, text, style) => ({
          x, y, text, style,
          setOrigin: jest.fn().mockReturnThis(),
          setText: jest.fn().mockReturnThis()
        }))
      };
      this.time = {
        delayedCall: jest.fn()
      };
    }
  }
}));

import PreloadScene from '../src/scenes/PreloadScene.js';

describe('PreloadScene', () => {
  let preloadScene;
  
  beforeEach(() => {
    jest.clearAllMocks();
    preloadScene = new PreloadScene();
  });

  describe('Scene Initialization', () => {
    test('should initialize with correct scene key', () => {
      expect(preloadScene.scene.key).toBe(SCENE_KEYS.PRELOAD);
    });
  });

  describe('Asset Loading', () => {
    beforeEach(() => {
      preloadScene.preload();
    });

    test('should load all required placeholder assets', () => {
      expect(preloadScene.load.image).toHaveBeenCalledWith(
        ASSET_KEYS.PLAYER, 
        expect.stringContaining('data:image/png;base64')
      );
      expect(preloadScene.load.image).toHaveBeenCalledWith(
        ASSET_KEYS.BUBBLE, 
        expect.stringContaining('data:image/png;base64')
      );
      expect(preloadScene.load.image).toHaveBeenCalledWith(
        ASSET_KEYS.OBSTACLE, 
        expect.stringContaining('data:image/png;base64')
      );
      expect(preloadScene.load.image).toHaveBeenCalledWith(
        ASSET_KEYS.BACKGROUND, 
        expect.stringContaining('data:image/png;base64')
      );
    });

    test('should use valid base64 encoded placeholder images', () => {
      const playerImageCall = preloadScene.load.image.mock.calls.find(call => 
        call[0] === ASSET_KEYS.PLAYER
      );
      
      expect(playerImageCall[1]).toMatch(/^data:image\/png;base64,/);
      
      // Verify it's a valid base64 string
      const base64Part = playerImageCall[1].split(',')[1];
      expect(() => {
        atob(base64Part);
      }).not.toThrow();
    });

    test('should load exactly 4 placeholder assets', () => {
      const expectedAssets = [
        ASSET_KEYS.PLAYER,
        ASSET_KEYS.BUBBLE, 
        ASSET_KEYS.OBSTACLE,
        ASSET_KEYS.BACKGROUND
      ];
      
      expect(preloadScene.load.image).toHaveBeenCalledTimes(expectedAssets.length);
      
      expectedAssets.forEach(assetKey => {
        expect(preloadScene.load.image).toHaveBeenCalledWith(
          assetKey,
          expect.any(String)
        );
      });
    });
  });

  describe('Loading Progress Bar', () => {
    beforeEach(() => {
      preloadScene.preload();
    });

    test('should create progress bar background', () => {
      const progressBgCall = preloadScene.add.rectangle.mock.calls.find(call => 
        call[2] === 400 && call[3] === 20 && call[4] === 0x444444
      );
      
      expect(progressBgCall).toBeDefined();
      expect(progressBgCall[0]).toBe(400); // x: width/2
      expect(progressBgCall[1]).toBe(300); // y: height/2
    });

    test('should create progress bar fill', () => {
      const progressBarCall = preloadScene.add.rectangle.mock.calls.find(call => 
        call[2] === 0 && call[3] === 16 && call[4] === 0x00ff00
      );
      
      expect(progressBarCall).toBeDefined();
      expect(progressBarCall[0]).toBe(200); // x: width/2 - 200
      expect(progressBarCall[1]).toBe(300); // y: height/2
    });

    test('should create loading text', () => {
      const loadingTextCall = preloadScene.add.text.mock.calls.find(call => 
        call[2] === 'Loading...'
      );
      
      expect(loadingTextCall).toBeDefined();
      expect(loadingTextCall[0]).toBe(400); // x: width/2
      expect(loadingTextCall[1]).toBe(250); // y: height/2 - 50
      expect(loadingTextCall[3].font).toBe('20px Arial');
      expect(loadingTextCall[3].fill).toBe('#ffffff');
    });

    test('should set up progress event listener', () => {
      expect(preloadScene.load.on).toHaveBeenCalledWith('progress', expect.any(Function));
    });

    test('should set up complete event listener', () => {
      expect(preloadScene.load.on).toHaveBeenCalledWith('complete', expect.any(Function));
    });
  });

  describe('Loading Progress Animation', () => {
    let progressCallback;
    let completeCallback;
    let progressBar;
    let loadingText;

    beforeEach(() => {
      preloadScene.preload();
      
      // Get the progress callback
      const progressCall = preloadScene.load.on.mock.calls.find(call => 
        call[0] === 'progress'
      );
      progressCallback = progressCall[1];
      
      // Get the complete callback
      const completeCall = preloadScene.load.on.mock.calls.find(call => 
        call[0] === 'complete'
      );
      completeCallback = completeCall[1];
      
      // Get the progress bar and text elements
      progressBar = preloadScene.add.rectangle.mock.results.find(result => 
        result.value.width === 0 && result.value.height === 16
      )?.value;
      
      loadingText = preloadScene.add.text.mock.results.find(result => 
        result.value.text === 'Loading...'
      )?.value;
    });

    test('should update progress bar width based on loading progress', () => {
      // Simulate 50% progress
      progressCallback(0.5);
      
      expect(progressBar.width).toBe(200); // 400 * 0.5
      expect(progressBar.x).toBe(300); // (width/2 - 200) + (width/2)
    });

    test('should update progress bar to full width at 100% progress', () => {
      // Simulate 100% progress
      progressCallback(1.0);
      
      expect(progressBar.width).toBe(400); // 400 * 1.0
      expect(progressBar.x).toBe(400); // (width/2 - 200) + (width)
    });

    test('should handle partial progress increments', () => {
      // Simulate 25% progress
      progressCallback(0.25);
      
      expect(progressBar.width).toBe(100); // 400 * 0.25
      expect(progressBar.x).toBe(250); // (width/2 - 200) + (width/4)
    });

    test('should update loading text when complete', () => {
      completeCallback();
      
      expect(loadingText.setText).toHaveBeenCalledWith('Loading Complete!');
    });
  });

  describe('Scene Transition', () => {
    beforeEach(() => {
      preloadScene.create();
    });

    test('should set up delayed transition to menu scene', () => {
      expect(preloadScene.time.delayedCall).toHaveBeenCalledWith(
        500, 
        expect.any(Function)
      );
    });

    test('should transition to menu scene after delay', () => {
      const delayedCallArgs = preloadScene.time.delayedCall.mock.calls[0];
      const transitionCallback = delayedCallArgs[1];
      
      // Simulate the delayed call executing
      transitionCallback();
      
      expect(preloadScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.MENU);
    });

    test('should use appropriate delay time for user experience', () => {
      const delayTime = preloadScene.time.delayedCall.mock.calls[0][0];
      
      expect(delayTime).toBe(500); // 0.5 seconds - enough to see "Loading Complete!"
      expect(delayTime).toBeGreaterThan(100); // Not too fast
      expect(delayTime).toBeLessThan(2000); // Not too slow
    });
  });

  describe('Loading Bar Calculations', () => {
    let progressCallback;
    let progressBar;

    beforeEach(() => {
      preloadScene.preload();
      
      const progressCall = preloadScene.load.on.mock.calls.find(call => 
        call[0] === 'progress'
      );
      progressCallback = progressCall[1];
      
      progressBar = preloadScene.add.rectangle.mock.results.find(result => 
        result.value.width === 0 && result.value.height === 16
      )?.value;
    });

    test('should calculate correct x position for different progress values', () => {
      const testCases = [
        { progress: 0, expectedWidth: 0, expectedX: 200 },
        { progress: 0.1, expectedWidth: 40, expectedX: 220 },
        { progress: 0.5, expectedWidth: 200, expectedX: 300 },
        { progress: 0.75, expectedWidth: 300, expectedX: 350 },
        { progress: 1.0, expectedWidth: 400, expectedX: 400 }
      ];

      testCases.forEach(({ progress, expectedWidth, expectedX }) => {
        progressCallback(progress);
        
        expect(progressBar.width).toBe(expectedWidth);
        expect(progressBar.x).toBe(expectedX);
      });
    });

    test('should maintain progress bar centering', () => {
      // The progress bar should always be centered relative to its width
      progressCallback(0.3);
      
      const width = progressBar.width; // 120 (400 * 0.3)
      const x = progressBar.x; // 260
      const leftEdge = x - width / 2; // 200
      
      expect(leftEdge).toBe(200); // Should start at width/2 - 200
    });
  });

  describe('Asset Loading Error Handling', () => {
    test('should handle missing placeholder data gracefully', () => {
      // Test that the scene can be created even if image loading fails
      expect(() => {
        preloadScene.preload();
      }).not.toThrow();
    });

    test('should provide fallback behavior for asset creation', () => {
      preloadScene.preload();
      
      // Verify that all image calls have valid parameters
      preloadScene.load.image.mock.calls.forEach(call => {
        expect(call[0]).toBeTruthy(); // Asset key should exist
        expect(call[1]).toBeTruthy(); // Asset data should exist
        expect(typeof call[0]).toBe('string');
        expect(typeof call[1]).toBe('string');
      });
    });
  });

  describe('Loading Performance', () => {
    test('should use custom sprite assets', () => {
      preloadScene.preload();
      
      // Verify all assets are loaded with proper base64 images
      const imageCalls = preloadScene.load.image.mock.calls;
      
      // Each asset should have unique sprite data (no longer identical placeholders)
      const assetDataSet = new Set(imageCalls.map(call => call[1]));
      expect(assetDataSet.size).toBe(4); // All 4 assets should be different
      
      // All should still be valid base64 PNG images
      imageCalls.forEach(call => {
        expect(call[1]).toMatch(/^data:image\/png;base64,/);
      });
    });

    test('should minimize loading time with efficient assets', () => {
      preloadScene.preload();
      
      // Count total number of load operations
      const totalAssets = preloadScene.load.image.mock.calls.length;
      
      expect(totalAssets).toBeLessThanOrEqual(10); // Keep loading minimal
      expect(totalAssets).toBeGreaterThanOrEqual(4); // But load necessary assets
    });
  });

  describe('UI Responsiveness', () => {
    test('should position loading elements relative to screen size', () => {
      // Create new PreloadScene with different camera dimensions
      const newPreloadScene = new PreloadScene();
      newPreloadScene.cameras.main.width = 1024;
      newPreloadScene.cameras.main.height = 768;
      
      newPreloadScene.preload();
      
      const progressBgCall = newPreloadScene.add.rectangle.mock.calls.find(call => 
        call[4] === 0x444444
      );
      
      expect(progressBgCall[0]).toBe(512); // width/2 for different screen size
      expect(progressBgCall[1]).toBe(384); // height/2 for different screen size
    });

    test('should maintain aspect ratio for loading bar', () => {
      preloadScene.preload();
      
      const progressBg = preloadScene.add.rectangle.mock.calls.find(call => 
        call[4] === 0x444444
      );
      const progressBar = preloadScene.add.rectangle.mock.calls.find(call => 
        call[4] === 0x00ff00
      );
      
      // Progress bar should be slightly smaller than background
      expect(progressBar[3]).toBeLessThan(progressBg[3]); // height comparison
      expect(progressBar[2]).toBeLessThanOrEqual(progressBg[2]); // max width comparison
    });
  });

  describe('Favicon Integration', () => {
    let originalCreateElement;
    let originalQuerySelectorAll;
    let originalAppendChild;
    
    beforeEach(() => {
      // Mock DOM manipulation functions
      originalCreateElement = document.createElement;
      originalQuerySelectorAll = document.head.querySelectorAll;
      originalAppendChild = document.head.appendChild;
      
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'link') {
          return {
            rel: '',
            type: '',
            href: '',
            sizes: ''
          };
        }
        return originalCreateElement.call(document, tagName);
      });
      
      document.head.querySelectorAll = jest.fn().mockReturnValue([]);
      document.head.appendChild = jest.fn();
    });
    
    afterEach(() => {
      document.createElement = originalCreateElement;
      document.head.querySelectorAll = originalQuerySelectorAll;
      document.head.appendChild = originalAppendChild;
    });
    
    test('should generate favicons during preload', () => {
      preloadScene.preload();
      
      // Should call appendChild to add favicon links
      expect(document.head.appendChild).toHaveBeenCalled();
      
      // Should create link elements for favicons
      expect(document.createElement).toHaveBeenCalledWith('link');
    });
    
    test('should generate multiple favicon sizes', () => {
      preloadScene.generateFavicons();
      
      // Should create multiple favicon link elements
      const linkCreationCalls = document.createElement.mock.calls.filter(call => call[0] === 'link');
      expect(linkCreationCalls.length).toBeGreaterThan(1);
      
      // Should append multiple links to head
      expect(document.head.appendChild).toHaveBeenCalledTimes(5); // 4 standard sizes + shortcut icon
    });
    
    test('should handle favicon generation errors gracefully', () => {
      // Mock console.warn to check error handling
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate error by making createElement throw
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('Canvas not available');
      });
      
      preloadScene.generateFavicons();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to generate favicons:', expect.any(Error));
      
      consoleWarnSpy.mockRestore();
    });
    
    test('should remove existing favicons before adding new ones', () => {
      const mockExistingFavicon = { remove: jest.fn() };
      document.head.querySelectorAll = jest.fn().mockReturnValue([mockExistingFavicon]);
      
      preloadScene.removeExistingFavicons();
      
      expect(document.head.querySelectorAll).toHaveBeenCalledWith('link[rel*="icon"]');
      expect(mockExistingFavicon.remove).toHaveBeenCalled();
    });
  });
});
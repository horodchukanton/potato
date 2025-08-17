/**
 * MenuScene.test.js - Tests for MenuScene navigation, progress display, and user interactions
 * 
 * This test suite validates:
 * - Menu button interactions and navigation
 * - Progress display functionality 
 * - Resume vs new game logic
 * - Device-specific instruction text
 * - Menu UI positioning and responsiveness
 */

import { SCENE_KEYS, GAME_CONFIG } from '../src/config.js';

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
          height: 600,
          setBackgroundColor: jest.fn()
        }
      };
      this.add = {
        text: jest.fn((x, y, text, style) => ({
          x, y, text, style,
          setOrigin: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          setStyle: jest.fn().mockReturnThis()
        }))
      };
      this.sys = {
        game: {
          device: {
            input: { touch: false }
          }
        }
      };
    }
  }
}));

// Mock GameStateManager
jest.mock('../src/utils/GameStateManager.js', () => ({
  default: {
    getProgressSummary: jest.fn(),
    getResumeScene: jest.fn(),
    clearProgress: jest.fn()
  }
}));

import MenuScene from '../src/scenes/MenuScene.js';
import GameStateManager from '../src/utils/GameStateManager.js';

describe('MenuScene', () => {
  let menuScene;
  const mockGameStateManager = {
    getProgressSummary: jest.fn(),
    getResumeScene: jest.fn(),
    clearProgress: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock return values
    mockGameStateManager.getProgressSummary.mockReturnValue({
      bubblesCollected: 0,
      bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
      tetrisLines: 0,
      tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
    });
    mockGameStateManager.getResumeScene.mockReturnValue(SCENE_KEYS.GAME);
    
    // Override the imported GameStateManager for this test
    GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
    GameStateManager.getResumeScene = mockGameStateManager.getResumeScene;
    GameStateManager.clearProgress = mockGameStateManager.clearProgress;
    
    menuScene = new MenuScene();
    menuScene.create();
  });

  describe('Scene Initialization', () => {
    test('should initialize with correct scene key', () => {
      expect(menuScene.scene.key).toBe(SCENE_KEYS.MENU);
    });

    test('should set dark background color', () => {
      expect(menuScene.cameras.main.setBackgroundColor).toHaveBeenCalledWith('#2c3e50');
    });
  });

  describe('Title Display', () => {
    test('should display POTATO title with correct styling', () => {
      const titleCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'POTATO'
      );
      
      expect(titleCall).toBeDefined();
      expect(titleCall[0]).toBe(400); // x: width/2
      expect(titleCall[1]).toBe(200); // y: height/3
      expect(titleCall[3].font).toBe('bold 48px Arial');
      expect(titleCall[3].fill).toBe('#f39c12');
    });

    test('should display Birthday Game subtitle', () => {
      const subtitleCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Birthday Game'
      );
      
      expect(subtitleCall).toBeDefined();
      expect(subtitleCall[0]).toBe(400);
      expect(subtitleCall[1]).toBe(260);
      expect(subtitleCall[3].font).toBe('24px Arial');
    });
  });

  describe('Progress Display - No Progress', () => {
    beforeEach(() => {
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 0,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 0,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      
      menuScene = new MenuScene();
      menuScene.create();
    });

    test('should show Start Game button when no progress exists', () => {
      const startButtonCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Start Game'
      );
      
      expect(startButtonCall).toBeDefined();
      expect(startButtonCall[3].font).toBe('bold 24px Arial');
      expect(startButtonCall[3].fill).toBe('#e74c3c');
    });

    test('should not display progress text when no progress exists', () => {
      const progressCall = menuScene.add.text.mock.calls.find(call => 
        call[2].includes('Progress:')
      );
      
      expect(progressCall).toBeUndefined();
    });
  });

  describe('Progress Display - With Progress', () => {
    beforeEach(() => {
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 25,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 10,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      
      menuScene = new MenuScene();
      menuScene.create();
    });

    test('should show Resume Game button when progress exists', () => {
      const resumeButtonCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Resume Game'
      );
      
      expect(resumeButtonCall).toBeDefined();
    });

    test('should display bubble collection progress', () => {
      const progressCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Progress: 25/50 bubbles'
      );
      
      expect(progressCall).toBeDefined();
      expect(progressCall[1]).toBe(280); // height/2 - 20
    });

    test('should display tetris progress when tetris lines exist', () => {
      const tetrisCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Tetris: 10/34 lines'
      );
      
      expect(tetrisCall).toBeDefined();
      expect(tetrisCall[1]).toBe(300); // height/2
    });

    test('should show New Game button when progress exists', () => {
      const newGameCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'New Game'
      );
      
      expect(newGameCall).toBeDefined();
      expect(newGameCall[3].fill).toBe('#3498db');
    });
  });

  describe('Device-Specific Instructions', () => {
    test('should show keyboard instructions on desktop', () => {
      menuScene.sys.game.device.input.touch = false;
      menuScene = new MenuScene();
      menuScene.create();
      
      const instructionCall = menuScene.add.text.mock.calls.find(call => 
        call[2].includes('ARROW KEYS')
      );
      
      expect(instructionCall).toBeDefined();
      expect(instructionCall[2]).toContain('Use ARROW KEYS to move and SPACE to jump');
    });

    test('should show touch instructions on mobile', () => {
      const newMenuScene = new MenuScene();
      newMenuScene.sys.game.device.input.touch = true;
      
      // Set up mock
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      newMenuScene.create();
      
      const instructionCall = newMenuScene.add.text.mock.calls.find(call => 
        call[2] && call[2].includes && call[2].includes('Tap LEFT/RIGHT')
      );
      
      expect(instructionCall).toBeDefined();
      expect(instructionCall[2]).toContain('Tap LEFT/RIGHT to move and TAP UPPER RIGHT to jump');
    });

    test('should include game objective in instructions', () => {
      const instructionCall = menuScene.add.text.mock.calls.find(call => 
        call[2].includes('Collect bubbles and avoid obstacles')
      );
      
      expect(instructionCall).toBeDefined();
    });
  });

  describe('Button Interactions', () => {
    let startButton;

    beforeEach(() => {
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 0,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 0,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      GameStateManager.getResumeScene = mockGameStateManager.getResumeScene;
      
      menuScene = new MenuScene();
      menuScene.create();
      
      startButton = menuScene.add.text.mock.results.find(result => 
        result.value.text === 'Start Game'
      )?.value;
    });

    test('should make start button interactive', () => {
      expect(startButton.setInteractive).toHaveBeenCalledWith({ useHandCursor: true });
    });

    test('should set up hover effects for start button', () => {
      expect(startButton.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
      expect(startButton.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
    });

    test('should handle start button click', () => {
      mockGameStateManager.getResumeScene.mockReturnValue(SCENE_KEYS.GAME);
      
      const pointerdownCall = startButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      expect(pointerdownCall).toBeDefined();
      
      // Simulate button click
      pointerdownCall[1]();
      expect(mockGameStateManager.getResumeScene).toHaveBeenCalled();
      expect(menuScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });
  });

  describe('New Game Functionality', () => {
    let newGameButton;

    beforeEach(() => {
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 25,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 5,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      GameStateManager.clearProgress = mockGameStateManager.clearProgress;
      
      menuScene = new MenuScene();
      menuScene.create();
      
      newGameButton = menuScene.add.text.mock.results.find(result => 
        result.value.text === 'New Game'
      )?.value;
    });

    test('should clear progress and start new game when clicked', () => {
      const pointerdownCall = newGameButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      
      // Simulate button click
      pointerdownCall[1]();
      
      expect(mockGameStateManager.clearProgress).toHaveBeenCalled();
      expect(menuScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.GAME);
    });
  });

  describe('UI Layout and Positioning', () => {
    test('should position title at screen center top', () => {
      const titleCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'POTATO'
      );
      
      expect(titleCall[0]).toBe(400); // width / 2
      expect(titleCall[1]).toBe(200); // height / 3
    });

    test('should adjust button positions based on progress display', () => {
      // Test with progress
      mockGameStateManager.getProgressSummary.mockReturnValue({
        bubblesCollected: 10,
        bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
        tetrisLines: 0,
        tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET
      });
      
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      
      menuScene = new MenuScene();
      menuScene.create();
      
      const resumeButtonCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Resume Game'
      );
      
      expect(resumeButtonCall[1]).toBe(380); // height/2 + 80 (adjusted for progress)
    });

    test('should display version info at bottom left', () => {
      const versionCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'Phaser Framework Test Scene'
      );
      
      expect(versionCall).toBeDefined();
      expect(versionCall[0]).toBe(10); // x: 10
      expect(versionCall[1]).toBe(570); // y: height - 30
    });
  });

  describe('Scene Navigation Logic', () => {
    test('should get resume scene from GameStateManager', () => {
      mockGameStateManager.getResumeScene.mockReturnValue(SCENE_KEYS.TETRIS);
      GameStateManager.getResumeScene = mockGameStateManager.getResumeScene;
      
      const startButton = menuScene.add.text.mock.results.find(result => 
        result.value.text === 'Start Game' || result.value.text === 'Resume Game'
      )?.value;
      
      const pointerdownCall = startButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      
      pointerdownCall[1]();
      
      expect(menuScene.scene.start).toHaveBeenCalledWith(SCENE_KEYS.TETRIS);
    });
  });

  describe('Responsive Design', () => {
    test('should handle different screen orientations', () => {
      // Test with different camera dimensions
      const newMenuScene = new MenuScene();
      newMenuScene.cameras.main.width = 600;
      newMenuScene.cameras.main.height = 800;
      
      // Set up mock for the new scene
      GameStateManager.getProgressSummary = mockGameStateManager.getProgressSummary;
      newMenuScene.create();
      
      const titleCall = newMenuScene.add.text.mock.calls.find(call => 
        call[2] === 'POTATO'
      );
      
      expect(titleCall[0]).toBe(300); // width / 2
    });

    test('should maintain proper text alignment', () => {
      const titleCall = menuScene.add.text.mock.calls.find(call => 
        call[2] === 'POTATO'
      );
      
      const titleElement = titleCall ? menuScene.add.text.mock.results[menuScene.add.text.mock.calls.indexOf(titleCall)].value : null;
      
      expect(titleElement.setOrigin).toHaveBeenCalledWith(0.5);
    });
  });
});
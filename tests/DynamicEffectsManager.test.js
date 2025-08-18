import { GAME_CONFIG } from '../src/config.js';
import DynamicEffectsManager from '../src/utils/DynamicEffectsManager.js';

// Mock Phaser global for testing
global.Phaser = {
  Utils: {
    Array: {
      GetRandom: jest.fn()
    }
  }
};

// Mock scene object for testing
const createMockScene = () => ({
  time: {
    delayedCall: jest.fn((delay, callback) => {
      const timer = { 
        remove: jest.fn(),
        callback,
        delay
      };
      // Don't execute callback immediately to avoid infinite loops
      return timer;
    })
  },
  physics: {
    world: {
      gravity: { y: 300 },
      timeScale: 1.0
    }
  },
  player: {
    body: {
      bounce: { y: 0 },
      setBounce: jest.fn(),
      setDrag: jest.fn(),
      setVelocity: jest.fn(),
      friction: { x: 0, y: 0 },
      drag: { x: 0, y: 0 }
    },
    scale: 1,
    setScale: jest.fn(),
    setPosition: jest.fn()
  },
  cameras: {
    main: {
      width: 800,
      height: 600
    }
  },
  add: {
    rectangle: jest.fn().mockReturnValue({
      setAlpha: jest.fn().mockReturnThis(),
      setDepth: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    }),
    text: jest.fn().mockReturnValue({
      setOrigin: jest.fn().mockReturnThis(),
      setDepth: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    })
  },
  tweens: {
    add: jest.fn((config) => {
      // Simulate tween completion
      if (config.onComplete) config.onComplete();
    })
  },
  effectSpeedMultiplier: 1.0,
  invertedControls: false,
  windForce: 0,
  obstacleSpeedMultiplier: 1.0,
  globalColorOverride: null,
  applyGlobalColorOverride: jest.fn(),
  removeGlobalColorOverride: jest.fn()
});

describe('DynamicEffectsManager', () => {
  let mockScene;
  let effectsManager;

  beforeEach(() => {
    mockScene = createMockScene();
    effectsManager = new DynamicEffectsManager(mockScene);
  });

  afterEach(() => {
    if (effectsManager) {
      effectsManager.stop();
    }
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(effectsManager.isActive).toBe(false);
      expect(effectsManager.currentEffect).toBe(null);
      expect(effectsManager.availableEffects).toEqual(
        Object.keys(GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS)
      );
    });

    test('should have all configured effects available', () => {
      const expectedEffects = ['GRAVITY_LOW', 'SPEED_BOOST', 'TIME_SLOW', 'INVERTED_CONTROLS', 'BOUNCY_MODE', 
                               'GRAVITY_FLIP', 'WIND_GUST', 'SLIPPERY_FLOOR', 'STICKY_FLOOR', 'TELEPORT_PORTAL',
                               'SHRINK_PLAYER', 'OBSTACLE_SPEED_BOOST', 'OBSTACLE_REVERSE', 'GLOBAL_COLOR_SHIFT'];
      expect(effectsManager.availableEffects).toEqual(expect.arrayContaining(expectedEffects));
      expect(effectsManager.availableEffects.length).toBe(expectedEffects.length);
    });
  });

  describe('Effects System Control', () => {
    test('should start the effects system correctly', () => {
      effectsManager.start();
      
      expect(effectsManager.isActive).toBe(true);
      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        GAME_CONFIG.EFFECTS.DYNAMIC.NORMAL_DURATION,
        expect.any(Function)
      );
    });

    test('should not start if already active', () => {
      effectsManager.start();
      const firstCallCount = mockScene.time.delayedCall.mock.calls.length;
      
      effectsManager.start(); // Try to start again
      
      expect(mockScene.time.delayedCall.mock.calls.length).toBe(firstCallCount);
    });

    test('should stop the effects system and clean up', () => {
      effectsManager.start();
      const mockTimer = { remove: jest.fn() };
      effectsManager.effectTimer = mockTimer;
      effectsManager.normalTimer = mockTimer;
      
      effectsManager.stop();
      
      expect(effectsManager.isActive).toBe(false);
      expect(mockTimer.remove).toHaveBeenCalledTimes(2);
      expect(effectsManager.effectTimer).toBe(null);
      expect(effectsManager.normalTimer).toBe(null);
    });
  });

  describe('Effect Application', () => {
    test('should store original values before applying effects', () => {
      effectsManager.storeOriginalValues();
      
      expect(effectsManager.originalValues).toEqual({
        gravity: 300,
        playerSpeed: GAME_CONFIG.PHYSICS.PLAYER_SPEED,
        timeScale: 1.0,
        playerBounce: 0,
        playerScale: 1,
        playerFriction: { x: 0, y: 0 },
        playerDrag: { x: 0, y: 0 },
        obstacleSpeed: undefined,
        originalPlayerColor: null,
        originalBubbleColor: GAME_CONFIG.BUBBLES.COLOR,
        originalObstacleColor: GAME_CONFIG.OBSTACLES.COLOR
      });
    });

    test('should apply GRAVITY_LOW effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.GRAVITY_LOW;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('GRAVITY_LOW', effectConfig);
      
      expect(mockScene.physics.world.gravity.y).toBe(300 * effectConfig.gravityMultiplier);
      expect(mockScene.add.rectangle).toHaveBeenCalledWith(
        400, 300, 800, 600, effectConfig.color
      );
    });

    test('should apply SPEED_BOOST effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.SPEED_BOOST;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('SPEED_BOOST', effectConfig);
      
      expect(mockScene.effectSpeedMultiplier).toBe(effectConfig.speedMultiplier);
    });

    test('should apply TIME_SLOW effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.TIME_SLOW;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('TIME_SLOW', effectConfig);
      
      expect(mockScene.physics.world.timeScale).toBe(effectConfig.timeScale);
    });

    test('should apply INVERTED_CONTROLS effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.INVERTED_CONTROLS;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('INVERTED_CONTROLS', effectConfig);
      
      expect(mockScene.invertedControls).toBe(effectConfig.invertControls);
    });

    test('should apply BOUNCY_MODE effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.BOUNCY_MODE;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('BOUNCY_MODE', effectConfig);
      
      expect(mockScene.player.body.setBounce).toHaveBeenCalledWith(effectConfig.playerBounce);
    });

    test('should apply GRAVITY_FLIP effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.GRAVITY_FLIP;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('GRAVITY_FLIP', effectConfig);
      
      expect(mockScene.physics.world.gravity.y).toBe(300 * effectConfig.gravityMultiplier);
    });

    test('should apply WIND_GUST effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.WIND_GUST;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('WIND_GUST', effectConfig);
      
      expect(mockScene.windForce).toBe(effectConfig.windForce);
    });

    test('should apply SLIPPERY_FLOOR effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.SLIPPERY_FLOOR;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('SLIPPERY_FLOOR', effectConfig);
      
      expect(mockScene.player.body.setDrag).toHaveBeenCalled();
    });

    test('should apply SHRINK_PLAYER effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.SHRINK_PLAYER;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('SHRINK_PLAYER', effectConfig);
      
      expect(mockScene.player.setScale).toHaveBeenCalledWith(effectConfig.scaleMultiplier);
    });

    test('should adjust player position when shrinking to maintain ground contact', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.SHRINK_PLAYER;
      
      // Set up mock player with realistic positioning
      mockScene.player.y = 540; // height - 60, typical player position
      mockScene.player.height = 48; // standard player height
      mockScene.player.scaleY = 1; // normal scale
      
      // Mock ground setup (height - 20 = 580, so ground top = 560)
      mockScene.ground = {
        y: 580,
        height: 40
      };
      
      effectsManager.storeOriginalValues();
      effectsManager.applyEffect('SHRINK_PLAYER', effectConfig);
      
      // Player should be repositioned to maintain ground contact
      // When scaled to 0.5, effective height becomes 24
      // New Y position should be ground top - (scaled height / 2)
      const groundTop = mockScene.ground.y - mockScene.ground.height / 2; // 560
      const scaledHeight = mockScene.player.height * effectConfig.scaleMultiplier; // 24
      const expectedY = groundTop - scaledHeight / 2; // 560 - 12 = 548
      
      expect(mockScene.player.setPosition).toHaveBeenCalledWith(mockScene.player.x, expectedY);
    });

    test('should apply OBSTACLE_SPEED_BOOST effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.OBSTACLE_SPEED_BOOST;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('OBSTACLE_SPEED_BOOST', effectConfig);
      
      expect(mockScene.obstacleSpeedMultiplier).toBe(effectConfig.obstacleSpeedMultiplier);
    });

    test('should apply TELEPORT_PORTAL effect correctly', () => {
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.TELEPORT_PORTAL;
      effectsManager.storeOriginalValues();
      
      effectsManager.applyEffect('TELEPORT_PORTAL', effectConfig);
      
      expect(mockScene.player.setPosition).toHaveBeenCalled();
      expect(mockScene.player.body.setVelocity).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Effect Deactivation', () => {
    test('should restore all original values when deactivating', () => {
      effectsManager.storeOriginalValues();
      
      // Apply an effect first
      effectsManager.currentEffect = {
        key: 'GRAVITY_LOW',
        config: GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.GRAVITY_LOW
      };
      effectsManager.screenTint = { destroy: jest.fn() };
      
      effectsManager.deactivateCurrentEffect();
      
      expect(mockScene.physics.world.gravity.y).toBe(300);
      expect(mockScene.physics.world.timeScale).toBe(1.0);
      expect(mockScene.effectSpeedMultiplier).toBe(1.0);
      expect(mockScene.invertedControls).toBe(false);
      expect(mockScene.windForce).toBe(0);
      expect(mockScene.obstacleSpeedMultiplier).toBe(1.0);
      expect(mockScene.globalColorOverride).toBe(null);
      expect(mockScene.removeGlobalColorOverride).toHaveBeenCalled();
      expect(mockScene.player.body.setBounce).toHaveBeenCalledWith(0);
      expect(effectsManager.currentEffect).toBe(null);
    });

    test('should restore player position when deactivating SHRINK_PLAYER effect', () => {
      // Set up original player position
      mockScene.player.y = 540;
      mockScene.ground = { y: 580, height: 40 };
      
      effectsManager.storeOriginalValues();
      
      // Apply SHRINK_PLAYER effect
      const effectConfig = GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.SHRINK_PLAYER;
      effectsManager.currentEffect = { key: 'SHRINK_PLAYER', config: effectConfig };
      effectsManager.applyEffect('SHRINK_PLAYER', effectConfig);
      
      // Reset the mock to track deactivation calls
      mockScene.player.setPosition.mockClear();
      
      // Deactivate effect
      effectsManager.deactivateCurrentEffect();
      
      // Should restore original Y position
      expect(mockScene.player.setPosition).toHaveBeenCalledWith(mockScene.player.x, 540);
      expect(mockScene.player.setScale).toHaveBeenCalledWith(1); // Original scale
    });

    test('should handle deactivation when no effect is active', () => {
      expect(() => {
        effectsManager.deactivateCurrentEffect();
      }).not.toThrow();
    });
  });

  describe('Visual Effects', () => {
    test('should create screen tint with correct properties', () => {
      const testColor = 0xff0000;
      
      effectsManager.addScreenTint(testColor);
      
      expect(mockScene.add.rectangle).toHaveBeenCalledWith(400, 300, 800, 600, testColor);
    });

    test('should remove existing tint before adding new one', () => {
      const mockTint = { destroy: jest.fn() };
      effectsManager.screenTint = mockTint;
      
      effectsManager.addScreenTint(0x00ff00);
      
      expect(mockTint.destroy).toHaveBeenCalled();
    });

    test('should create effect notification with correct text', () => {
      effectsManager.showEffectNotification('Test Effect', 0xff0000);
      
      expect(mockScene.add.text).toHaveBeenCalledWith(400, 60, 'Test Effect', expect.any(Object));
    });
  });

  describe('Random Effect Selection', () => {
    beforeEach(() => {
      // Mock Phaser.Utils.Array.GetRandom to return predictable results
      global.Phaser.Utils.Array.GetRandom.mockReturnValue('GRAVITY_LOW');
    });

    afterEach(() => {
      global.Phaser.Utils.Array.GetRandom.mockReset();
    });

    test('should activate random effect from available pool', () => {
      effectsManager.isActive = true; // Manually set active for test
      effectsManager.storeOriginalValues();
      effectsManager.activateRandomEffect();
      
      expect(effectsManager.currentEffect).toBeTruthy();
      expect(effectsManager.currentEffect.key).toBe('GRAVITY_LOW');
      expect(global.Phaser.Utils.Array.GetRandom).toHaveBeenCalledWith(effectsManager.availableEffects);
    });

    test('should schedule effect end timer when activating effect', () => {
      effectsManager.isActive = true; // Manually set active for test
      effectsManager.activateRandomEffect();
      
      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        GAME_CONFIG.EFFECTS.DYNAMIC.EFFECT_DURATION,
        expect.any(Function)
      );
    });
  });

  describe('Timer Management', () => {
    test('should not schedule effects when stopped', () => {
      effectsManager.isActive = false;
      const callCountBefore = mockScene.time.delayedCall.mock.calls.length;
      
      effectsManager.scheduleNextEffect();
      
      expect(mockScene.time.delayedCall.mock.calls.length).toBe(callCountBefore);
    });

    test('should not activate effects when stopped', () => {
      effectsManager.isActive = false;
      const originalGravity = mockScene.physics.world.gravity.y;
      
      effectsManager.activateRandomEffect();
      
      expect(mockScene.physics.world.gravity.y).toBe(originalGravity);
      expect(effectsManager.currentEffect).toBe(null);
    });
  });

  describe('Utility Methods', () => {
    test('should return current effect info', () => {
      const testEffect = { key: 'TEST', config: {} };
      effectsManager.currentEffect = testEffect;
      
      expect(effectsManager.getCurrentEffect()).toBe(testEffect);
    });

    test('should return effects active status', () => {
      expect(effectsManager.isEffectsActive()).toBe(false);
      
      effectsManager.isActive = true;
      expect(effectsManager.isEffectsActive()).toBe(true);
      
      effectsManager.stop();
      expect(effectsManager.isEffectsActive()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing player body gracefully', () => {
      mockScene.player.body = null;
      
      expect(() => {
        effectsManager.applyEffect('BOUNCY_MODE', GAME_CONFIG.EFFECTS.DYNAMIC.EFFECTS.BOUNCY_MODE);
      }).not.toThrow();
    });

    test('should handle missing tweens system gracefully', () => {
      mockScene.tweens = null;
      
      expect(() => {
        effectsManager.showEffectNotification('Test', 0xff0000);
      }).not.toThrow();
    });
  });
});
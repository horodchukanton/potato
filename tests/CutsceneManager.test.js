import CutsceneManager from '../src/utils/CutsceneManager.js';
import { GAME_CONFIG, SCENE_KEYS } from '../src/config.js';

describe('CutsceneManager', () => {
  let cutsceneManager;
  let mockScene;

  beforeEach(() => {
    // Create mock scene with all necessary properties and methods
    mockScene = {
      player: {
        scale: 1,
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        setScale: jest.fn(),
        destroy: jest.fn()
      },
      cameras: {
        main: {
          width: 800,
          height: 600,
          fadeOut: jest.fn((duration, r, g, b) => {
            // Simulate immediate completion for testing
            setTimeout(() => {
              mockScene.cameras.main.emit('camerafadeoutcomplete');
            }, 0);
          }),
          fadeIn: jest.fn(),
          once: jest.fn((event, callback) => {
            if (event === 'camerafadeoutcomplete') {
              setTimeout(callback, 0);
            }
          }),
          emit: jest.fn()
        }
      },
      add: {
        image: jest.fn().mockReturnValue({
          setScale: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          width: 32,
          height: 48,
          destroy: jest.fn()
        })
      },
      tweens: {
        add: jest.fn((config) => {
          // Simulate immediate tween completion for testing
          setTimeout(() => {
            if (config.onComplete) config.onComplete();
          }, 0);
        })
      },
      time: {
        delayedCall: jest.fn((delay, callback) => {
          // Simulate immediate delay completion for testing
          setTimeout(callback, 0);
        })
      },
      physics: {
        pause: jest.fn()
      },
      dynamicEffectsManager: {
        pause: jest.fn()
      },
      stopAllAudio: jest.fn()
    };

    cutsceneManager = new CutsceneManager(mockScene);
  });

  describe('playGrowingCutscene', () => {
    test('should animate player growing to fill screen', (done) => {
      cutsceneManager.playGrowingCutscene(() => {
        // Verify tween was created with correct parameters
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            targets: mockScene.player,
            duration: GAME_CONFIG.EFFECTS.CUTSCENES.GROW_DURATION,
            ease: 'Cubic.easeInOut'
          })
        );

        // Verify scale is calculated to fill screen
        const tween = mockScene.tweens.add.mock.calls[0][0];
        expect(tween.scaleX).toBeGreaterThan(10); // Should be large scale
        expect(tween.scaleY).toBeGreaterThan(10);

        // Verify player is moved to screen center
        expect(tween.x).toBe(400); // width / 2
        expect(tween.y).toBe(300); // height / 2

        done();
      });
    });

    test('should pause physics and effects during cutscene', (done) => {
      cutsceneManager.playGrowingCutscene(() => {
        expect(mockScene.physics.pause).toHaveBeenCalled();
        expect(mockScene.dynamicEffectsManager.pause).toHaveBeenCalled();
        expect(mockScene.stopAllAudio).toHaveBeenCalled();
        done();
      });
    });

    test('should handle missing player gracefully', (done) => {
      mockScene.player = null;
      
      const onComplete = jest.fn();
      cutsceneManager.playGrowingCutscene(onComplete);
      
      setTimeout(() => {
        expect(onComplete).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle missing tweens gracefully', (done) => {
      mockScene.tweens = null;
      
      const onComplete = jest.fn();
      cutsceneManager.playGrowingCutscene(onComplete);
      
      setTimeout(() => {
        expect(onComplete).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('playShrinkingCutscene', () => {
    test('should create temporary player sprite and animate shrinking', (done) => {
      cutsceneManager.playShrinkingCutscene(() => {
        // Verify temporary player sprite was created
        expect(mockScene.add.image).toHaveBeenCalledWith(400, 300, 'player');
        
        // Verify tween was created
        expect(mockScene.tweens.add).toHaveBeenCalled();
        
        const tween = mockScene.tweens.add.mock.calls[0][0];
        expect(tween.scaleX).toBe(1.0);
        expect(tween.scaleY).toBe(1.0);
        expect(tween.duration).toBe(GAME_CONFIG.EFFECTS.CUTSCENES.SHRINK_DURATION);
        
        done();
      });
    });

    test('should fade in at start of cutscene', (done) => {
      cutsceneManager.playShrinkingCutscene(() => {
        expect(mockScene.cameras.main.fadeIn).toHaveBeenCalledWith(
          GAME_CONFIG.EFFECTS.CUTSCENES.FADE_DURATION, 0, 0, 0
        );
        done();
      });
    });

    test('should handle missing add.image gracefully', (done) => {
      mockScene.add.image = jest.fn().mockReturnValue(null);
      
      const onComplete = jest.fn();
      cutsceneManager.playShrinkingCutscene(onComplete);
      
      setTimeout(() => {
        expect(onComplete).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('configuration', () => {
    test('should use correct cutscene timing constants', () => {
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.GROW_DURATION).toBeDefined();
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.SHRINK_DURATION).toBeDefined();
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.PAUSE_DURATION).toBeDefined();
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.FADE_DURATION).toBeDefined();
      
      // Verify reasonable timing values
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.GROW_DURATION).toBeGreaterThan(0);
      expect(GAME_CONFIG.EFFECTS.CUTSCENES.SHRINK_DURATION).toBeGreaterThan(0);
    });
  });
});
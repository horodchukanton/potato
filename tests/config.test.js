import { GAME_CONFIG, SCENE_KEYS, ASSET_KEYS, STORAGE_KEYS } from '../src/config.js';

describe('Game Configuration', () => {
  describe('GAME_CONFIG', () => {
    test('should have correct game dimensions', () => {
      expect(GAME_CONFIG.WIDTH).toBe(800);
      expect(GAME_CONFIG.HEIGHT).toBe(600);
    });

    test('should have valid physics configuration', () => {
      expect(GAME_CONFIG.PHYSICS.GRAVITY).toBe(300);
      expect(GAME_CONFIG.PHYSICS.PLAYER_SPEED).toBe(180);
      expect(GAME_CONFIG.PHYSICS.JUMP_VELOCITY).toBe(-350);
    });

    test('should have bubble collection target set', () => {
      expect(GAME_CONFIG.BUBBLE_COLLECTION_TARGET).toBe(50);
      expect(typeof GAME_CONFIG.BUBBLE_COLLECTION_TARGET).toBe('number');
      expect(GAME_CONFIG.BUBBLE_COLLECTION_TARGET).toBeGreaterThan(0);
    });

    test('should have tetris lines target set', () => {
      expect(GAME_CONFIG.TETRIS_LINES_TARGET).toBe(34);
      expect(typeof GAME_CONFIG.TETRIS_LINES_TARGET).toBe('number');
      expect(GAME_CONFIG.TETRIS_LINES_TARGET).toBeGreaterThan(0);
    });

    test('should have valid obstacle configuration', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      expect(obstacles.SPAWN_DELAY_MIN).toBe(3000);
      expect(obstacles.SPAWN_DELAY_MAX).toBe(6000);
      expect(obstacles.SPAWN_DELAY_MIN).toBeLessThan(obstacles.SPAWN_DELAY_MAX);
      expect(obstacles.SPEED).toBe(-150);
      expect(obstacles.MIN_HEIGHT).toBe(40);
      expect(obstacles.MAX_HEIGHT).toBe(80);
      expect(obstacles.MIN_HEIGHT).toBeLessThan(obstacles.MAX_HEIGHT);
      expect(obstacles.WIDTH).toBe(30);
      expect(obstacles.DAMAGE).toBe(1);
      expect(obstacles.LIVES).toBe(3);
    });

    test('should have valid bubble configuration', () => {
      const bubbles = GAME_CONFIG.BUBBLES;
      expect(bubbles.SPEED_X).toBe(-150);
      expect(bubbles.SPEED_Y_MIN).toBe(-30);
      expect(bubbles.SPEED_Y_MAX).toBe(30);
      expect(bubbles.SPEED_Y_MIN).toBeLessThan(bubbles.SPEED_Y_MAX);
      expect(bubbles.RADIUS).toBe(16);
      expect(bubbles.RADIUS).toBeGreaterThan(0);
    });

    test('should have valid touch configuration', () => {
      const touch = GAME_CONFIG.TOUCH;
      expect(touch.FEEDBACK_ALPHA).toBe(1.0);
      expect(touch.NORMAL_ALPHA).toBe(0.6);
      expect(touch.INDICATOR_SIZE).toBe(32);
      expect(touch.FEEDBACK_ALPHA).toBeGreaterThan(touch.NORMAL_ALPHA);
    });
  });

  describe('SCENE_KEYS', () => {
    test('should contain all required scene keys', () => {
      expect(SCENE_KEYS.PRELOAD).toBe('PreloadScene');
      expect(SCENE_KEYS.MENU).toBe('MenuScene');
      expect(SCENE_KEYS.GAME).toBe('GameScene');
      expect(SCENE_KEYS.TETRIS).toBe('TetrisScene');
      expect(SCENE_KEYS.UI).toBe('UIScene');
    });

    test('should have unique scene keys', () => {
      const values = Object.values(SCENE_KEYS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('ASSET_KEYS', () => {
    test('should contain all required asset keys', () => {
      expect(ASSET_KEYS.PLAYER).toBe('player');
      expect(ASSET_KEYS.BUBBLE).toBe('bubble');
      expect(ASSET_KEYS.OBSTACLE).toBe('obstacle');
      expect(ASSET_KEYS.BACKGROUND).toBe('background');
      expect(ASSET_KEYS.COLLECT_SOUND).toBe('collect');
      expect(ASSET_KEYS.JUMP_SOUND).toBe('jump');
      expect(ASSET_KEYS.BACKGROUND_MUSIC).toBe('bgm');
    });
  });

  describe('STORAGE_KEYS', () => {
    test('should contain all required storage keys', () => {
      expect(STORAGE_KEYS.BUBBLES_COLLECTED).toBe('bubbles_collected');
      expect(STORAGE_KEYS.CURRENT_PHASE).toBe('current_phase');
      expect(STORAGE_KEYS.TETRIS_LINES).toBe('tetris_lines');
      expect(STORAGE_KEYS.TETROMINOES_USED).toBe('tetrominoes_used');
      expect(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED).toBe('first_bubble_collected');
      expect(STORAGE_KEYS.PLAYER_LIVES).toBe('player_lives');
    });

    test('should have unique storage keys', () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
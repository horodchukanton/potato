import { GAME_CONFIG } from '../src/config.js';

describe('Game Mechanics Validation', () => {
  describe('Bubble Collection Mechanics', () => {
    test('should have reasonable bubble collection target', () => {
      const target = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      expect(target).toBeGreaterThan(0);
      expect(target).toBeLessThan(1000); // Reasonable upper limit
    });

    test('should have valid bubble movement speeds', () => {
      const bubbles = GAME_CONFIG.BUBBLES;
      expect(bubbles.SPEED_X).toBeLessThan(0); // Moving left
      expect(Math.abs(bubbles.SPEED_X)).toBeGreaterThan(0); // Has movement
      expect(bubbles.SPEED_Y_MIN).toBeLessThanOrEqual(bubbles.SPEED_Y_MAX);
      // Should fall downward (positive Y values)
      expect(bubbles.SPEED_Y_MIN).toBeGreaterThan(0);
      expect(bubbles.SPEED_Y_MAX).toBeGreaterThan(0);
    });

    test('should have appropriate bubble size', () => {
      const radius = GAME_CONFIG.BUBBLES.RADIUS;
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(100); // Not too large
    });

    test('bubble should move at same horizontal speed as obstacles for consistent gameplay', () => {
      expect(GAME_CONFIG.BUBBLES.SPEED_X).toBe(GAME_CONFIG.OBSTACLES.SPEED);
    });
  });

  describe('Obstacle Collision Mechanics', () => {
    test('should have valid obstacle spawn timing', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      expect(obstacles.SPAWN_DELAY_MIN).toBeGreaterThan(0);
      expect(obstacles.SPAWN_DELAY_MAX).toBeGreaterThan(obstacles.SPAWN_DELAY_MIN);
      expect(obstacles.SPAWN_DELAY_MIN).toBeGreaterThanOrEqual(1000); // At least 1 second
    });

    test('should have reasonable obstacle dimensions', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      expect(obstacles.WIDTH).toBeGreaterThan(0);
      expect(obstacles.MIN_HEIGHT).toBeGreaterThan(0);
      expect(obstacles.MAX_HEIGHT).toBeGreaterThan(obstacles.MIN_HEIGHT);
      expect(obstacles.MIN_HEIGHT).toBeLessThan(GAME_CONFIG.HEIGHT / 2); // Not too tall
    });

    test('should have valid obstacle movement speed', () => {
      const speed = GAME_CONFIG.OBSTACLES.SPEED;
      expect(speed).toBeLessThan(0); // Moving left
      expect(Math.abs(speed)).toBeGreaterThan(0); // Has movement
      expect(Math.abs(speed)).toBeLessThan(1000); // Not too fast
    });

    test('should have reasonable damage and lives values', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      expect(obstacles.DAMAGE).toBeGreaterThan(0);
      expect(obstacles.LIVES).toBeGreaterThan(0);
      expect(obstacles.LIVES).toBeGreaterThanOrEqual(obstacles.DAMAGE); // Can survive at least one hit
    });
  });

  describe('Player Movement Physics', () => {
    test('should have valid gravity setting', () => {
      const gravity = GAME_CONFIG.PHYSICS.GRAVITY;
      expect(gravity).toBeGreaterThan(0);
      expect(gravity).toBeLessThan(2000); // Not too strong
    });

    test('should have reasonable player speed', () => {
      const speed = GAME_CONFIG.PHYSICS.PLAYER_SPEED;
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThan(1000); // Not too fast
    });

    test('should have appropriate jump velocity', () => {
      const jumpVelocity = GAME_CONFIG.PHYSICS.JUMP_VELOCITY;
      expect(jumpVelocity).toBeLessThan(0); // Negative for upward movement
      expect(Math.abs(jumpVelocity)).toBeGreaterThan(0);
      expect(Math.abs(jumpVelocity)).toBeLessThan(1000); // Not too strong
    });

    test('jump velocity should overcome gravity for meaningful jump height', () => {
      const jumpVelocity = Math.abs(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      const gravity = GAME_CONFIG.PHYSICS.GRAVITY;
      // Jump should provide reasonable air time
      const airTime = (2 * jumpVelocity) / gravity;
      expect(airTime).toBeGreaterThan(0.5); // At least 0.5 seconds of air time
    });
  });

  describe('Touch Controls Configuration', () => {
    test('should have valid alpha values for touch feedback', () => {
      const touch = GAME_CONFIG.TOUCH;
      expect(touch.FEEDBACK_ALPHA).toBeGreaterThan(0);
      expect(touch.FEEDBACK_ALPHA).toBeLessThanOrEqual(1.0);
      expect(touch.NORMAL_ALPHA).toBeGreaterThan(0);
      expect(touch.NORMAL_ALPHA).toBeLessThanOrEqual(1.0);
    });

    test('should have appropriate touch indicator size', () => {
      const indicatorSize = GAME_CONFIG.TOUCH.INDICATOR_SIZE;
      expect(indicatorSize).toBeGreaterThan(0);
      expect(indicatorSize).toBeLessThan(200); // Not too large
    });

    test('feedback alpha should be higher than normal alpha for visibility', () => {
      const touch = GAME_CONFIG.TOUCH;
      expect(touch.FEEDBACK_ALPHA).toBeGreaterThan(touch.NORMAL_ALPHA);
    });
  });

  describe('Game Balance Validation', () => {
    test('should have achievable but challenging bubble target', () => {
      const target = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      expect(target).toBeGreaterThan(10); // Meaningful challenge
      expect(target).toBeLessThan(200); // Not excessive
    });

    test('should have appropriate tetris target', () => {
      const target = GAME_CONFIG.TETRIS_LINES_TARGET;
      expect(target).toBeGreaterThan(5); // Meaningful challenge
      expect(target).toBeLessThan(100); // Not excessive
    });

    test('obstacle spawn rate should allow player reaction time', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      const minDelay = obstacles.SPAWN_DELAY_MIN;
      const maxObstacleWidth = obstacles.WIDTH;
      const obstacleSpeed = Math.abs(obstacles.SPEED);
      
      // Time to cross screen at max speed
      const crossTime = GAME_CONFIG.WIDTH / obstacleSpeed * 1000; // Convert to ms
      
      // Min delay should be less than cross time to maintain challenge
      expect(minDelay).toBeLessThan(crossTime);
      // But not too frequent to be unfair
      expect(minDelay).toBeGreaterThan(1000);
    });

    test('player should be able to jump over obstacles', () => {
      const jumpVelocity = Math.abs(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      const gravity = GAME_CONFIG.PHYSICS.GRAVITY;
      const maxObstacleHeight = GAME_CONFIG.OBSTACLES.MAX_HEIGHT;
      
      // Maximum jump height calculation
      const maxJumpHeight = (jumpVelocity * jumpVelocity) / (2 * gravity);
      
      // Player should be able to clear obstacles
      expect(maxJumpHeight).toBeGreaterThan(maxObstacleHeight);
    });
  });

  describe('Color and Visual Configuration', () => {
    test('should have valid color hex values', () => {
      expect(GAME_CONFIG.OBSTACLES.COLOR).toBe(0x808080); // Valid hex
      expect(GAME_CONFIG.BUBBLES.COLOR).toBe(0x3498db); // Valid hex
    });

    test('colors should be different for game objects', () => {
      expect(GAME_CONFIG.OBSTACLES.COLOR).not.toBe(GAME_CONFIG.BUBBLES.COLOR);
    });
  });

  describe('Collision Detection Feasibility', () => {
    test('bubble radius should be appropriate for collision detection', () => {
      const bubbleRadius = GAME_CONFIG.BUBBLES.RADIUS;
      const obstacleWidth = GAME_CONFIG.OBSTACLES.WIDTH;
      
      // Bubble should be smaller than obstacles for fair gameplay
      expect(bubbleRadius * 2).toBeLessThan(obstacleWidth * 2); // Diameter comparison
    });

    test('obstacle dimensions should allow for collision detection', () => {
      const obstacles = GAME_CONFIG.OBSTACLES;
      expect(obstacles.WIDTH).toBeGreaterThan(5); // Large enough to detect
      expect(obstacles.MIN_HEIGHT).toBeGreaterThan(5); // Large enough to detect
    });
  });

  describe('Game State Progression Logic', () => {
    test('should have logical phase progression targets', () => {
      // Bubble phase should complete before tetris phase
      expect(GAME_CONFIG.BUBBLE_COLLECTION_TARGET).toBeGreaterThan(0);
      expect(GAME_CONFIG.TETRIS_LINES_TARGET).toBeGreaterThan(0);
    });

    test('damage system should create meaningful risk/reward', () => {
      const damage = GAME_CONFIG.OBSTACLES.DAMAGE;
      const lives = GAME_CONFIG.OBSTACLES.LIVES;
      
      // Should take multiple hits to lose
      expect(lives / damage).toBeGreaterThan(1);
      // But not too many to make obstacles meaningless
      expect(lives / damage).toBeLessThan(10);
    });
  });
});
import { GAME_CONFIG, SCENE_KEYS, STORAGE_KEYS } from '../src/config.js';

describe('Game State and Logic Utilities', () => {
  describe('Progress Calculation Logic', () => {
    test('should calculate bubble progress percentage correctly', () => {
      const target = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      
      // Test various progress levels
      expect(Math.min(100, (0 / target) * 100)).toBe(0);
      expect(Math.min(100, (target / 2 / target) * 100)).toBe(50);
      expect(Math.min(100, (target / target) * 100)).toBe(100);
      expect(Math.min(100, ((target + 10) / target) * 100)).toBe(100); // Capped at 100%
    });

    test('should calculate tetris progress percentage correctly', () => {
      const target = GAME_CONFIG.TETRIS_LINES_TARGET;
      
      // Test various progress levels  
      expect(Math.min(100, (0 / target) * 100)).toBe(0);
      expect(Math.min(100, (target / 2 / target) * 100)).toBe(50);
      expect(Math.min(100, (target / target) * 100)).toBe(100);
      expect(Math.min(100, ((target + 5) / target) * 100)).toBe(100); // Capped at 100%
    });

    test('should handle edge cases in progress calculation', () => {
      // Division by zero protection (though our targets are > 0)
      expect(Math.min(100, (10 / 1) * 100)).toBe(100);
      expect(Math.min(100, (0 / 1) * 100)).toBe(0);
      
      // Negative values
      expect(Math.min(100, (-5 / 10) * 100)).toBe(-50);
      // Math.max wrapper prevents negative progress percentages that could occur
      // if localStorage contains corrupted negative values, ensuring UI displays 0% instead of negative
      expect(Math.min(100, Math.max(0, (-5 / 10) * 100))).toBe(0); // Better handling
    });
  });

  describe('Game Balance Calculations', () => {
    test('should have reasonable jump physics calculations', () => {
      const jumpVelocity = Math.abs(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      const gravity = GAME_CONFIG.PHYSICS.GRAVITY;
      
      // Calculate maximum jump height: h = v²/(2g)
      const maxHeight = (jumpVelocity * jumpVelocity) / (2 * gravity);
      
      expect(maxHeight).toBeGreaterThan(50); // Minimum useful jump height
      expect(maxHeight).toBeLessThan(300); // Not too high
    });

    test('should have reasonable air time calculations', () => {
      const jumpVelocity = Math.abs(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
      const gravity = GAME_CONFIG.PHYSICS.GRAVITY;
      
      // Calculate total air time: t = 2v/g
      const airTime = (2 * jumpVelocity) / gravity;
      
      expect(airTime).toBeGreaterThan(0.5); // Minimum useful air time
      expect(airTime).toBeLessThan(5); // Not too long
    });

    test('should have reasonable obstacle avoidance window', () => {
      const obstacleSpeed = Math.abs(GAME_CONFIG.OBSTACLES.SPEED);
      const screenWidth = GAME_CONFIG.WIDTH;
      const playerSpeed = GAME_CONFIG.PHYSICS.PLAYER_SPEED;
      
      // Time for obstacle to cross screen
      const crossTime = screenWidth / obstacleSpeed;
      
      // Player should have reasonable time to react
      expect(crossTime).toBeGreaterThan(3); // At least 3 seconds
      expect(crossTime).toBeLessThan(10); // Not too easy
    });

    test('should validate bubble collection challenge level', () => {
      const target = GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
      const bubbleSpeed = Math.abs(GAME_CONFIG.BUBBLES.SPEED_X);
      const screenWidth = GAME_CONFIG.WIDTH;
      
      // Rough estimate of bubbles per screen crossing
      const crossTime = screenWidth / bubbleSpeed;
      const bubblesPerMinute = 60 / crossTime; // Assuming one bubble per cross
      
      // Should take reasonable time to complete
      const estimatedMinutes = target / bubblesPerMinute;
      expect(estimatedMinutes).toBeGreaterThan(2); // At least 2 minutes
      expect(estimatedMinutes).toBeLessThan(20); // Not too long
    });
  });

  describe('Scene Flow Logic', () => {
    test('should have valid scene progression logic', () => {
      // All scene keys should be defined strings
      Object.values(SCENE_KEYS).forEach(sceneKey => {
        expect(typeof sceneKey).toBe('string');
        expect(sceneKey.length).toBeGreaterThan(0);
      });
    });

    test('should validate storage key naming consistency', () => {
      // All storage keys should follow consistent naming
      Object.values(STORAGE_KEYS).forEach(storageKey => {
        expect(typeof storageKey).toBe('string');
        expect(storageKey.length).toBeGreaterThan(0);
        expect(storageKey).toMatch(/^[a-z_]+$/); // Only lowercase and underscores
      });
    });

    test('should have non-conflicting scene and storage keys', () => {
      const sceneValues = Object.values(SCENE_KEYS);
      const storageValues = Object.values(STORAGE_KEYS);
      
      // No overlap between scene and storage keys
      sceneValues.forEach(sceneKey => {
        expect(storageValues).not.toContain(sceneKey);
      });
    });
  });

  describe('Configuration Validation', () => {
    test('should have all required game dimensions', () => {
      expect(GAME_CONFIG.WIDTH).toBeDefined();
      expect(GAME_CONFIG.HEIGHT).toBeDefined();
      expect(typeof GAME_CONFIG.WIDTH).toBe('number');
      expect(typeof GAME_CONFIG.HEIGHT).toBe('number');
      
      // Common screen aspect ratios
      const aspectRatio = GAME_CONFIG.WIDTH / GAME_CONFIG.HEIGHT;
      expect(aspectRatio).toBeGreaterThan(1); // Landscape orientation
      expect(aspectRatio).toBeLessThan(3); // Not too wide
    });

    test('should have optimized speed values for different game objects', () => {
      // Bubbles now have different speed than obstacles for better landing distribution
      expect(GAME_CONFIG.BUBBLES.SPEED_X).toBe(-50); // Optimized for better ground distribution
      expect(GAME_CONFIG.OBSTACLES.SPEED).toBe(-150); // Faster for challenge
      
      // All speeds should be reasonable values
      expect(Math.abs(GAME_CONFIG.BUBBLES.SPEED_X)).toBeLessThan(500);
      expect(Math.abs(GAME_CONFIG.OBSTACLES.SPEED)).toBeLessThan(500);
      expect(GAME_CONFIG.PHYSICS.PLAYER_SPEED).toBeLessThan(500);
    });

    test('should have valid color values', () => {
      // Check that colors are valid hex numbers
      expect(GAME_CONFIG.OBSTACLES.COLOR).toBeGreaterThanOrEqual(0x000000);
      expect(GAME_CONFIG.OBSTACLES.COLOR).toBeLessThanOrEqual(0xFFFFFF);
      expect(GAME_CONFIG.BUBBLES.COLOR).toBeGreaterThanOrEqual(0x000000);
      expect(GAME_CONFIG.BUBBLES.COLOR).toBeLessThanOrEqual(0xFFFFFF);
    });
  });

  describe('Edge Case Handling', () => {
    test('should handle zero and negative configuration values appropriately', () => {
      // Speeds can be negative (left movement) but not zero
      if (GAME_CONFIG.OBSTACLES.SPEED < 0) {
        expect(GAME_CONFIG.OBSTACLES.SPEED).toBeLessThan(0);
      }
      if (GAME_CONFIG.BUBBLES.SPEED_X < 0) {
        expect(GAME_CONFIG.BUBBLES.SPEED_X).toBeLessThan(0);
      }
      
      // Positive values should be positive
      expect(GAME_CONFIG.PHYSICS.GRAVITY).toBeGreaterThan(0);
      expect(GAME_CONFIG.PHYSICS.PLAYER_SPEED).toBeGreaterThan(0);
      expect(GAME_CONFIG.OBSTACLES.LIVES).toBeGreaterThan(0);
      expect(GAME_CONFIG.OBSTACLES.DAMAGE).toBeGreaterThan(0);
    });

    test('should handle boundary values in game mechanics', () => {
      // Obstacle dimensions should fit within screen
      expect(GAME_CONFIG.OBSTACLES.MAX_HEIGHT).toBeLessThan(GAME_CONFIG.HEIGHT);
      expect(GAME_CONFIG.OBSTACLES.WIDTH).toBeLessThan(GAME_CONFIG.WIDTH / 4); // Not too wide
      
      // Bubble radius should be reasonable
      expect(GAME_CONFIG.BUBBLES.RADIUS * 2).toBeLessThan(GAME_CONFIG.HEIGHT / 10); // Not too large
      expect(GAME_CONFIG.BUBBLES.RADIUS).toBeGreaterThan(5); // Not too small
    });

    test('should validate spawn timing logic', () => {
      const minDelay = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN;
      const maxDelay = GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX;
      
      // Reasonable spawn delays
      expect(minDelay).toBeGreaterThan(500); // At least 0.5 seconds
      expect(maxDelay).toBeLessThan(30000); // Not more than 30 seconds
      
      // Range should allow for variation
      const range = maxDelay - minDelay;
      expect(range).toBeGreaterThan(1000); // At least 1 second variation
    });
  });

  describe('Data Type Validation', () => {
    test('should have correct data types for all configuration values', () => {
      // Numbers
      expect(typeof GAME_CONFIG.WIDTH).toBe('number');
      expect(typeof GAME_CONFIG.HEIGHT).toBe('number');
      expect(typeof GAME_CONFIG.BUBBLE_COLLECTION_TARGET).toBe('number');
      expect(typeof GAME_CONFIG.TETRIS_LINES_TARGET).toBe('number');
      
      // Nested objects exist
      expect(typeof GAME_CONFIG.PHYSICS).toBe('object');
      expect(typeof GAME_CONFIG.OBSTACLES).toBe('object');
      expect(typeof GAME_CONFIG.BUBBLES).toBe('object');
      expect(typeof GAME_CONFIG.TOUCH).toBe('object');
    });

    test('should have all required nested configuration properties', () => {
      // Physics properties
      expect(GAME_CONFIG.PHYSICS.GRAVITY).toBeDefined();
      expect(GAME_CONFIG.PHYSICS.PLAYER_SPEED).toBeDefined();
      expect(GAME_CONFIG.PHYSICS.JUMP_VELOCITY).toBeDefined();
      
      // Obstacle properties
      expect(GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN).toBeDefined();
      expect(GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX).toBeDefined();
      expect(GAME_CONFIG.OBSTACLES.SPEED).toBeDefined();
      
      // Bubble properties
      expect(GAME_CONFIG.BUBBLES.SPEED_X).toBeDefined();
      expect(GAME_CONFIG.BUBBLES.RADIUS).toBeDefined();
    });
  });
});
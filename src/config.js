/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PHYSICS: {
    GRAVITY: 300,
    PLAYER_SPEED: 180, // Slightly increased for better responsiveness
    JUMP_VELOCITY: -350, // Slightly stronger jump for mobile
    PLAYER_DEFAULT_DRAG: 800, // Default drag for friction-based effects
    PLAYER_DRAG_ZERO_VELOCITY_THRESHOLD: 50, // Threshold below which velocity is forced to 0
    PLAYER_BODY_WIDTH: 32, // Player physics body width
    PLAYER_BODY_HEIGHT: 48, // Player physics body height
  },
  BUBBLE_COLLECTION_TARGET: 50,
  TETRIS_LINES_TARGET: 34,
  // Mobile touch responsiveness settings
  TOUCH: {
    FEEDBACK_ALPHA: 1.0,
    NORMAL_ALPHA: 0.6,
    INDICATOR_SIZE: 32
  },
  // Obstacle configuration
  OBSTACLES: {
    SPAWN_DELAY_MIN: 3000, // Minimum time between obstacle spawns (ms)
    SPAWN_DELAY_MAX: 6000, // Maximum time between obstacle spawns (ms)
    SPEED: -150, // Obstacle movement speed (negative = moving left)
    MIN_HEIGHT: 40, // Minimum obstacle height
    MAX_HEIGHT: 80, // Maximum obstacle height
    WIDTH: 30, // Obstacle width
    COLOR: 0x808080, // Grey color for rock-like obstacles
    DAMAGE: 1, // Damage dealt to player
    LIVES: 3 // Player starting lives
  },
  // Bubble configuration
  BUBBLES: {
    SPEED_X: -150, // Horizontal speed matching obstacles for forward movement illusion
    SPEED_Y_MIN: 20, // Minimum downward speed for falling effect
    SPEED_Y_MAX: 80, // Maximum downward speed for falling effect
    COLOR: 0x3498db, // Blue color
    RADIUS: 16, // Bubble radius
    // Spawn positioning configuration (separate from movement speed)
    SPAWN_DRIFT_COMPENSATION: 0.2, // Further reduced drift compensation factor (0.0-1.0)
    SPAWN_X_MIN: 200, // Minimum spawn X position
    SPAWN_X_MAX: 1000 // Maximum spawn X position (slightly off-screen for better distribution)
  },
  // Visual effects configuration
  EFFECTS: {
    SCREEN_SHAKE: {
      DURATION: 300,
      INTENSITY: 10
    },
    PARTICLES: {
      BUBBLE_COLLECT: {
        PARTICLE_COUNT: 8,
        SPEED_MIN: 50,
        SPEED_MAX: 150,
        LIFE_SPAN: 800,
        COLORS: [0xffff00, 0x00ffff, 0xff00ff, 0x00ff00]
      },
      OBSTACLE_HIT: {
        PARTICLE_COUNT: 12,
        SPEED_MIN: 80,
        SPEED_MAX: 200,
        LIFE_SPAN: 1000,
        COLORS: [0xff6b6b, 0xffa500, 0x696969]
      },
      PLAYER_TRAIL: {
        PARTICLE_COUNT: 2,
        SPEED_MIN: 20,
        SPEED_MAX: 50,
        LIFE_SPAN: 400,
        COLORS: [0x4ecdc4, 0x45b7d1]
      }
    },
    TRANSITIONS: {
      FADE_DURATION: 500,
      SCENE_TRANSITION_DURATION: 800
    },
    // Dynamic effects system configuration
    DYNAMIC: {
      EFFECT_DURATION: 5000, // 5 seconds per effect
      NORMAL_DURATION: 5000, // 5 seconds normal state
      EFFECTS: {
        GRAVITY_LOW: {
          name: 'Low Gravity',
          gravityMultiplier: 0.3,
          color: 0x9b59b6 // Purple tint
        },
        SPEED_BOOST: {
          name: 'Speed Boost',
          speedMultiplier: 1.8,
          color: 0xe74c3c // Red tint
        },
        TIME_SLOW: {
          name: 'Time Slow',
          timeScale: 0.6,
          color: 0x3498db // Blue tint
        },
        INVERTED_CONTROLS: {
          name: 'Inverted Controls',
          invertControls: true,
          color: 0xf39c12 // Orange tint
        },
        BOUNCY_MODE: {
          name: 'Bouncy Mode',
          playerBounce: 0.8,
          color: 0x2ecc71 // Green tint
        },
        GRAVITY_FLIP: {
          name: 'Gravity Flip',
          gravityMultiplier: -1.0,
          color: 0x8e44ad // Dark purple tint
        },
        WIND_GUST: {
          name: 'Wind Gust',
          windForce: 150,
          color: 0x85c1e9 // Light blue tint
        },
        SLIPPERY_FLOOR: {
          name: 'Slippery Floor',
          frictionMultiplier: 0.3,
          color: 0x5dade2 // Ice blue tint
        },
        STICKY_FLOOR: {
          name: 'Sticky Floor',
          frictionMultiplier: 3.0,
          color: 0xd35400 // Orange-brown tint
        },
        TELEPORT_PORTAL: {
          name: 'Teleport Portal',
          color: 0xd63031 // Bright red tint
        },
        SHRINK_PLAYER: {
          name: 'Shrink Player',
          scaleMultiplier: 0.5,
          color: 0xfdcb6e // Yellow tint
        },
        OBSTACLE_SPEED_BOOST: {
          name: 'Obstacle Speed Boost',
          obstacleSpeedMultiplier: 3.0,
          color: 0xff7675 // Light red tint
        },
        OBSTACLE_REVERSE: {
          name: 'Obstacle Reverse',
          obstacleSpeedMultiplier: -1.0,
          color: 0xa29bfe // Light purple tint
        },
        GLOBAL_COLOR_SHIFT: {
          name: 'Global Color Shift',
          globalColor: 0xe84393, // Pink color for all game elements
          color: 0xffeaa7 // Light yellow tint
        }
      }
    }
  },
  // Audio configuration
  AUDIO: {
    MASTER_VOLUME: 0.7,
    EFFECTS_VOLUME: 0.8,
    MUSIC_VOLUME: 0.4,
    ENABLED_BY_DEFAULT: true
  }
};

/**
 * Scene keys for easy reference
 */
export const SCENE_KEYS = {
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  TETRIS: 'TetrisScene',
  UI: 'UIScene',
};

/**
 * Asset keys for loading and referencing game assets
 */
export const ASSET_KEYS = {
  // Images
  PLAYER: 'player',
  BUBBLE: 'bubble',
  OBSTACLE: 'obstacle',
  BACKGROUND: 'background',
  
  // Audio
  COLLECT_SOUND: 'collect',
  JUMP_SOUND: 'jump',
  BACKGROUND_MUSIC: 'bgm',
  OBSTACLE_HIT_SOUND: 'obstacle_hit',
};

/**
 * LocalStorage keys for saving game progress
 */
export const STORAGE_KEYS = {
    BUBBLES_COLLECTED: 'bubbles_collected',
    CURRENT_PHASE: 'current_phase',
    TETRIS_LINES: 'tetris_lines',
    TETROMINOES_USED: 'tetrominoes_used',
    FIRST_BUBBLE_COLLECTED: 'first_bubble_collected',
    PLAYER_LIVES: 'player_lives',
    AUDIO_ENABLED: 'audio_enabled',
}
/**
 * UI text constants for consistent messaging across scenes and tests
 */
export const UI_TEXT = {
  INSTRUCTIONS: {
    MOBILE: 'Tap LEFT/RIGHT to move and TAP UPPER RIGHT to jump',
    DESKTOP: 'Use ARROW KEYS to move and SPACE to jump'
  }
};

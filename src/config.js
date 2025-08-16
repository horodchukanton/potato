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
    SPEED: -120, // Obstacle movement speed (negative = moving left)
    MIN_HEIGHT: 40, // Minimum obstacle height
    MAX_HEIGHT: 80, // Maximum obstacle height
    WIDTH: 30, // Obstacle width
    COLOR: 0x8B4513, // Brown color for obstacles
    DAMAGE: 1, // Damage dealt to player
    LIVES: 3 // Player starting lives
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
};

/**
 * LocalStorage keys for saving game progress
 */
export const STORAGE_KEYS = {
  BUBBLES_COLLECTED: 'bubbles_collected',
  CURRENT_PHASE: 'current_phase',
  TETRIS_LINES: 'tetris_lines',
  TETROMINOES_USED: 'tetrominoes_used',
};
/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PHYSICS: {
    GRAVITY: 300,
    PLAYER_SPEED: 160,
    JUMP_VELOCITY: -330,
  },
  BUBBLE_COLLECTION_TARGET: 50,
  TETRIS_LINES_TARGET: 34,
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
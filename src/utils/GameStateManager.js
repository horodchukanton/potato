import { STORAGE_KEYS, GAME_CONFIG, SCENE_KEYS } from '../config.js';

/**
 * GameStateManager handles all localStorage operations for game progress
 * Provides centralized save/load functionality for all game data
 */
export default class GameStateManager {
  /**
   * Load all game state from localStorage
   * @returns {Object} Complete game state object
   */
  static loadGameState() {
    return {
      bubblesCollected: GameStateManager.loadBubblesCollected(),
      currentPhase: GameStateManager.loadCurrentPhase(),
      tetrisLines: GameStateManager.loadTetrisLines(),
      tetrominoesUsed: GameStateManager.loadTetrominoesUsed(),
      tetrisGrid: GameStateManager.loadTetrisGrid(),
      firstBubbleCollected: GameStateManager.loadFirstBubbleFlag(),
      playerLives: GameStateManager.loadPlayerLives(),
      audioEnabled: GameStateManager.loadAudioEnabled()
    };
  }

  /**
   * Save complete game state to localStorage
   * @param {Object} gameState - Game state object to save
   */
  static saveGameState(gameState) {
    if (gameState.bubblesCollected !== undefined) {
      GameStateManager.saveBubblesCollected(gameState.bubblesCollected);
    }
    if (gameState.currentPhase !== undefined) {
      GameStateManager.saveCurrentPhase(gameState.currentPhase);
    }
    if (gameState.tetrisLines !== undefined) {
      GameStateManager.saveTetrisLines(gameState.tetrisLines);
    }
    if (gameState.tetrominoesUsed !== undefined) {
      GameStateManager.saveTetrominoesUsed(gameState.tetrominoesUsed);
    }
    if (gameState.tetrisGrid !== undefined) {
      GameStateManager.saveTetrisGrid(gameState.tetrisGrid);
    }
    if (gameState.firstBubbleCollected !== undefined) {
      GameStateManager.saveFirstBubbleFlag(gameState.firstBubbleCollected);
    }
    if (gameState.playerLives !== undefined) {
      GameStateManager.savePlayerLives(gameState.playerLives);
    }
    if (gameState.audioEnabled !== undefined) {
      GameStateManager.saveAudioEnabled(gameState.audioEnabled);
    }
  }

  /**
   * Load bubble collection progress from localStorage
   * @returns {number} Number of bubbles collected
   */
  static loadBubblesCollected() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return 0;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUBBLES_COLLECTED);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } catch (e) {
      console.error('Failed to load bubbles collected from localStorage:', e);
      return 0;
    }
  }

  /**
   * Save bubble collection progress to localStorage
   * @param {number} count - Number of bubbles collected
   */
  static saveBubblesCollected(count) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.BUBBLES_COLLECTED, count.toString());
    } catch (e) {
      console.error('Failed to save bubbles collected to localStorage:', e);
    }
  }

  /**
   * Load current game phase from localStorage
   * @returns {string} Current phase scene key
   */
  static loadCurrentPhase() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return SCENE_KEYS.GAME; // Default to game scene
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PHASE);
      return saved || SCENE_KEYS.GAME; // Default to game scene
    } catch (e) {
      console.error('Failed to load current phase from localStorage:', e);
      return SCENE_KEYS.GAME; // Default to game scene
    }
  }

  /**
   * Save current game phase to localStorage
   * @param {string} phase - Phase scene key
   */
  static saveCurrentPhase(phase) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PHASE, phase);
    } catch (e) {
      console.error('Failed to save current phase to localStorage:', e);
    }
  }

  /**
   * Load Tetris lines cleared from localStorage
   * @returns {number} Number of lines cleared
   */
  static loadTetrisLines() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return 0;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TETRIS_LINES);
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      console.error('Failed to load Tetris lines from localStorage:', e);
      return 0;
    }
  }

  /**
   * Save Tetris lines cleared to localStorage
   * @param {number} lines - Number of lines cleared
   */
  static saveTetrisLines(lines) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.TETRIS_LINES, lines.toString());
    } catch (e) {
      console.error('Failed to save Tetris lines to localStorage:', e);
    }
  }

  /**
   * Load tetrominoes used count from localStorage
   * @returns {number} Number of tetrominoes used
   */
  static loadTetrominoesUsed() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return 0;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TETROMINOES_USED);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } catch (e) {
      console.error('Failed to load tetrominoes used from localStorage:', e);
      return 0;
    }
  }

  /**
   * Save tetrominoes used count to localStorage
   * @param {number} count - Number of tetrominoes used
   */
  static saveTetrominoesUsed(count) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.TETROMINOES_USED, count.toString());
    } catch (e) {
      console.error('Failed to save tetrominoes used to localStorage:', e);
    }
  }

  /**
   * Load Tetris grid state from localStorage
   * @returns {Array<Array<number>>} 2D grid array, or null if no saved state
   */
  static loadTetrisGrid() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return null;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TETRIS_GRID);
      if (!saved) {
        return null;
      }
      const parsed = JSON.parse(saved);
      // Validate that it's a proper 2D array
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        return parsed;
      }
      return null;
    } catch (e) {
      console.error('Failed to load Tetris grid from localStorage:', e);
      return null;
    }
  }

  /**
   * Save Tetris grid state to localStorage
   * @param {Array<Array<number>>} grid - 2D grid array representing placed pieces, or null to clear
   */
  static saveTetrisGrid(grid) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      if (grid === null) {
        localStorage.removeItem(STORAGE_KEYS.TETRIS_GRID);
      } else if (grid && Array.isArray(grid)) {
        localStorage.setItem(STORAGE_KEYS.TETRIS_GRID, JSON.stringify(grid));
      }
    } catch (e) {
      console.error('Failed to save Tetris grid to localStorage:', e);
    }
  }

  /**
   * Load first bubble collection flag from localStorage
   * @returns {boolean} Whether first bubble has been collected
   */
  static loadFirstBubbleFlag() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return false;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED);
      return saved === 'true';
    } catch (e) {
      console.error('Failed to load first bubble flag from localStorage:', e);
      return false;
    }
  }

  /**
   * Save first bubble collection flag to localStorage
   * @param {boolean} collected - Whether first bubble has been collected
   */
  static saveFirstBubbleFlag(collected) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED, collected.toString());
    } catch (e) {
      console.error('Failed to save first bubble flag to localStorage:', e);
    }
  }

  /**
   * Load player lives from localStorage
   * @returns {number} Player lives count
   */
  static loadPlayerLives() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return GAME_CONFIG.OBSTACLES.LIVES;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_LIVES);
      return saved ? parseInt(saved, 10) : GAME_CONFIG.OBSTACLES.LIVES;
    } catch (e) {
      console.error('Failed to load player lives from localStorage:', e);
      return GAME_CONFIG.OBSTACLES.LIVES;
    }
  }

  /**
   * Save player lives to localStorage
   * @param {number} lives - Player lives count
   */
  static savePlayerLives(lives) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_LIVES, lives.toString());
    } catch (e) {
      console.error('Failed to save player lives to localStorage:', e);
    }
  }

  /**
   * Load audio enabled state from localStorage
   * @returns {boolean} Whether audio is enabled
   */
  static loadAudioEnabled() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return GAME_CONFIG.AUDIO.ENABLED_BY_DEFAULT;
    }
    
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED);
    return saved !== null ? JSON.parse(saved) : GAME_CONFIG.AUDIO.ENABLED_BY_DEFAULT;
  }

  /**
   * Save audio enabled state to localStorage
   * @param {boolean} enabled - Whether audio is enabled
   */
  static saveAudioEnabled(enabled) {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    
    // Ensure the value is a boolean
    const booleanValue = Boolean(enabled);
    localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, JSON.stringify(booleanValue));
  }

  /**
   * Check if player has reached bubble collection target
   * @returns {boolean} Whether bubble target has been reached
   */
  static hasReachedBubbleTarget() {
    return GameStateManager.loadBubblesCollected() >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET;
  }

  /**
   * Check if player has reached Tetris lines target
   * @returns {boolean} Whether Tetris target has been reached
   */
  static hasReachedTetrisTarget() {
    return GameStateManager.loadTetrisLines() >= GAME_CONFIG.TETRIS_LINES_TARGET;
  }

  /**
   * Determine which scene should be loaded based on current progress
   * @returns {string} Scene key to load
   */
  static getResumeScene() {
    const currentPhase = GameStateManager.loadCurrentPhase();
    const bubblesCollected = GameStateManager.loadBubblesCollected();
    
    // If we've collected enough bubbles, we should be in or ready for Tetris phase
    if (bubblesCollected >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET) {
      return currentPhase === SCENE_KEYS.TETRIS ? SCENE_KEYS.TETRIS : SCENE_KEYS.GAME;
    }
    
    // Otherwise, stick with the game scene for bubble collection
    return SCENE_KEYS.GAME;
  }

  /**
   * Clear all saved progress (reset game)
   */
  static clearProgress() {
    if (!GameStateManager.isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.BUBBLES_COLLECTED);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PHASE);
      localStorage.removeItem(STORAGE_KEYS.TETRIS_LINES);
      localStorage.removeItem(STORAGE_KEYS.TETROMINOES_USED);
      localStorage.removeItem(STORAGE_KEYS.FIRST_BUBBLE_COLLECTED);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_LIVES);
    } catch (e) {
      console.error('Failed to clear progress from localStorage:', e);
    }
  }

  /**
   * Get progress summary for display
   * @returns {Object} Progress summary object
   */
  static getProgressSummary() {
    const bubblesCollected = GameStateManager.loadBubblesCollected();
    const tetrisLines = GameStateManager.loadTetrisLines();
    
    return {
      bubblesCollected,
      bubblesTarget: GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
      bubblesProgress: Math.min(100, (bubblesCollected / GAME_CONFIG.BUBBLE_COLLECTION_TARGET) * 100),
      tetrisLines,
      tetrisTarget: GAME_CONFIG.TETRIS_LINES_TARGET,
      tetrisProgress: Math.min(100, (tetrisLines / GAME_CONFIG.TETRIS_LINES_TARGET) * 100),
      bubblePhaseComplete: bubblesCollected >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET,
      tetrisPhaseComplete: tetrisLines >= GAME_CONFIG.TETRIS_LINES_TARGET,
      overallComplete: bubblesCollected >= GAME_CONFIG.BUBBLE_COLLECTION_TARGET && 
                      tetrisLines >= GAME_CONFIG.TETRIS_LINES_TARGET
    };
  }

  /**
   * Check if localStorage is available and working
   * @returns {boolean} Whether localStorage is functional
   */
  static isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}
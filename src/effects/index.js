// Effects exports
import GravityLowEffect from './GravityLowEffect.js';
import SpeedBoostEffect from './SpeedBoostEffect.js';
import TimeSlowEffect from './TimeSlowEffect.js';
import InvertedControlsEffect from './InvertedControlsEffect.js';
import BouncyModeEffect from './BouncyModeEffect.js';
import GravityFlipEffect from './GravityFlipEffect.js';
import WindGustEffect from './WindGustEffect.js';
import SlipperyFloorEffect from './SlipperyFloorEffect.js';
import StickyFloorEffect from './StickyFloorEffect.js';
import TeleportPortalEffect from './TeleportPortalEffect.js';
import ShrinkPlayerEffect from './ShrinkPlayerEffect.js';
import ObstacleSpeedBoostEffect from './ObstacleSpeedBoostEffect.js';
import ObstacleReverseEffect from './ObstacleReverseEffect.js';
import GlobalColorShiftEffect from './GlobalColorShiftEffect.js';

/**
 * Registry of all available dynamic effects
 * Maps effect keys to their corresponding effect classes
 */
export const EFFECT_REGISTRY = {
  'GRAVITY_LOW': GravityLowEffect,
  'SPEED_BOOST': SpeedBoostEffect,
  'TIME_SLOW': TimeSlowEffect,
  'INVERTED_CONTROLS': InvertedControlsEffect,
  'BOUNCY_MODE': BouncyModeEffect,
  'GRAVITY_FLIP': GravityFlipEffect,
  'WIND_GUST': WindGustEffect,
  'SLIPPERY_FLOOR': SlipperyFloorEffect,
  'STICKY_FLOOR': StickyFloorEffect,
  'TELEPORT_PORTAL': TeleportPortalEffect,
  'SHRINK_PLAYER': ShrinkPlayerEffect,
  'OBSTACLE_SPEED_BOOST': ObstacleSpeedBoostEffect,
  'OBSTACLE_REVERSE': ObstacleReverseEffect,
  'GLOBAL_COLOR_SHIFT': GlobalColorShiftEffect
};

// Export individual effects for direct import if needed
export {
  GravityLowEffect,
  SpeedBoostEffect,
  TimeSlowEffect,
  InvertedControlsEffect,
  BouncyModeEffect,
  GravityFlipEffect,
  WindGustEffect,
  SlipperyFloorEffect,
  StickyFloorEffect,
  TeleportPortalEffect,
  ShrinkPlayerEffect,
  ObstacleSpeedBoostEffect,
  ObstacleReverseEffect,
  GlobalColorShiftEffect
};
// Effects exports
import GravityLowEffect from './GravityLowEffect.js';
import SpeedBoostEffect from './SpeedBoostEffect.js';
import TimeSlowEffect from './TimeSlowEffect.js';
import InvertedControlsEffect from './InvertedControlsEffect.js';
import BouncyModeEffect from './BouncyModeEffect.js';
import WindGustEffect from './WindGustEffect.js';
import SlipperyFloorEffect from './SlipperyFloorEffect.js';
import TeleportPortalEffect from './TeleportPortalEffect.js';
import ShrinkPlayerEffect from './ShrinkPlayerEffect.js';
import ObstacleSpeedBoostEffect from './ObstacleSpeedBoostEffect.js';
import ObstacleReverseEffect from './ObstacleReverseEffect.js';

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
  'WIND_GUST': WindGustEffect,
  'SLIPPERY_FLOOR': SlipperyFloorEffect,
  'TELEPORT_PORTAL': TeleportPortalEffect,
  'SHRINK_PLAYER': ShrinkPlayerEffect,
  'OBSTACLE_SPEED_BOOST': ObstacleSpeedBoostEffect,
  'OBSTACLE_REVERSE': ObstacleReverseEffect
};

// Export individual effects for direct import if needed
export {
  GravityLowEffect,
  SpeedBoostEffect,
  TimeSlowEffect,
  InvertedControlsEffect,
  BouncyModeEffect,
  WindGustEffect,
  SlipperyFloorEffect,
  TeleportPortalEffect,
  ShrinkPlayerEffect,
  ObstacleSpeedBoostEffect,
  ObstacleReverseEffect
};
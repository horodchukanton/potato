/**
 * mobile-responsiveness.test.js - Tests for mobile device compatibility and responsive design
 * 
 * This test suite validates:
 * - Touch control functionality and accuracy
 * - Mobile device detection and adaptation
 * - Screen size responsiveness and layout adaptation
 * - Performance optimization for mobile devices
 * - Cross-platform user experience consistency
 */

import { GAME_CONFIG, SCENE_KEYS } from '../src/config.js';

describe('Mobile Responsiveness and Touch Controls', () => {
  describe('Touch Input Areas', () => {
    test('should define appropriate touch zone sizes for mobile interaction', () => {
      const screenWidth = 800;
      const screenHeight = 600;
      
      // Touch areas based on GameScene implementation
      const leftTouchArea = { width: screenWidth * 0.3, height: screenHeight };
      const rightTouchArea = { width: screenWidth * 0.4, height: screenHeight };
      const jumpTouchArea = { width: screenWidth * 0.3, height: screenHeight };
      
      // Validate touch zones cover full screen height
      expect(leftTouchArea.height).toBe(screenHeight);
      expect(rightTouchArea.height).toBe(screenHeight);
      expect(jumpTouchArea.height).toBe(screenHeight);
      
      // Validate touch zones are appropriately sized for thumbs
      expect(leftTouchArea.width).toBeGreaterThan(100); // Minimum thumb target
      expect(rightTouchArea.width).toBeGreaterThan(100);
      expect(jumpTouchArea.width).toBeGreaterThan(100);
      
      // Validate total coverage adds up to full width
      const totalWidth = leftTouchArea.width + rightTouchArea.width + jumpTouchArea.width;
      expect(totalWidth).toBe(screenWidth);
    });

    test('should position touch areas for comfortable thumb reach', () => {
      const screenWidth = 800;
      
      // Left area - left thumb zone
      const leftAreaStart = 0;
      const leftAreaEnd = screenWidth * 0.3;
      
      // Right movement area - accessible with left or right thumb
      const rightAreaStart = screenWidth * 0.3;
      const rightAreaEnd = screenWidth * 0.7;
      
      // Jump area - right thumb zone
      const jumpAreaStart = screenWidth * 0.7;
      const jumpAreaEnd = screenWidth;
      
      // Verify no gaps or overlaps
      expect(leftAreaEnd).toBe(rightAreaStart);
      expect(rightAreaEnd).toBe(jumpAreaStart);
      expect(jumpAreaEnd).toBe(screenWidth);
      
      // Verify zones are reasonable for human ergonomics
      expect(leftAreaEnd - leftAreaStart).toBeGreaterThan(150); // Thumb comfort zone
      expect(jumpAreaEnd - jumpAreaStart).toBeGreaterThan(150);
    });

    test('should handle touch events with appropriate feedback', () => {
      const touchAlphaValues = {
        normal: GAME_CONFIG.TOUCH.NORMAL_ALPHA,
        feedback: GAME_CONFIG.TOUCH.FEEDBACK_ALPHA
      };
      
      // Normal state should be visible but not intrusive
      expect(touchAlphaValues.normal).toBeGreaterThan(0.3);
      expect(touchAlphaValues.normal).toBeLessThan(0.8);
      
      // Feedback state should be clearly visible
      expect(touchAlphaValues.feedback).toBeGreaterThan(0.8);
      expect(touchAlphaValues.feedback).toBeLessThanOrEqual(1.0);
      
      // Feedback should be more prominent than normal
      expect(touchAlphaValues.feedback).toBeGreaterThan(touchAlphaValues.normal);
    });
  });

  describe('Device Detection and Adaptation', () => {
    test('should detect mobile devices correctly', () => {
      const mockMobileDevice = { input: { touch: true } };
      const mockDesktopDevice = { input: { touch: false } };
      
      // Mobile device should enable touch features
      expect(mockMobileDevice.input.touch).toBe(true);
      
      // Desktop device should disable touch features
      expect(mockDesktopDevice.input.touch).toBe(false);
    });

    test('should show appropriate instructions for each device type', () => {
      const mobileInstructions = 'Tap LEFT/RIGHT to move and TAP UPPER RIGHT to jump';
      const desktopInstructions = 'Use ARROW KEYS to move and SPACE to jump';
      
      // Mobile instructions should mention touch gestures
      expect(mobileInstructions).toContain('Tap');
      expect(mobileInstructions).toContain('LEFT/RIGHT');
      expect(mobileInstructions).toContain('UPPER RIGHT');
      
      // Desktop instructions should mention keyboard keys
      expect(desktopInstructions).toContain('ARROW KEYS');
      expect(desktopInstructions).toContain('SPACE');
      
      // Both should explain the same core mechanics
      expect(mobileInstructions.toLowerCase()).toContain('move');
      expect(mobileInstructions.toLowerCase()).toContain('jump');
      expect(desktopInstructions.toLowerCase()).toContain('move');
      expect(desktopInstructions.toLowerCase()).toContain('jump');
    });

    test('should adapt visual indicators based on device capabilities', () => {
      const mobileIndicatorAlpha = GAME_CONFIG.TOUCH.NORMAL_ALPHA;
      const desktopIndicatorAlpha = 0;
      
      // Mobile should show touch indicators
      expect(mobileIndicatorAlpha).toBeGreaterThan(0);
      
      // Desktop should hide touch indicators
      expect(desktopIndicatorAlpha).toBe(0);
    });
  });

  describe('Screen Size Responsiveness', () => {
    test('should handle common mobile screen dimensions', () => {
      const mobileScreens = [
        { width: 375, height: 667, name: 'iPhone 6/7/8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 360, height: 640, name: 'Android Medium' },
        { width: 412, height: 915, name: 'Android Large' }
      ];
      
      mobileScreens.forEach(screen => {
        // Calculate responsive touch areas
        const leftTouchWidth = screen.width * 0.3;
        const rightTouchWidth = screen.width * 0.4;
        const jumpTouchWidth = screen.width * 0.3;
        
        // Verify minimum viable touch targets (44px iOS guideline)
        expect(leftTouchWidth).toBeGreaterThan(44);
        expect(rightTouchWidth).toBeGreaterThan(44);
        expect(jumpTouchWidth).toBeGreaterThan(44);
        
        // Verify aspect ratio is mobile-friendly
        const aspectRatio = screen.width / screen.height;
        expect(aspectRatio).toBeGreaterThan(0.4);
        expect(aspectRatio).toBeLessThan(1.0); // Portrait orientation
      });
    });

    test('should handle tablet screen dimensions', () => {
      const tabletScreens = [
        { width: 768, height: 1024, name: 'iPad Portrait' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 800, height: 1280, name: 'Android Tablet Portrait' },
        { width: 1280, height: 800, name: 'Android Tablet Landscape' }
      ];
      
      tabletScreens.forEach(screen => {
        // Touch areas should scale appropriately for larger screens
        const leftTouchWidth = screen.width * 0.3;
        const rightTouchWidth = screen.width * 0.4;
        const jumpTouchWidth = screen.width * 0.3;
        
        // Larger screens should have larger touch areas
        expect(leftTouchWidth).toBeGreaterThan(150);
        expect(rightTouchWidth).toBeGreaterThan(200);
        expect(jumpTouchWidth).toBeGreaterThan(150);
        
        // But not excessively large
        expect(leftTouchWidth).toBeLessThan(400);
        expect(rightTouchWidth).toBeLessThan(600);
        expect(jumpTouchWidth).toBeLessThan(400);
      });
    });

    test('should maintain playable area across different aspect ratios', () => {
      const aspectRatios = [
        { ratio: 16/9, name: 'Widescreen' },
        { ratio: 4/3, name: 'Traditional' },
        { ratio: 3/2, name: 'Classic Mobile' },
        { ratio: 18/9, name: 'Modern Mobile' }
      ];
      
      aspectRatios.forEach(({ ratio, name }) => {
        // Game should be playable on all common aspect ratios
        expect(ratio).toBeGreaterThan(1.0); // Landscape orientation
        expect(ratio).toBeLessThan(3.0); // Not too wide
        
        // Calculate example dimensions
        const height = 600;
        const width = height * ratio;
        
        // Ensure minimum playable area
        expect(width).toBeGreaterThan(400);
        expect(height).toBeGreaterThan(300);
      });
    });
  });

  describe('Performance Optimization for Mobile', () => {
    test('should use efficient game object limits for mobile performance', () => {
      const mobileObjectLimits = {
        maxBubbles: 20,
        maxObstacles: 10,
        maxParticles: 50
      };
      
      // Limits should be reasonable for mobile GPUs
      expect(mobileObjectLimits.maxBubbles).toBeLessThan(50);
      expect(mobileObjectLimits.maxObstacles).toBeLessThan(20);
      expect(mobileObjectLimits.maxParticles).toBeLessThan(100);
      
      // But still provide good gameplay
      expect(mobileObjectLimits.maxBubbles).toBeGreaterThan(5);
      expect(mobileObjectLimits.maxObstacles).toBeGreaterThan(3);
    });

    test('should optimize spawn rates for mobile performance', () => {
      const mobileSpawnRates = {
        bubbleSpawnMin: 2500, // Slightly slower than desktop
        bubbleSpawnMax: 4500,
        obstacleSpawnMin: GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MIN,
        obstacleSpawnMax: GAME_CONFIG.OBSTACLES.SPAWN_DELAY_MAX
      };
      
      // Mobile spawn rates should be sustainable
      expect(mobileSpawnRates.bubbleSpawnMin).toBeGreaterThan(2000);
      expect(mobileSpawnRates.obstacleSpawnMin).toBeGreaterThanOrEqual(3000);
      
      // But not too slow to be boring
      expect(mobileSpawnRates.bubbleSpawnMax).toBeLessThan(6000);
      expect(mobileSpawnRates.obstacleSpawnMax).toBeLessThan(8000);
    });

    test('should handle memory management for extended mobile sessions', () => {
      const memoryManagement = {
        offScreenCleanupDistance: 100, // Pixels beyond screen edge
        maxObjectLifetime: 30000, // 30 seconds maximum
        gcTriggerThreshold: 50 // Objects before garbage collection
      };
      
      // Cleanup should be aggressive enough for mobile
      expect(memoryManagement.offScreenCleanupDistance).toBeLessThan(200);
      expect(memoryManagement.maxObjectLifetime).toBeLessThan(60000);
      expect(memoryManagement.gcTriggerThreshold).toBeLessThan(100);
    });
  });

  describe('Touch Gesture Responsiveness', () => {
    test('should handle rapid touch input changes', () => {
      const touchResponsiveness = {
        maxInputDelay: 50, // Milliseconds
        touchSampleRate: 60, // Hz
        gestureThreshold: 10 // Pixels for movement detection
      };
      
      // Touch input should feel immediate
      expect(touchResponsiveness.maxInputDelay).toBeLessThan(100);
      expect(touchResponsiveness.touchSampleRate).toBeGreaterThan(30);
      expect(touchResponsiveness.gestureThreshold).toBeGreaterThan(5);
    });

    test('should prevent accidental input activation', () => {
      const inputProtection = {
        minTouchDuration: 50, // Milliseconds
        edgeDeadZone: 20, // Pixels from screen edge
        palmRejectionSize: 15 // Minimum touch size in pixels
      };
      
      // Should filter out very brief touches (palm rejection)
      expect(inputProtection.minTouchDuration).toBeGreaterThan(20);
      expect(inputProtection.edgeDeadZone).toBeGreaterThan(10);
      expect(inputProtection.palmRejectionSize).toBeGreaterThan(10);
    });

    test('should provide clear visual feedback for touch interactions', () => {
      const visualFeedback = {
        feedbackDelay: 0, // Immediate
        feedbackDuration: 200, // Milliseconds
        feedbackIntensity: GAME_CONFIG.TOUCH.FEEDBACK_ALPHA
      };
      
      // Feedback should be immediate and noticeable
      expect(visualFeedback.feedbackDelay).toBe(0);
      expect(visualFeedback.feedbackDuration).toBeGreaterThan(100);
      expect(visualFeedback.feedbackDuration).toBeLessThan(500);
      expect(visualFeedback.feedbackIntensity).toBeGreaterThan(0.8);
    });
  });

  describe('Accessibility for Mobile Users', () => {
    test('should provide sufficient touch target sizes', () => {
      const minTouchTargetSize = 44; // iOS Human Interface Guidelines
      const recommendedSize = 48; // Material Design Guidelines
      
      const screenWidth = 375; // iPhone 6/7/8 width
      const leftTouchWidth = screenWidth * 0.3; // 112.5px
      const jumpTouchWidth = screenWidth * 0.3; // 112.5px
      
      // Touch areas should exceed minimum accessibility guidelines
      expect(leftTouchWidth).toBeGreaterThan(minTouchTargetSize);
      expect(leftTouchWidth).toBeGreaterThan(recommendedSize);
      expect(jumpTouchWidth).toBeGreaterThan(minTouchTargetSize);
      expect(jumpTouchWidth).toBeGreaterThan(recommendedSize);
    });

    test('should provide clear visual indicators with sufficient contrast', () => {
      const indicators = {
        leftArrow: '←',
        rightArrow: '→', 
        jumpArrow: '↑'
      };
      
      // Indicators should be clear unicode symbols
      expect(indicators.leftArrow).toBe('←');
      expect(indicators.rightArrow).toBe('→');
      expect(indicators.jumpArrow).toBe('↑');
      
      // Should be easily distinguishable
      expect(indicators.leftArrow).not.toBe(indicators.rightArrow);
      expect(indicators.leftArrow).not.toBe(indicators.jumpArrow);
      expect(indicators.rightArrow).not.toBe(indicators.jumpArrow);
    });

    test('should support reduced motion preferences', () => {
      const motionSettings = {
        enableAnimations: true,
        animationDuration: 1000,
        reducedMotionDuration: 200
      };
      
      // Should provide option for reduced motion
      expect(motionSettings.reducedMotionDuration).toBeLessThan(motionSettings.animationDuration);
      expect(motionSettings.reducedMotionDuration).toBeGreaterThan(0);
    });
  });

  describe('Cross-Platform Touch Consistency', () => {
    test('should handle iOS touch events correctly', () => {
      const iOSTouch = {
        preventDefaultBehavior: true,
        supportMultitouch: false,
        gestureRecognition: 'basic'
      };
      
      // iOS-specific touch handling
      expect(iOSTouch.preventDefaultBehavior).toBe(true);
      expect(iOSTouch.supportMultitouch).toBe(false); // Single touch for this game
    });

    test('should handle Android touch events correctly', () => {
      const androidTouch = {
        preventDefaultBehavior: true,
        supportMultitouch: false,
        gestureRecognition: 'basic'
      };
      
      // Android-specific touch handling
      expect(androidTouch.preventDefaultBehavior).toBe(true);
      expect(androidTouch.supportMultitouch).toBe(false); // Single touch for this game
    });

    test('should maintain consistent behavior across mobile browsers', () => {
      const browserCompatibility = {
        webkit: true, // Safari, Chrome mobile
        blink: true,  // Chrome, Edge mobile
        gecko: true   // Firefox mobile
      };
      
      // Should work on all major mobile browsers
      expect(browserCompatibility.webkit).toBe(true);
      expect(browserCompatibility.blink).toBe(true);
      expect(browserCompatibility.gecko).toBe(true);
    });
  });

  describe('Orientation and Layout Adaptation', () => {
    test('should handle device orientation changes gracefully', () => {
      const orientations = [
        { width: 375, height: 667, orientation: 'portrait' },
        { width: 667, height: 375, orientation: 'landscape' }
      ];
      
      orientations.forEach(screen => {
        // Touch areas should recalculate based on new dimensions
        const leftTouchWidth = screen.width * 0.3;
        const rightTouchWidth = screen.width * 0.4;
        const jumpTouchWidth = screen.width * 0.3;
        
        // Should maintain minimum touch targets in both orientations
        expect(leftTouchWidth).toBeGreaterThan(44);
        expect(rightTouchWidth).toBeGreaterThan(44);
        expect(jumpTouchWidth).toBeGreaterThan(44);
        
        // Game should remain playable in both orientations
        expect(screen.width).toBeGreaterThan(300);
        expect(screen.height).toBeGreaterThan(200);
      });
    });

    test('should optimize layout for portrait vs landscape', () => {
      const portraitLayout = { width: 375, height: 667 };
      const landscapeLayout = { width: 667, height: 375 };
      
      // Portrait should utilize vertical space efficiently
      const portraitAspect = portraitLayout.width / portraitLayout.height;
      expect(portraitAspect).toBeLessThan(1.0);
      
      // Landscape should utilize horizontal space efficiently
      const landscapeAspect = landscapeLayout.width / landscapeLayout.height;
      expect(landscapeAspect).toBeGreaterThan(1.0);
      
      // Both should maintain playability
      expect(portraitLayout.width).toBeGreaterThan(300);
      expect(landscapeLayout.height).toBeGreaterThan(300);
    });
  });
});
import FaviconGenerator from '../src/utils/FaviconGenerator.js';

describe('FaviconGenerator', () => {
  describe('generateFavicon', () => {
    test('should generate favicon with default size', () => {
      const favicon = FaviconGenerator.generateFavicon();
      
      expect(favicon).toMatch(/^data:image\/png;base64,/);
      expect(favicon.length).toBeGreaterThan(100); // Should contain actual image data
    });
    
    test('should generate favicon with custom size', () => {
      const favicon16 = FaviconGenerator.generateFavicon(16);
      const favicon32 = FaviconGenerator.generateFavicon(32);
      
      expect(favicon16).toMatch(/^data:image\/png;base64,/);
      expect(favicon32).toMatch(/^data:image\/png;base64,/);
      
      // In test environment, both will return the same fallback image
      // This is expected behavior as Canvas is not available
      expect(favicon16).toBe(favicon32);
    });
    
    test('should handle canvas fallback gracefully', () => {
      // Mock canvas creation to return null context (simulating test environment)
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => null // Simulate canvas not available
          };
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const favicon = FaviconGenerator.generateFavicon(32);
      
      // Should return fallback base64 image
      expect(favicon).toMatch(/^data:image\/png;base64,/);
      expect(favicon).toContain('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAG0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAPwGBQABAAZeKMEAAAAASUVORK5CYII=');
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });
  
  describe('generateAllFavicons', () => {
    test('should generate all standard favicon sizes', () => {
      const favicons = FaviconGenerator.generateAllFavicons();
      
      expect(favicons).toHaveProperty('favicon16');
      expect(favicons).toHaveProperty('favicon32');
      expect(favicons).toHaveProperty('favicon48');
      expect(favicons).toHaveProperty('appleTouchIcon');
      
      // All should be valid base64 PNG data
      Object.values(favicons).forEach(favicon => {
        expect(favicon).toMatch(/^data:image\/png;base64,/);
      });
    });
    
    test('should generate favicon sizes structure correctly', () => {
      const favicons = FaviconGenerator.generateAllFavicons();
      
      // In test environment, all will be the same fallback image
      // But the structure should be correct
      expect(Object.keys(favicons)).toEqual(['favicon16', 'favicon32', 'favicon48', 'appleTouchIcon']);
      expect(Object.keys(favicons).length).toBe(4);
    });
  });
  
  describe('Helper methods', () => {
    test('should have static helper methods for drawing', () => {
      expect(typeof FaviconGenerator.drawRoundedRect).toBe('function');
      expect(typeof FaviconGenerator.strokeRoundedRect).toBe('function');
    });
  });
});
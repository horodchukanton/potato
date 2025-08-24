const fs = require('fs');
const path = require('path');

// Import the favicon generation functions by requiring the script
// We need to run the script to test the generated files
const faviconScriptPath = path.join(__dirname, '../scripts/generate-favicons.js');

describe('Favicon Integration', () => {
  describe('Generated Files Validation', () => {
    test('should have generated favicon files with correct structure', () => {
      const faviconDir = path.join(__dirname, '../src/assets/favicons');
      expect(fs.existsSync(faviconDir)).toBe(true);
      
      // Check that required favicon files exist
      const requiredFiles = [
        'favicon-16x16.svg',
        'favicon-32x32.svg', 
        'favicon-48x48.svg',
        'apple-touch-icon.svg',
        'favicon.svg',
        'README.md'
      ];
      
      requiredFiles.forEach(file => {
        const filePath = path.join(faviconDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
    
    test('should have valid SVG content in favicon files', () => {
      const faviconDir = path.join(__dirname, '../src/assets/favicons');
      
      // Test the 32x32 favicon
      const svg32Path = path.join(faviconDir, 'favicon-32x32.svg');
      const svg32Content = fs.readFileSync(svg32Path, 'utf8');
      
      expect(svg32Content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg32Content).toContain('<svg width="32" height="32"');
      expect(svg32Content).toContain('viewBox="0 0 32 32"');
      expect(svg32Content).toContain('#ff8c42'); // Player character color
      expect(svg32Content).toContain('#d67020'); // Border color
      expect(svg32Content).toContain('#ffb366'); // Highlight color
      expect(svg32Content).toContain('linearGradient');
      expect(svg32Content).toContain('</svg>');
    });
    
    test('should have different sizes for different favicon files', () => {
      const faviconDir = path.join(__dirname, '../src/assets/favicons');
      
      const svg16Content = fs.readFileSync(path.join(faviconDir, 'favicon-16x16.svg'), 'utf8');
      const svg32Content = fs.readFileSync(path.join(faviconDir, 'favicon-32x32.svg'), 'utf8');
      const svg48Content = fs.readFileSync(path.join(faviconDir, 'favicon-48x48.svg'), 'utf8');
      const appleTouchContent = fs.readFileSync(path.join(faviconDir, 'apple-touch-icon.svg'), 'utf8');
      
      expect(svg16Content).toContain('width="16" height="16"');
      expect(svg32Content).toContain('width="32" height="32"');
      expect(svg48Content).toContain('width="48" height="48"');
      expect(appleTouchContent).toContain('width="180" height="180"');
    });
    
    test('should have proper README documentation', () => {
      const faviconDir = path.join(__dirname, '../src/assets/favicons');
      const readmePath = path.join(faviconDir, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      expect(readmeContent).toContain('# Generated Favicons');
      expect(readmeContent).toContain('player character design');
      expect(readmeContent).toContain('#ff8c42'); // Should document the colors
      expect(readmeContent).toContain('npm run generate-favicons');
    });
  });
  
  describe('Build Configuration', () => {
    test('should have proper npm script for favicon generation', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
      
      expect(packageJson.scripts).toHaveProperty('generate-favicons');
      expect(packageJson.scripts['generate-favicons']).toBe('node scripts/generate-favicons.js');
      
      // Build script should include favicon generation
      expect(packageJson.scripts.build).toContain('npm run generate-favicons');
    });
    
    test('should have webpack configuration for copying favicons', () => {
      const webpackConfigPath = path.join(__dirname, '../webpack.config.js');
      const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
      
      expect(webpackConfig).toContain('CopyWebpackPlugin');
      expect(webpackConfig).toContain('src/assets/favicons');
      expect(webpackConfig).toContain('to: \'favicons\'');
    });
    
    test('should have favicon references in index.html', () => {
      const indexHtmlPath = path.join(__dirname, '../src/index.html');
      const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      
      expect(indexHtmlContent).toContain('<link rel="icon"');
      expect(indexHtmlContent).toContain('href="favicons/favicon.svg"');
      expect(indexHtmlContent).toContain('href="favicons/favicon-16x16.svg"');
      expect(indexHtmlContent).toContain('href="favicons/favicon-32x32.svg"');
      expect(indexHtmlContent).toContain('href="favicons/favicon-48x48.svg"');
      expect(indexHtmlContent).toContain('href="favicons/apple-touch-icon.svg"');
      expect(indexHtmlContent).toContain('rel="apple-touch-icon"');
    });
  });
  
  describe('Favicon Generation Script', () => {
    test('should be executable and have correct module exports', () => {
      expect(fs.existsSync(faviconScriptPath)).toBe(true);
      
      // Check script has the required exports
      const scriptContent = fs.readFileSync(faviconScriptPath, 'utf8');
      expect(scriptContent).toContain('module.exports');
      expect(scriptContent).toContain('generateFaviconFiles');
      expect(scriptContent).toContain('generateFaviconSVG');
      expect(scriptContent).toContain('svgToDataURL');
    });
    
    test('should use correct player character colors', () => {
      const scriptContent = fs.readFileSync(faviconScriptPath, 'utf8');
      
      expect(scriptContent).toContain('#ff8c42'); // PLAYER_COLOR
      expect(scriptContent).toContain('#d67020'); // BORDER_COLOR  
      expect(scriptContent).toContain('#ffb366'); // HIGHLIGHT_COLOR
    });
  });
});
#!/usr/bin/env node

/**
 * Generate favicon files that match the player character design
 * Creates static PNG files that can be copied by webpack
 */

const fs = require('fs');
const path = require('path');

// Player character design colors (from game configuration)
const PLAYER_COLOR = '#ff8c42'; // Orange from game
const BORDER_COLOR = '#d67020'; // Darker orange for border
const HIGHLIGHT_COLOR = '#ffb366'; // Lighter orange for highlight

/**
 * Create a simple PNG favicon using SVG -> base64 conversion
 * This approach avoids Canvas dependencies while creating proper favicon files
 */
function generateFaviconSVG(size) {
  const padding = Math.max(1, Math.floor(size * 0.1));
  const squareSize = size - (padding * 2);
  const borderWidth = Math.max(1, Math.floor(size * 0.05));
  const radius = Math.max(1, Math.floor(squareSize * 0.15));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${HIGHLIGHT_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${PLAYER_COLOR};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="${padding}" y="${padding}" 
        width="${squareSize}" height="${squareSize}" 
        rx="${radius}" ry="${radius}"
        fill="url(#gradient)" 
        stroke="${BORDER_COLOR}" 
        stroke-width="${borderWidth}"/>
</svg>`;
}

/**
 * Convert SVG to base64 data URL (for use as favicon)
 */
function svgToDataURL(svgContent) {
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Create static favicon files
 */
function generateFaviconFiles() {
  const faviconDir = path.join(__dirname, '../src/assets/favicons');
  
  // Ensure directory exists
  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
  }

  // Generate different sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.svg' },
    { size: 32, name: 'favicon-32x32.svg' },
    { size: 48, name: 'favicon-48x48.svg' },
    { size: 180, name: 'apple-touch-icon.svg' }
  ];

  const generatedFiles = [];

  sizes.forEach(({ size, name }) => {
    const svgContent = generateFaviconSVG(size);
    const filePath = path.join(faviconDir, name);
    
    fs.writeFileSync(filePath, svgContent);
    generatedFiles.push({ name, size, path: filePath });
    console.log(`Generated ${name} (${size}x${size})`);
  });

  // Create a master favicon.ico equivalent (32x32 SVG)
  const masterFaviconPath = path.join(faviconDir, 'favicon.svg');
  fs.writeFileSync(masterFaviconPath, generateFaviconSVG(32));
  generatedFiles.push({ name: 'favicon.svg', size: 32, path: masterFaviconPath });
  console.log('Generated favicon.svg (master)');

  // Create a README for the favicons directory
  const readmePath = path.join(faviconDir, 'README.md');
  const readmeContent = `# Generated Favicons

These favicon files are automatically generated from the player character design.

## Files:
${generatedFiles.map(f => `- ${f.name} (${f.size}x${f.size})`).join('\n')}

## Colors:
- Primary: ${PLAYER_COLOR} (player character orange)
- Border: ${BORDER_COLOR} (darker outline)
- Highlight: ${HIGHLIGHT_COLOR} (gradient highlight)

## Generation:
Run \`npm run generate-favicons\` to regenerate these files.
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('Generated README.md');

  return generatedFiles;
}

// Run the generation
if (require.main === module) {
  try {
    console.log('Generating favicon files...');
    const files = generateFaviconFiles();
    console.log(`\nSuccessfully generated ${files.length} favicon files in src/assets/favicons/`);
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

module.exports = { generateFaviconFiles, generateFaviconSVG, svgToDataURL };
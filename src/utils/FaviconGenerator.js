/**
 * FaviconGenerator - Generates favicons based on the player character asset
 */
export default class FaviconGenerator {
  /**
   * Generate a favicon that matches the player character design
   * @param {number} size - Size of the favicon (16, 32, etc.)
   * @returns {string} Base64 data URL for the favicon
   */
  static generateFavicon(size = 32) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fallback for test environment that doesn't support canvas
    if (!ctx) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAG0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAPwGBQABAAZeKMEAAAAASUVORK5CYII=';
    }
    
    // Clear the canvas with transparent background
    ctx.clearRect(0, 0, size, size);
    
    // Draw the orange square that represents the player character
    const padding = Math.max(1, Math.floor(size * 0.1)); // 10% padding
    const squareSize = size - (padding * 2);
    
    // Player character color (orange)
    ctx.fillStyle = '#ff8c42';
    
    // Draw rounded rectangle for a more polished look
    const radius = Math.max(1, Math.floor(squareSize * 0.15));
    this.drawRoundedRect(ctx, padding, padding, squareSize, squareSize, radius);
    
    // Add a subtle highlight to make it more visually appealing
    const gradient = ctx.createLinearGradient(padding, padding, padding + squareSize, padding + squareSize);
    gradient.addColorStop(0, '#ffb366');
    gradient.addColorStop(1, '#ff8c42');
    
    ctx.fillStyle = gradient;
    this.drawRoundedRect(ctx, padding, padding, squareSize, squareSize, radius);
    
    // Add a subtle border
    ctx.strokeStyle = '#d67020';
    ctx.lineWidth = Math.max(1, Math.floor(size * 0.05));
    this.strokeRoundedRect(ctx, padding, padding, squareSize, squareSize, radius);
    
    return canvas.toDataURL('image/png');
  }
  
  /**
   * Helper function to draw a rounded rectangle
   */
  static drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Helper function to stroke a rounded rectangle
   */
  static strokeRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  }
  
  /**
   * Generate all standard favicon sizes
   * @returns {Object} Object containing all favicon sizes and their data URLs
   */
  static generateAllFavicons() {
    return {
      favicon16: this.generateFavicon(16),
      favicon32: this.generateFavicon(32),
      favicon48: this.generateFavicon(48),
      appleTouchIcon: this.generateFavicon(180), // Apple touch icon
    };
  }
}
import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS } from '../config.js';

/**
 * PreloadScene handles loading all game assets
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  /**
   * Preload all game assets
   */
  preload() {
    // Display loading progress
    this.createLoadingBar();

    // Load custom sprite assets designed for game elements
    this.createPlaceholderAssets();

    // Load procedural audio assets
    this.createAudioAssets();
  }

  /**
   * Create custom sprite assets for game elements
   */
  createPlaceholderAssets() {
    // Load custom sprite assets
    this.load.image(ASSET_KEYS.PLAYER, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAwCAYAAABwrHhvAAABWElEQVR4nO2XMQ7CMAxFDWLryD16C1SGLpyEpQxwABhg4SQsDFTcgoVTMDKXKSVKndhOoqaV+iWkVgn+r3bipgCTAvU4Zk1S8+YNTRIIZa5+vUKY5iEQM46ZH+Zf68PX6rPgBCg2X2/z+pY5x+fekSNpAkgOwFqE1EIKEbkNAQDOq2W7FYvtnpxfX0/t9e75cXqQJZCam/P0/3sBSM2l850Ail5qbkK4smAFCDXnQrB2gVJeVu31634Rj2NCM4A9vR5ceu/KQvJGNB4As6bSe5s6XSrW6sekOqTeHcdTgglgMAB5WXWaDmcsGkBsiQHU/ra1Xu7+VxK9jExJ040JPS5xm5Hk7Yc1IYDADEjTjWl8i7AXAFUn/XgdIlv9rQB9ygoQKwuup3cCxICgzEkALFjs+SSATs8NKvk2ZH2cAnSP1FiXNAEpcxGADQQTx9gbwAUiMZ40GP0AKv218k3Prw8AAAAASUVORK5CYII=');
    this.load.image(ASSET_KEYS.BUBBLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABI0lEQVR4nO2XQQ6CMBBFq3HnBVwbNm5NiEfwIiZcg2uQeBGPYEjcuiGsuQBrXU1ShunMtAxion8FtOW/zgy0de7XtUoZdChvr1DbszxHvVPdmTOdAqMCwObb3f4e6tt37SkGgm30jTlTDUwIJAhAmddF9oBnedUcLSBIAGzuG2NpQDiINTcwJeyx7xkBwOypsFOS2jEELugBADa3FgXBpuATEgGkItN+DSLA3OEH4TRsNINglin/AUkqAGtTX99fhH+AuTVYGKw+xbrIrnCdV83Fb4OFCRYl8wj45tQ91uIpGABAWPC2yko4/CMACwicc7inzJ0T/oR9155SCjJUeJTIGvApp6ZD2hMGi9ACYtKu2Ndi5wIOQiOzk1EMTOzZcHG9AaIzqC0dxtzZAAAAAElFTkSuQmCC');
    this.load.image(ASSET_KEYS.OBSTACLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQCAYAAAAOYsW+AAAB40lEQVR4nO2Z2W0DMQxEmSCFqLQtbUtTJ8kXDVoRb4pYBJlPw9bTUNdIBviXQ9d1fUd/+1EFve/b1ZYbTIFjDAAAmHO64S7wDkrl6YAJrAF3cK0Dn5XQ9TvS5PuqAq5w6nwn1jGWyQtdxblWS631nJNWchHsXZsS3AVGRV1Tra5VcKVrCjc5Bsi53pXcBM66pkLXZscAta7N4KzrdR93OaYNZOUCV46165BARV3TjrOHBP1yJuIA7DsaWk7Zg8MMXo/IOWd6kqmTRTqXES5VgItD6hhzUPqZpQOrRDC61RqMjDk7xtmZHAJn8lYYXA3FNsQg0OF0C+6C/gLjWqs6gczgTj0HXFFuy15u3jKtQADb5CwpNTocY4h7upqrreXWgJJCpY6cRmkwOsxKvR+v5a7a1VrW8S6FPGcDoTq5dx93zIW9Z5baGvbKwVlJT4xqymwLe106BtZecsVcfTL0PafUFW4tD+as49MRlwVXXcA5vZWCK3MkcWjlNiWQzAWc0wtsmVSVHQiFvYoOpNaxFGu5e3EJOKMXuPOK+gbu1lGwNM5/07EZXPkQ7gKjKme26Z3rhDgTbWPcepMI5eoqKKdjz01reyq4UtLyFM9jznXkP4hVoQ3D8nrfuRkBwPm/FNL6AZ1ELNWc8SQ8AAAAAElFTkSuQmCC');
    this.load.image(ASSET_KEYS.BACKGROUND, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAB2ElEQVR4nO2aO3LCMBCGtQxH8EU8qVNT5xQByryukEli3AWbU1BTUxMdJL5D0uAZxmPr5ccvefXNuNJI7H54V9iC3n9+/wRjFugA0EQB6ADQLAkdARj2dwB7AexLYIkOwJa3NLlXjX/K6myzHn0E8kNIl3gTUxELEkL4ftkmL65zTNb2vgm+OiRvM9d7AWPjfQlklk3tlkxW5+BLQAg3CaZz6MtxF3hJkwdNAEeXdQ0+V1nXtrIosxTwrEm8yW4kEUNhVQK2ybvOmRJjAX0S8VlCEE1wTIy3wbxHLeeyOqK300G2QRcJfcRNAe0ct8EnTV37nngN5YE8DY5FbILoANCwfyXG/g5gLyCWADoANOwFxBJAB4AmCkAHgCb2AHQAaNgLiCWADgANewGxBNABoGEvwKgEtmmyUo3vZXUaKJ7JoW/Fa3Fd4k1CFNFZArbJu85B03o22CeRbZqs0Od9o50NzhHad/SAjeNdUAD6wCZN7lTjhawuXWOdAq4LW0mYOnld4k3aRFBhcDi61ogoAd/62jL5mrIhwUiAb7gmX3MrgX0T9P6fom3XQdHUdBxkdZnFNugioW0OlQH2gCaPmp6gkkWHGQjoQ7AlMBTsBcRXYugA0LAX8A8IDpymQV/R/AAAAABJRU5ErkJggg==');
  }

  /**
   * Create procedural audio assets using Web Audio API
   */
  createAudioAssets() {
    // Create simple procedural sounds using base64 encoded audio
    // These are minimal audio files to keep the bundle size small
    
    // Bubble collect sound - short pleasant chime
    const collectSoundData = this.generateSoundDataURL('collect', 0.2, [523.25, 659.25]);
    this.load.audio(ASSET_KEYS.COLLECT_SOUND, collectSoundData);
    
    // Jump sound - quick whoosh
    const jumpSoundData = this.generateSoundDataURL('jump', 0.15, [220, 440]);
    this.load.audio(ASSET_KEYS.JUMP_SOUND, jumpSoundData);
    
    // Obstacle hit sound - low thud
    const hitSoundData = this.generateSoundDataURL('hit', 0.3, [110, 80]);
    this.load.audio(ASSET_KEYS.OBSTACLE_HIT_SOUND, hitSoundData);
    
    // Background music - simple ambient loop
    const bgmSoundData = this.generateSoundDataURL('bgm', 2.0, [261.63, 329.63, 392.00]);
    this.load.audio(ASSET_KEYS.BACKGROUND_MUSIC, bgmSoundData);
  }

  /**
   * Generate a simple sound as a data URL
   * @param {string} type - Type of sound (collect, jump, hit, bgm)
   * @param {number} duration - Duration in seconds
   * @param {Array} frequencies - Array of frequencies to use
   * @returns {string} Data URL for the generated sound
   */
  generateSoundDataURL(type, duration, frequencies) {
    // Create a simple WAV file header and audio data
    const sampleRate = 22050; // Lower sample rate for smaller files
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate audio data based on type
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      switch (type) {
        case 'collect':
          // Pleasant chime with decay
          sample = Math.sin(2 * Math.PI * frequencies[0] * t) * Math.exp(-t * 8) * 0.3;
          if (frequencies[1]) {
            sample += Math.sin(2 * Math.PI * frequencies[1] * t) * Math.exp(-t * 6) * 0.2;
          }
          break;
          
        case 'jump':
          // Quick frequency sweep
          const sweepFreq = frequencies[0] + (frequencies[1] - frequencies[0]) * (t / duration);
          sample = Math.sin(2 * Math.PI * sweepFreq * t) * Math.exp(-t * 10) * 0.2;
          break;
          
        case 'hit':
          // Low thud with noise
          sample = (Math.random() - 0.5) * Math.exp(-t * 6) * 0.3;
          sample += Math.sin(2 * Math.PI * frequencies[0] * t) * Math.exp(-t * 4) * 0.2;
          break;
          
        case 'bgm':
          // Simple ambient chord progression
          for (let j = 0; j < frequencies.length; j++) {
            sample += Math.sin(2 * Math.PI * frequencies[j] * t) * 0.1 * Math.sin(Math.PI * t / duration);
          }
          break;
      }
      
      // Convert to 16-bit integer
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    // Convert to base64 data URL
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  /**
   * Create a simple loading progress bar
   */
  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Progress bar background
    const progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x444444);
    const progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x00ff00);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.width = 400 * value;
      progressBar.x = (width / 2 - 200) + (progressBar.width / 2);
    });

    this.load.on('complete', () => {
      loadingText.setText('Loading Complete!');
    });
  }

  /**
   * Start the main game scene after loading
   */
  create() {
    // Small delay to show loading complete message
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
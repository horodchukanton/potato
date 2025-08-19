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
   * Generate a beautiful cloud background pattern
   * @returns {string} Base64 data URL for cloud background
   */
  generateCloudBackground() {
    const width = 320;
    const height = 240;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fallback for test environment that doesn't support canvas
    if (!ctx) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAADwCAYAAABxLb1rAAAACXBIWXMAAAsTAAALEwEAmpwYAAABT0lEQVR4nO3BMQEAAADCoPVPbQhfcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AgRAAAAA7';
    }
    
    // Sky gradient background (light blue to white)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
    gradient.addColorStop(1, '#F0F8FF'); // Alice blue
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Generate fluffy white clouds with soft edges designed for seamless horizontal tiling
    const clouds = [
      // Main clouds distributed across the canvas
      { x: 40, y: 30, width: 80, height: 40, opacity: 0.8 },
      { x: 140, y: 20, width: 100, height: 50, opacity: 0.9 },
      { x: 220, y: 40, width: 70, height: 35, opacity: 0.7 },
      { x: 60, y: 80, width: 110, height: 60, opacity: 0.85 },
      { x: 180, y: 90, width: 80, height: 40, opacity: 0.75 },
      { x: 20, y: 140, width: 95, height: 50, opacity: 0.8 },
      { x: 140, y: 130, width: 85, height: 45, opacity: 0.9 },
      { x: 240, y: 150, width: 75, height: 40, opacity: 0.7 },
      
      // Edge clouds for seamless tiling - these clouds wrap around the edges
      { x: -40, y: 70, width: 90, height: 45, opacity: 0.8 }, // Starts off left edge
      { x: 280, y: 60, width: 80, height: 30, opacity: 0.8 }, // Extends past right edge (320-40=280, spans to 360)
      { x: -25, y: 160, width: 70, height: 35, opacity: 0.75 }, // Another edge wrapper
      { x: 290, y: 110, width: 60, height: 40, opacity: 0.7 } // Another edge wrapper
    ];
    
    // Helper function to draw a single cloud with all its puffs
    const drawCloud = (cloud, offsetX = 0) => {
      // Create fluffy cloud shapes with multiple overlapping ellipses
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = '#FFFFFF';
      
      // Main cloud body
      ctx.beginPath();
      ctx.ellipse(cloud.x + offsetX + cloud.width/2, cloud.y + cloud.height/2, 
                 cloud.width/2, cloud.height/2, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add smaller puffs for more realistic cloud shape
      const puffs = [
        { x: cloud.x + offsetX + cloud.width * 0.2, y: cloud.y + cloud.height * 0.3, w: cloud.width * 0.4, h: cloud.height * 0.4 },
        { x: cloud.x + offsetX + cloud.width * 0.6, y: cloud.y + cloud.height * 0.2, w: cloud.width * 0.5, h: cloud.height * 0.5 },
        { x: cloud.x + offsetX + cloud.width * 0.8, y: cloud.y + cloud.height * 0.6, w: cloud.width * 0.3, h: cloud.height * 0.3 },
        { x: cloud.x + offsetX + cloud.width * 0.1, y: cloud.y + cloud.height * 0.7, w: cloud.width * 0.35, h: cloud.height * 0.35 }
      ];
      
      puffs.forEach(puff => {
        ctx.beginPath();
        ctx.ellipse(puff.x, puff.y, puff.w/2, puff.h/2, 0, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    clouds.forEach(cloud => {
      // Draw the main cloud
      drawCloud(cloud);
      
      // For seamless tiling, also draw clouds that extend beyond canvas boundaries
      // If cloud starts before left edge, draw it again on the right side
      if (cloud.x < 0) {
        drawCloud(cloud, width);
      }
      
      // If cloud extends past right edge, draw it again on the left side  
      if (cloud.x + cloud.width > width) {
        drawCloud(cloud, -width);
      }
    });
    
    ctx.globalAlpha = 1.0;
    
    return canvas.toDataURL();
  }

  /**
   * Create custom sprite assets for game elements
   */
  createPlaceholderAssets() {
    // Load custom sprite assets
    this.load.image(ASSET_KEYS.PLAYER, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAwCAYAAABwrHhvAAABWElEQVR4nO2XMQ7CMAxFDWLryD16C1SGLpyEpQxwABhg4SQsDFTcgoVTMDKXKSVKndhOoqaV+iWkVgn+r3bipgCTAvU4Zk1S8+YNTRIIZa5+vUKY5iEQM46ZH+Zf68PX6rPgBCg2X2/z+pY5x+fekSNpAkgOwFqE1EIKEbkNAQDOq2W7FYvtnpxfX0/t9e75cXqQJZCam/P0/3sBSM2l850Ail5qbkK4smAFCDXnQrB2gVJeVu31634Rj2NCM4A9vR5ceu/KQvJGNB4As6bSe5s6XSrW6sekOqTeHcdTgglgMAB5WXWaDmcsGkBsiQHU/ra1Xu7+VxK9jExJ040JPS5xm5Hk7Yc1IYDADEjTjWl8i7AXAFUn/XgdIlv9rQB9ygoQKwuup3cCxICgzEkALFjs+SSATs8NKvk2ZH2cAnSP1FiXNAEpcxGADQQTx9gbwAUiMZ40GP0AKv218k3Prw8AAAAASUVORK5CYII=');
    this.load.image(ASSET_KEYS.BUBBLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABI0lEQVR4nO2XQQ6CMBBFq3HnBVwbNm5NiEfwIiZcg2uQeBGPYEjcuiGsuQBrXU1ShunMtAxion8FtOW/zgy0de7XtUoZdChvr1DbszxHvVPdmTOdAqMCwObb3f4e6tt37SkGgm30jTlTDUwIJAhAmddF9oBnedUcLSBIAGzuG2NpQDiINTcwJeyx7xkBwOypsFOS2jEELugBADa3FgXBpuATEgGkItN+DSLA3OEH4TRsNINglin/AUkqAGtTX99fhH+AuTVYGKw+xbrIrnCdV83Fb4OFCRYl8wj45tQ91uIpGABAWPC2yko4/CMACwicc7inzJ0T/oR9155SCjJUeJTIGvApp6ZD2hMGi9ACYtKu2Ndi5wIOQiOzk1EMTOzZcHG9AaIzqC0dxtzZAAAAAElFTkSuQmCC');
    this.load.image(ASSET_KEYS.OBSTACLE, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQCAYAAAAOYsW+AAAB40lEQVR4nO2Z2W0DMQxEmSCFqLQtbUtTJ8kXDVoRb4pYBJlPw9bTUNdIBviXQ9d1fUd/+1EFve/b1ZYbTIFjDAAAmHO64S7wDkrl6YAJrAF3cK0Dn5XQ9TvS5PuqAq5w6nwn1jGWyQtdxblWS631nJNWchHsXZsS3AVGRV1Tra5VcKVrCjc5Bsi53pXcBM66pkLXZscAta7N4KzrdR93OaYNZOUCV46165BARV3TjrOHBP1yJuIA7DsaWk7Zg8MMXo/IOWd6kqmTRTqXES5VgItD6hhzUPqZpQOrRDC61RqMjDk7xtmZHAJn8lYYXA3FNsQg0OF0C+6C/gLjWqs6gczgTj0HXFFuy15u3jKtQADb5CwpNTocY4h7upqrreXWgJJCpY6cRmkwOsxKvR+v5a7a1VrW8S6FPGcDoTq5dx93zIW9Z5baGvbKwVlJT4xqymwLe106BtZecsVcfTL0PafUFW4tD+as49MRlwVXXcA5vZWCK3MkcWjlNiWQzAWc0wtsmVSVHQiFvYoOpNaxFGu5e3EJOKMXuPOK+gbu1lGwNM5/07EZXPkQ7gKjKme26Z3rhDgTbWPcepMI5eoqKKdjz01reyq4UtLyFM9jznXkP4hVoQ3D8nrfuRkBwPm/FNL6AZ1ELNWc8SQ8AAAAAElFTkSuQmCC');
    this.load.image(ASSET_KEYS.BACKGROUND, this.generateCloudBackground());
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
              // --- Parameters ---
              const bpm = 120;
              const beat = 60 / bpm;
              const bar = beat * 4;

              // --- Lead Melody (arp) ---
              const melody = [261.63, 293.66, 329.63, 392.00, 329.63, 293.66]; // simple arp
              const noteLength = duration / melody.length;
              const currentNoteIndex = Math.floor(t / noteLength) % melody.length;
              const noteFreq = melody[currentNoteIndex];
              const squareWave = Math.sin(2 * Math.PI * noteFreq * t) > 0 ? 1 : -1;
              let lead = squareWave * 0.12;

              // --- Bassline (syncopated) ---
              const bassPattern = [65.41, 65.41, 98.00, 82.41]; // C2–C2–G2–E2
              const bassIndex = Math.floor(t / (beat / 2)) % bassPattern.length; // 8th notes
              const bassFreq = bassPattern[bassIndex];
              const bassSquare = Math.sin(2 * Math.PI * bassFreq * t) > 0 ? 1 : -1;
              let bass = bassSquare * 0.12;

              // --- Extended Chord Sequence (16 bars, Nintendo-like) ---
              // Inspired by Mario overworld / Zelda overworld style
              const chords = [
                  [261.63, 329.63, 392.0],   // C major (I)
                  [329.63, 392.0, 493.88],   // E minor (iii)
                  [293.66, 370.0, 440.0],    // D minor (ii)
                  [196.0, 246.94, 392.0],    // G major (V)

                  [174.61, 220.0, 349.23],   // F major (IV)
                  [220.0, 261.63, 329.63],   // A minor (vi)
                  [196.0, 246.94, 392.0],    // G major (V)
                  [261.63, 329.63, 392.0],   // C major (I)

                  [261.63, 329.63, 392.0],   // C major (I)
                  [293.66, 370.0, 440.0],    // D minor (ii)
                  [174.61, 220.0, 349.23],   // F major (IV)
                  [196.0, 246.94, 392.0],    // G major (V)

                  [220.0, 261.63, 329.63],   // A minor (vi)
                  [174.61, 220.0, 349.23],   // F major (IV)
                  [196.0, 246.94, 392.0],    // G major (V)
                  [261.63, 329.63, 392.0]    // C major (I) — resolution
              ];
              const chordIndex = Math.floor(t / bar) % chords.length;
              const chord = chords[chordIndex];

              // Rhythmic chord stabs
              let pad = 0;
              const stabPos = (t % bar) / bar;
              const stabActive = (stabPos < 0.25 || (stabPos > 0.5 && stabPos < 0.75));
              if (stabActive) {
                  const stabEnv = Math.exp(-((t % (bar / 2)) * 6));
                  for (let f of chord) {
                      pad += Math.sin(2 * Math.PI * f * t) * 0.07 * stabEnv;
                  }
              }

              // --- Drums ---
              let drums = 0;
              const beatPos = (t % beat) / beat;
              if (Math.floor(t / beat) % 2 === 0 && beatPos < 0.1) {
                  drums += Math.sin(2 * Math.PI * 60 * t) * (1 - beatPos * 10) * 0.5; // Kick
              }
              if (Math.floor(t / beat) % 4 === 2 && beatPos < 0.1) {
                  drums += (Math.random() * 2 - 1) * (1 - beatPos * 10) * 0.4; // Snare
              }
              if (beatPos < 0.05) {
                  drums += (Math.random() * 2 - 1) * (1 - beatPos * 20) * 0.15; // Hi-hat
              }

              // --- Envelope ---
              const noteProgress = (t % noteLength) / noteLength;
              const envelope = noteProgress < 0.1 ? noteProgress * 10 :
                  noteProgress > 0.9 ? (1 - noteProgress) * 10 : 1;

              // --- Mix ---
              sample += (lead + bass + pad + drums) * envelope;
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

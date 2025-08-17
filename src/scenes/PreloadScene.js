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

    // TODO: Load additional game assets when available
    // this.load.audio(ASSET_KEYS.COLLECT_SOUND, 'assets/audio/collect.wav');
    // this.load.audio(ASSET_KEYS.JUMP_SOUND, 'assets/audio/jump.wav');
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
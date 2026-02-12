// BootScene: Initial scene to load any assets (none here) and start the game.
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create particle texture for effects
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    create() {
        // Start the main game scene
        this.scene.start('GameScene');
    }
}
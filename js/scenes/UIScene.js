// UIScene: Handles UI elements like health bar, score, and wave counter.
export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.gameScene = this.scene.get('GameScene');

        // Health bar with smooth animation
        this.healthBar = this.add.graphics();
        this.currentHealthWidth = 200;
        this.updateHealthBar();

        // Score and wave text with better styling
        this.scoreText = this.add.text(15, 15, 'Score: 0', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        this.waveText = this.add.text(15, 50, 'Wave: 1', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        // HIGH SCORE display
        this.highScoreText = this.add.text(400, 15, '', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);

        // RESTART BUTTON - Always visible in top right
        this.restartBtn = this.add.text(720, 15, '↻ RESTART', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setInteractive();

        // Hover effects for restart button
        this.restartBtn.on('pointerover', () => {
            this.restartBtn.setScale(1.1);
            this.restartBtn.setStyle({ color: '#00ff00' });
        });

        this.restartBtn.on('pointerout', () => {
            this.restartBtn.setScale(1);
            this.restartBtn.setStyle({ color: '#ffaa00' });
        });

        this.restartBtn.on('pointerdown', () => {
            // Flash and restart
            this.cameras.main.flash(150, 255, 255, 0);
            this.time.delayedCall(150, () => {
                this.scene.stop('GameScene');
                this.scene.stop();
                this.scene.start('BootScene');
            });
        });
    }

    update() {
        if (!this.gameScene.player) return;

        this.scoreText.setText(`Score: ${this.gameScene.score}`);
        this.waveText.setText(`Wave: ${this.gameScene.wave}`);
        this.highScoreText.setText(`High Score: ${this.gameScene.highScore}`);
        this.updateHealthBar();
    }

    updateHealthBar() {
        if (!this.gameScene.player) return;

        const healthPercent = Math.max(0, this.gameScene.player.health / this.gameScene.player.maxHealth);
        const targetWidth = 200 * healthPercent;

        // Smooth animation
        this.currentHealthWidth += (targetWidth - this.currentHealthWidth) * 0.2;

        this.healthBar.clear();

        // Shadow
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(12, 572, 204, 24);

        // Background
        this.healthBar.fillStyle(0x330000);
        this.healthBar.fillRect(15, 575, 200, 20);

        // Health fill with color gradient based on health
        let color;
        if (healthPercent > 0.6) color = 0x00ff00;
        else if (healthPercent > 0.3) color = 0xffaa00;
        else color = 0xff0000;

        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(15, 575, this.currentHealthWidth, 20);

        // Shine effect
        this.healthBar.fillStyle(0xffffff, 0.3);
        this.healthBar.fillRect(15, 575, this.currentHealthWidth, 8);

        // Border
        this.healthBar.lineStyle(3, 0xffffff, 0.8);
        this.healthBar.strokeRect(15, 575, 200, 20);
    }
}
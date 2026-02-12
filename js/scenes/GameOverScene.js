// GameOverScene: Displays game over screen with score, wave, and restart button.
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.score = data.score || 0;
        this.wave = data.wave || 1;
        this.highScore = data.highScore || 0;
        this.isNewHighScore = data.isNewHighScore || false;
    }

    create() {
        // Dark overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

        // Game Over title with animation
        const gameOverText = this.add.text(400, 150, 'GAME OVER', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: gameOverText,
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Stats
        this.add.text(400, 250, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(400, 300, `Wave Reached: ${this.wave}`, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // HIGH SCORE display
        this.add.text(400, 340, `High Score: ${this.highScore}`, {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // NEW HIGH SCORE celebration
        if (this.isNewHighScore && this.score > 0) {
            const newRecordText = this.add.text(400, 380, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            this.tweens.add({
                targets: newRecordText,
                scale: { from: 0.8, to: 1.2 },
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        }

        // Restart button with hover effect
        const restartBtn = this.add.text(400, 400, 'RESTART', {
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 5,
            backgroundColor: '#003300',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive();

        // Hover effects
        restartBtn.on('pointerover', () => {
            restartBtn.setScale(1.1);
            restartBtn.setStyle({ color: '#00ffff' });
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(1);
            restartBtn.setStyle({ color: '#00ff00' });
        });

        restartBtn.on('pointerdown', () => {
            // Flash effect
            this.cameras.main.flash(200, 0, 255, 0);

            // Restart game
            this.time.delayedCall(200, () => {
                this.scene.stop();
                this.scene.start('BootScene');
            });
        });

        // Instructions
        this.add.text(400, 500, 'Click to restart and try again!', {
            fontSize: '18px',
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
}
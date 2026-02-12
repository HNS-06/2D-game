// Boss: Large enemy that shoots projectiles.
import Bullet from './Bullet.js';

export default class Boss {
    constructor(scene) {
        this.scene = scene;
        this.health = 500;
        this.maxHealth = 500;
        this.speed = 40;
        this.lastShot = 0;
        this.attackPattern = 0;

        // Create large sprite with epic appearance
        this.sprite = scene.add.rectangle(400, -100, 60, 60, 0xdc143c);
        this.sprite.setStrokeStyle(4, 0xff0000, 1);
        scene.physics.add.existing(this.sprite);

        // Add menacing particle aura
        this.aura = scene.add.particles(400, -100, 'particle', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 600,
            tint: [0xff0000, 0xff4500, 0x8b0000],
            frequency: 30,
            follow: this.sprite,
            blendMode: 'ADD'
        });

        // Epic entrance animation
        scene.cameras.main.shake(500, 0.01);
        scene.tweens.add({
            targets: this.sprite,
            y: 100,
            duration: 1500,
            ease: 'Bounce.easeOut'
        });

        // Pulsing animation
        scene.tweens.add({
            targets: this.sprite,
            scale: { from: 1, to: 1.15 },
            alpha: { from: 1, to: 0.85 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Create health bar
        this.createHealthBar();
    }

    createHealthBar() {
        const barWidth = 300;
        const barHeight = 20;
        const x = 250;
        const y = 30;

        this.healthBarBg = this.scene.add.rectangle(x, y, barWidth, barHeight, 0x000000, 0.7);
        this.healthBarFill = this.scene.add.rectangle(x - barWidth / 2, y, barWidth, barHeight, 0xff0000);
        this.healthBarFill.setOrigin(0, 0.5);
        this.healthBarBorder = this.scene.add.rectangle(x, y, barWidth, barHeight);
        this.healthBarBorder.setStrokeStyle(2, 0xffffff);
        this.healthBarBorder.setFillStyle(0x000000, 0);

        this.bossNameText = this.scene.add.text(400, 10, 'BOSS', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    updateHealthBar() {
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barWidth = 300;
        this.healthBarFill.width = barWidth * healthPercent;

        // Change color based on health
        if (healthPercent < 0.3) {
            this.healthBarFill.setFillStyle(0xff4500);
        } else if (healthPercent < 0.6) {
            this.healthBarFill.setFillStyle(0xff6347);
        }
    }

    update() {
        if (!this.sprite.active) return;

        this.updateHealthBar();

        // Move towards player with varying speed
        const player = this.scene.player.sprite;
        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
        const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, player.x, player.y);

        // Keep distance from player
        if (distance > 200) {
            this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);
        } else if (distance < 150) {
            this.scene.physics.velocityFromRotation(angle, -this.speed, this.sprite.body.velocity);
        } else {
            this.sprite.body.setVelocity(0);
        }

        // Multiple attack patterns
        const now = this.scene.time.now;
        if (now - this.lastShot > 800) {
            this.lastShot = now;
            this.attackPattern = (this.attackPattern + 1) % 3;

            if (this.attackPattern === 0) {
                // Single aimed shot
                this.shootAtPlayer(angle);
            } else if (this.attackPattern === 1) {
                // Triple spread shot
                this.shootAtPlayer(angle - 0.3);
                this.shootAtPlayer(angle);
                this.shootAtPlayer(angle + 0.3);
            } else {
                // Circular burst
                for (let i = 0; i < 8; i++) {
                    const burstAngle = (Math.PI * 2 / 8) * i;
                    this.shootAtPlayer(burstAngle);
                }
            }
        }
    }

    shootAtPlayer(angle) {
        const proj = new Bullet(this.scene, this.sprite.x, this.sprite.y, angle, true);
        proj.sprite.bulletData = proj;
        this.scene.bossProjectileGroup.add(proj.sprite);
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            // Epic death sequence
            this.scene.cameras.main.shake(1000, 0.02);
            this.scene.cameras.main.flash(500, 255, 0, 0);

            // Multiple explosions
            for (let i = 0; i < 5; i++) {
                this.scene.time.delayedCall(i * 150, () => {
                    const offsetX = Phaser.Math.Between(-30, 30);
                    const offsetY = Phaser.Math.Between(-30, 30);

                    this.scene.add.particles(this.sprite.x + offsetX, this.sprite.y + offsetY, 'particle', {
                        speed: { min: 200, max: 400 },
                        scale: { start: 1.5, end: 0 },
                        alpha: { start: 1, end: 0 },
                        lifespan: 800,
                        tint: [0xff0000, 0xff4500, 0xffd700],
                        quantity: 30,
                        emitting: false
                    }).explode();
                });
            }

            // Cleanup
            this.scene.time.delayedCall(750, () => {
                if (this.aura) this.aura.destroy();
                if (this.healthBarBg) this.healthBarBg.destroy();
                if (this.healthBarFill) this.healthBarFill.destroy();
                if (this.healthBarBorder) this.healthBarBorder.destroy();
                if (this.bossNameText) this.bossNameText.destroy();
                this.sprite.destroy();
            });
        }
    }
}
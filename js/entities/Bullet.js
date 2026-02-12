// Bullet: Projectiles for player and boss.
export default class Bullet {
    constructor(scene, x, y, angle, isBoss = false) {
        this.scene = scene;
        this.speed = 500;
        this.isBoss = isBoss;

        // Create sprite as circle with glow
        const color = isBoss ? 0xff0000 : 0x00ffff;
        const size = isBoss ? 8 : 6;
        this.sprite = scene.add.circle(x, y, size, color);
        this.sprite.setStrokeStyle(2, color, 0.6);
        scene.physics.add.existing(this.sprite);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);

        // Add particle trail
        this.trail = scene.add.particles(x, y, 'particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 200,
            tint: color,
            frequency: 20,
            follow: this.sprite
        });

        // Pulsing glow effect
        scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 1, to: 0.6 },
            scale: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            repeat: -1
        });

        // Auto-destroy after 3 seconds
        scene.time.delayedCall(3000, () => this.destroy());
    }

    update() {
        // Check if out of bounds
        if (this.sprite.x < -50 || this.sprite.x > 850 ||
            this.sprite.y < -50 || this.sprite.y > 650) {
            this.destroy();
        }
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            // Explosion effect
            this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
                speed: { min: 50, max: 150 },
                scale: { start: 0.6, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 300,
                tint: this.isBoss ? 0xff0000 : 0x00ffff,
                quantity: 8,
                emitting: false
            }).explode();

            if (this.trail) this.trail.destroy();
            this.sprite.destroy();
        }
    }
}
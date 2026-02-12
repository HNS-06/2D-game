// Enemy: Base class for enemies with types (normal, fast, tank).
export default class Enemy {
    constructor(scene, type, speedMultiplier) {
        this.scene = scene;
        this.type = type;
        this.speed = (type === 'fast' ? 120 : type === 'tank' ? 40 : 70) * speedMultiplier;
        this.health = type === 'tank' ? 100 : type === 'fast' ? 20 : 40;
        this.maxHealth = this.health;

        // Spawn at random edge
        const side = Phaser.Math.RND.pick(['top', 'bottom', 'left', 'right']);
        let x, y;
        if (side === 'top') { x = Phaser.Math.Between(0, 800); y = -20; }
        else if (side === 'bottom') { x = Phaser.Math.Between(0, 800); y = 620; }
        else if (side === 'left') { x = -20; y = Phaser.Math.Between(0, 600); }
        else { x = 820; y = Phaser.Math.Between(0, 600); }

        // Create sprite with type-specific appearance
        const color = type === 'tank' ? 0x9400d3 : type === 'fast' ? 0xff8c00 : 0xff4444;
        const size = type === 'tank' ? 28 : type === 'fast' ? 16 : 20;
        this.sprite = scene.add.rectangle(x, y, size, size, color);
        this.sprite.setStrokeStyle(2, color, 0.8);
        scene.physics.add.existing(this.sprite);

        // Add particle trail
        this.trail = scene.add.particles(x, y, 'particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 300,
            tint: color,
            frequency: type === 'fast' ? 30 : 80,
            follow: this.sprite
        });

        // Spawn animation
        this.sprite.setScale(0);
        scene.tweens.add({
            targets: this.sprite,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Rotation animation for visual effect
        scene.tweens.add({
            targets: this.sprite,
            rotation: Math.PI * 2,
            duration: type === 'fast' ? 1000 : type === 'tank' ? 3000 : 2000,
            repeat: -1
        });
    }

    update() {
        if (!this.sprite.active) return;

        // Move towards player
        const player = this.scene.player.sprite;
        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);

        // Pulse effect based on health
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.5) {
            this.sprite.alpha = 0.7 + healthPercent * 0.6;
        }
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            const color = this.type === 'tank' ? 0x9400d3 : this.type === 'fast' ? 0xff8c00 : 0xff4444;

            // Death explosion
            this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
                speed: { min: 100, max: 250 },
                scale: { start: 1, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 500,
                tint: color,
                quantity: this.type === 'tank' ? 20 : 12,
                emitting: false
            }).explode();

            // Extra particles for tank deaths instead of screen flash
            if (this.type === 'tank') {
                this.scene.cameras.main.shake(150, 0.008);
            }

            if (this.trail) this.trail.destroy();
            this.sprite.destroy();
        }
    }
}
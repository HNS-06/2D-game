// Player: Handles movement, shooting, and health.
import Bullet from './Bullet.js';

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 20;
        this.fireRate = 150; // ms between shots (faster shooting)
        this.lastFired = 0;
        this.isMouseDown = false;

        // Create sprite as a rectangle with glow effect
        this.sprite = scene.add.rectangle(x, y, 24, 24, 0x00ff00);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Add glow effect
        this.sprite.setStrokeStyle(3, 0x00ff00, 0.8);

        // Create particle emitter for movement trail
        this.trailParticles = scene.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            tint: 0x00ff00,
            frequency: 50,
            follow: this.sprite
        });

        // Create muzzle flash graphics
        this.muzzleFlash = scene.add.circle(0, 0, 8, 0xffff00, 0);
    }

    update() {
        // Movement with WASD
        const keys = this.scene.input.keyboard.addKeys('W,S,A,D');
        let velocityX = 0;
        let velocityY = 0;
        const speed = 250;

        if (keys.W.isDown) velocityY = -speed;
        if (keys.S.isDown) velocityY = speed;
        if (keys.A.isDown) velocityX = -speed;
        if (keys.D.isDown) velocityX = speed;

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.sprite.body.setVelocity(velocityX, velocityY);

        // Aim towards mouse
        const pointer = this.scene.input.activePointer;
        this.sprite.rotation = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, pointer.worldX, pointer.worldY);

        // Auto-shoot while mouse is held down
        if (this.isMouseDown) {
            this.shoot();
        }

        // Pulse effect based on health
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.3) {
            this.sprite.alpha = 0.7 + Math.sin(this.scene.time.now / 100) * 0.3;
        } else {
            this.sprite.alpha = 1;
        }
    }

    shoot() {
        const now = this.scene.time.now;
        if (now - this.lastFired < this.fireRate) return;
        this.lastFired = now;

        // Calculate bullet spawn position at edge of player
        const offsetX = Math.cos(this.sprite.rotation) * 15;
        const offsetY = Math.sin(this.sprite.rotation) * 15;

        const bullet = new Bullet(this.scene, this.sprite.x + offsetX, this.sprite.y + offsetY, this.sprite.rotation);
        bullet.sprite.bulletData = bullet;
        this.scene.bulletGroup.add(bullet.sprite);

        // GUN EFFECT: Muzzle flash with expanding ring
        this.muzzleFlash.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);
        this.muzzleFlash.setAlpha(1);
        this.muzzleFlash.setScale(1);
        this.scene.tweens.add({
            targets: this.muzzleFlash,
            alpha: 0,
            scale: 2,
            duration: 80,
            ease: 'Power2'
        });

        // GUN EFFECT: Shell casing ejection
        const casingAngle = this.sprite.rotation + Math.PI / 2;
        const casingX = this.sprite.x + Math.cos(casingAngle) * 8;
        const casingY = this.sprite.y + Math.sin(casingAngle) * 8;

        this.scene.add.particles(casingX, casingY, 'particle', {
            speed: { min: 80, max: 120 },
            angle: { min: casingAngle * 180 / Math.PI - 30, max: casingAngle * 180 / Math.PI + 30 },
            scale: { start: 0.4, end: 0.2 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            tint: 0xffaa00,
            quantity: 2,
            emitting: false,
            gravityY: 100
        }).explode();

        // GUN EFFECT: Stronger recoil with screen shake
        this.scene.cameras.main.shake(50, 0.002);

        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x - Math.cos(this.sprite.rotation) * 5,
            y: this.sprite.y - Math.sin(this.sprite.rotation) * 5,
            duration: 40,
            yoyo: true,
            ease: 'Power2'
        });

        // GUN EFFECT: Smoke puff
        this.scene.add.particles(this.sprite.x + offsetX, this.sprite.y + offsetY, 'particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.6, end: 1.2 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 300,
            tint: 0x888888,
            quantity: 3,
            emitting: false
        }).explode();
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash red when hit
        this.sprite.setFillStyle(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.sprite.setFillStyle(0x00ff00);
        });

        // Screen shake
        this.scene.cameras.main.shake(200, 0.005);

        // Knockback particles
        this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            tint: 0xff0000,
            quantity: 10,
            emitting: false
        }).explode();
    }
}
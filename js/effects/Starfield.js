// Starfield background effect
export default class Starfield {
    constructor(scene) {
        this.scene = scene;
        this.stars = [];

        // Create starfield
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const speed = Phaser.Math.FloatBetween(0.1, 0.5);
            const brightness = Phaser.Math.FloatBetween(0.3, 1);

            const star = scene.add.circle(x, y, size, 0xffffff, brightness);
            star.speed = speed;
            star.initialY = y;

            this.stars.push(star);
        }
    }

    update() {
        this.stars.forEach(star => {
            star.y += star.speed;

            // Wrap around
            if (star.y > 600) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 800);
            }

            // Twinkling effect
            star.alpha = 0.3 + Math.sin(this.scene.time.now / 500 + star.x) * 0.4;
        });
    }
}

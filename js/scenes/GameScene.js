// GameScene: Core game logic including player, enemies, waves, bosses, and upgrades.
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import Bullet from '../entities/Bullet.js';
import Starfield from '../effects/Starfield.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wave = 1;
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.bossProjectiles = [];
        this.upgradeOptions = ['damage', 'fireRate', 'maxHealth'];
        this.gameOver = false;

        // HIGH SCORE: Load from localStorage or set to 0
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    }

    create() {
        // Set up world bounds and physics
        this.physics.world.setBounds(0, 0, 800, 600);

        // Add starfield background
        this.starfield = new Starfield(this);

        // Create player
        this.player = new Player(this, 400, 300);

        // Groups for enemies and bullets.
        this.enemyGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.bossProjectileGroup = this.physics.add.group();

        // Collisions.
        this.physics.add.overlap(this.bulletGroup, this.enemyGroup, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.bossProjectileGroup, this.hitPlayer, null, this);

        // Input for shooting - hold to shoot continuously
        this.input.on('pointerdown', () => {
            this.player.isMouseDown = true;
        });
        this.input.on('pointerup', () => {
            this.player.isMouseDown = false;
        });

        // Start first wave.
        this.startWave();

        // UI scene overlay.
        this.scene.launch('UIScene');
    }

    update() {
        if (this.gameOver) return;

        // Update starfield background
        if (this.starfield) this.starfield.update();

        // Update player.
        this.player.update();

        // Update enemies.
        this.enemies.forEach(enemy => enemy.update());
        this.bossProjectiles.forEach(proj => proj.update());

        // Check for wave end.
        if (this.enemyGroup.children.entries.length === 0 && !this.bossActive) {
            this.endWave();
        }
    }

    startWave() {
        this.bossActive = false;
        // PROGRESSIVE DIFFICULTY - Gets much harder each wave
        const baseEnemies = 8;
        const waveMultiplier = this.wave <= 5 ? 3 : this.wave <= 10 ? 4 : 5;
        const enemyCount = baseEnemies + (this.wave * waveMultiplier);
        const speedMultiplier = 1 + (this.wave * 0.15);

        for (let i = 0; i < enemyCount; i++) {
            // Enemy composition changes with difficulty
            const tankChance = Math.min(0.35, 0.15 + (this.wave * 0.02));
            const fastChance = Math.min(0.45, 0.25 + (this.wave * 0.02));
            const rand = Math.random();
            let type;
            if (rand < tankChance) type = 'tank';
            else if (rand < tankChance + fastChance) type = 'fast';
            else type = 'normal';

            const enemy = new Enemy(this, type, speedMultiplier);
            this.enemies.push(enemy);
            enemy.sprite.enemyData = enemy;
            this.enemyGroup.add(enemy.sprite);
        }

        // Boss every 5 waves
        if (this.wave % 5 === 0) {
            this.boss = new Boss(this);
            this.bossActive = true;
            this.boss.sprite.bossData = this.boss;
            this.enemyGroup.add(this.boss.sprite);
        }

        // Show wave announcement
        this.showWaveAnnouncement();
    }

    showWaveAnnouncement() {
        const waveText = this.add.text(400, 300, `WAVE ${this.wave}`, {
            fontSize: '64px',
            fontStyle: 'bold',
            color: this.wave % 5 === 0 ? '#ff0000' : '#00ffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: waveText,
            alpha: 1,
            scale: { from: 0.5, to: 1.2 },
            duration: 500,
            yoyo: true,
            onComplete: () => waveText.destroy()
        });
    }

    endWave() {
        this.showUpgradeMenu();
    }

    showUpgradeMenu() {
        // Pause game and show upgrade options.
        this.scene.pause();
        const menu = this.add.graphics().fillStyle(0x000000, 0.8).fillRect(200, 200, 400, 200);
        const text = this.add.text(400, 220, 'Choose Upgrade:', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

        const upgradeNames = Phaser.Utils.Array.Shuffle(this.upgradeOptions.slice());
        const buttons = [];

        upgradeNames.forEach((opt, i) => {
            const btn = this.add.text(400, 260 + i * 40, opt.charAt(0).toUpperCase() + opt.slice(1), { fontSize: '18px', color: '#0f0' })
                .setOrigin(0.5).setInteractive();
            buttons.push(btn);

            btn.on('pointerdown', () => {
                this.applyUpgrade(opt);
                menu.destroy();
                text.destroy();
                buttons.forEach(b => b.destroy());
                this.scene.resume();
                this.wave++;
                this.startWave();
            });
        });
    }

    applyUpgrade(type) {
        if (type === 'damage') this.player.damage += 10;
        else if (type === 'fireRate') this.player.fireRate = Math.max(100, this.player.fireRate - 50);
        else if (type === 'maxHealth') {
            this.player.maxHealth += 20;
            this.player.health = this.player.maxHealth;
        }
    }

    hitEnemy(bulletSprite, enemySprite) {
        const enemy = enemySprite.enemyData || enemySprite.bossData;
        if (!enemy) return;

        // Destroy bullet with effect
        const bulletData = bulletSprite.bulletData;
        if (bulletData && bulletData.destroy) {
            bulletData.destroy();
        } else {
            bulletSprite.destroy();
        }

        enemy.health -= this.player.damage;

        if (enemy.health <= 0) {
            // Use entity's destroy method for effects
            if (enemy.destroy) {
                enemy.destroy();
            } else {
                enemySprite.destroy();
            }
            this.enemies = this.enemies.filter(e => e !== enemy);

            // Calculate score based on enemy type
            let scoreGain = 10;
            if (enemy === this.boss) scoreGain = 200;
            else if (enemy.type === 'tank') scoreGain = 30;
            else if (enemy.type === 'fast') scoreGain = 5;

            this.score += scoreGain;

            // VISUAL SCORE POPUP - Floating text showing score gain
            const scoreText = this.add.text(enemySprite.x, enemySprite.y, `+${scoreGain}`, {
                fontSize: enemy === this.boss ? '32px' : '20px',
                fontStyle: 'bold',
                color: enemy === this.boss ? '#ffd700' : '#00ff00',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            this.tweens.add({
                targets: scoreText,
                y: scoreText.y - 50,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => scoreText.destroy()
            });

            // Check if this was the boss
            if (enemy === this.boss) {
                this.bossActive = false;
                this.score += 100; // Bonus for defeating boss
            }
        }
    }

    hitPlayer(playerSprite, enemySprite) {
        const enemy = enemySprite.enemyData || enemySprite.bossData;
        const damage = enemy ? (enemy.type === 'tank' ? 20 : 10) : 15; // Boss projectiles do 15 damage

        // Use player's takeDamage method for effects
        this.player.takeDamage(damage);

        // Only destroy and filter if it's an enemy, not a boss projectile
        if (enemy) {
            if (enemy.destroy) {
                enemy.destroy();
            } else {
                enemySprite.destroy();
            }
            this.enemies = this.enemies.filter(e => e !== enemy);
        } else {
            // It's a boss projectile
            const bulletData = enemySprite.bulletData;
            if (bulletData && bulletData.destroy) {
                bulletData.destroy();
            } else {
                enemySprite.destroy();
            }
        }

        if (this.player.health <= 0) {
            this.gameOver = true;

            // HIGH SCORE: Update if current score is higher
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore.toString());
            }

            this.scene.stop('UIScene');
            this.scene.start('GameOverScene', {
                score: this.score,
                wave: this.wave,
                highScore: this.highScore,
                isNewHighScore: this.score === this.highScore
            });
        }
    }
}
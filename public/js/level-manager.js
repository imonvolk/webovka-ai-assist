// ============================================================================
// LEVEL MANAGER
// ============================================================================

class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentMap = null;
        this.transitioning = false;
        this.transitionTimer = 0;
        this.transitionDuration = 1.0;
        this.transitionPhase = 'none'; // 'fadeOut', 'fadeIn', 'none'
    }

    loadLevel(index) {
        if (index >= LEVELS.length) {
            // Game complete - loop back or show victory
            index = 0;
            // Could show victory screen here
        }

        this.currentLevelIndex = index;
        this.currentMap = new TileMap(LEVELS[index]);

        // Reset player position
        if (player) {
            // Clear checkpoint when loading new level
            player.clearCheckpoint();
            player.reset(
                this.currentMap.playerStart.x * TILE_SIZE,
                this.currentMap.playerStart.y * TILE_SIZE
            );
        }

        // Set camera bounds
        if (camera) {
            camera.setBounds(this.currentMap.pixelWidth, this.currentMap.pixelHeight);
            // Center camera on player immediately
            camera.x = player.x - camera.width / 2;
            camera.y = player.y - camera.height / 2;
        }

        // Clear and spawn enemies
        enemies = [];
        projectiles = [];
        pickups = [];
        checkpoints = [];
        if (particleSystem) particleSystem.clear();

        const levelData = LEVELS[index];
        if (levelData.enemies) {
            for (const enemyData of levelData.enemies) {
                const ex = enemyData.x * TILE_SIZE;
                const ey = enemyData.y * TILE_SIZE;

                let enemy;
                switch (enemyData.type) {
                    case 'patrol':
                        enemy = new GroundPatrolEnemy(ex, ey);
                        break;
                    case 'shooter':
                        enemy = new StationaryShooterEnemy(ex, ey);
                        break;
                    case 'flying':
                        enemy = new FlyingEnemy(ex, ey);
                        break;
                    case 'boss':
                        enemy = new BossEnemy(ex, ey);
                        break;
                    default:
                        enemy = new GroundPatrolEnemy(ex, ey);
                }
                enemies.push(enemy);
            }
        }

        // Spawn pickups
        if (levelData.pickups) {
            for (const pickupData of levelData.pickups) {
                const px = pickupData.x * TILE_SIZE;
                const py = pickupData.y * TILE_SIZE;
                pickups.push(new Pickup(px, py, pickupData.type));
            }
        }

        // Spawn checkpoints
        if (levelData.checkpoints) {
            for (const cpData of levelData.checkpoints) {
                const cx = cpData.x * TILE_SIZE;
                const cy = cpData.y * TILE_SIZE;
                checkpoints.push(new Checkpoint(cx, cy));
            }
        }

        // Award points and coins for completing a level (except first)
        if (index > 0 && gameState.started) {
            gameState.score += 500;
            if (soundSystem) soundSystem.playLevelComplete();
            if (coinSystem) coinSystem.onLevelComplete();
        }

        // Reset damage tracking for new level
        if (coinSystem) coinSystem.resetLevelDamage();

        gameState.currentLevel = index;
    }

    nextLevel() {
        if (this.transitioning) return;

        this.transitioning = true;
        this.transitionTimer = this.transitionDuration;
        this.transitionPhase = 'fadeOut';
    }

    update(dt) {
        if (!this.transitioning) return;

        this.transitionTimer -= dt;

        if (this.transitionPhase === 'fadeOut' && this.transitionTimer <= this.transitionDuration / 2) {
            // Load next level at midpoint
            this.loadLevel(this.currentLevelIndex + 1);
            this.transitionPhase = 'fadeIn';
        }

        if (this.transitionTimer <= 0) {
            this.transitioning = false;
            this.transitionPhase = 'none';
        }
    }

    renderTransition(ctx) {
        if (!this.transitioning) return;

        let alpha;
        if (this.transitionPhase === 'fadeOut') {
            alpha = 1 - (this.transitionTimer / (this.transitionDuration / 2));
        } else {
            alpha = this.transitionTimer / (this.transitionDuration / 2);
        }

        alpha = Math.max(0, Math.min(1, alpha));

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Level name during transition
        if (alpha > 0.5) {
            ctx.fillStyle = `rgba(139, 0, 0, ${(alpha - 0.5) * 2})`;
            ctx.font = 'bold 24px Impact, Arial Black, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentMap.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
    }
}

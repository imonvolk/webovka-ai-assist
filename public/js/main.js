/**
 * DOOM Platformer - Main Game Loop
 * Core game state, initialization, update/render cycle
 */

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Timing variables
let lastTime = 0;
let deltaTime = 0;
let frameCount = 0;
let fps = 0;
let fpsUpdateTime = 0;
// FPS Counter element
const fpsCounter = document.getElementById('fps-counter');

// Game state
const gameState = {
    running: true,
    paused: false,
    started: false,
    currentLevel: 0,
    transitioning: false,
    transitionAlpha: 0,
    score: 0,
    showMenu: true,
    gameOver: false,
    victory: false,
    difficulty: 'normal',
    showSettings: false,
    showLevelEditor: false,
    showShop: false,
    // Backend integration
    showAuth: false,
    authMode: 'login', // 'login' or 'register'
    isLoggedIn: false,
    user: null,
    token: null,
    // Tutorial and Help
    showTutorial: false,
    tutorialStep: 0,
    tutorialCompleted: localStorage.getItem('tutorialCompleted') === 'true',
    showHelp: false
};

function getDifficulty() {
    return DIFFICULTY_SETTINGS[gameState.difficulty] || DIFFICULTY_SETTINGS.normal;
}

const input = new InputHandler();
let player = null;
let camera = null;
let levelManager = null;
let particleSystem = null;
let soundSystem = null;
let screenShake = null;
let highScoreSystem = null;
let projectiles = [];
let enemies = [];
let pickups = [];
let checkpoints = [];

// Achievement system
let achievementSystem = null;
let coinSystem = null;
let skinManager = null;
let shopUI = null;

function updateTiming(timestamp) {
    deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (deltaTime > 0.1) deltaTime = 0.1;

    frameCount++;
    fpsUpdateTime += deltaTime * 1000;

    if (fpsUpdateTime >= FPS_UPDATE_INTERVAL) {
        fps = Math.round(frameCount / (fpsUpdateTime / 1000));
        fpsCounter.textContent = `FPS: ${fps}`;
        frameCount = 0;
        fpsUpdateTime = 0;
    }
}

function update(dt) {
    // Handle pause toggle
    if (input.consumePause() && gameState.started && !gameState.showMenu && !gameState.gameOver) {
        gameState.paused = !gameState.paused;
        if (gameState.paused && soundSystem) {
            soundSystem.stopMusic();
        } else if (!gameState.paused && soundSystem) {
            soundSystem.startMusic();
        }
    }
    
    // Handle return to menu (M key during pause)
    if (gameState.paused && input.menuReturn && gameState.started) {
        input.menuReturn = false;
        returnToMenu();
    }

    // Update screen shake
    if (screenShake) {
        screenShake.update(dt);
    }

    levelManager.update(dt);

    if (gameState.started && player && !levelManager.transitioning && !gameState.paused) {
        player.update(dt, input, levelManager.currentMap, projectiles, particleSystem);
        camera.follow(player, dt);

        // Update enemies
        for (const enemy of enemies) {
            enemy.update(dt, levelManager.currentMap, player, projectiles);
        }

        // Check for enemy deaths and award score + coins
        for (const enemy of enemies) {
            if (enemy.isDead && !enemy.scoreCounted) {
                enemy.scoreCounted = true;
                gameState.score += Math.floor(100 * getDifficulty().scoreMultiplier);
                if (soundSystem) soundSystem.playEnemyDeath();
                if (screenShake) screenShake.shake(4, 0.15);

                // Award coins
                if (coinSystem) {
                    coinSystem.onEnemyKill(
                        enemy.type,
                        enemy.x + enemy.width / 2,
                        enemy.y
                    );
                }

                // Track achievement
                if (achievementSystem) {
                    achievementSystem.onEnemyKilled(player);
                    if (enemy.type === 'boss') {
                        achievementSystem.onBossKilled();
                        // Boss defeated - trigger victory!
                        setTimeout(() => {
                            gameState.victory = true;
                            gameState.score += 5000; // Bonus for beating the game
                            if (soundSystem) {
                                soundSystem.playTone(523, 0.2, 'square', 0.4); // C
                                setTimeout(() => soundSystem.playTone(659, 0.2, 'square', 0.4), 200); // E
                                setTimeout(() => soundSystem.playTone(784, 0.3, 'square', 0.5), 400); // G
                            }
                        }, 2000);
                    }
                }
            }
        }

        // Remove fully dead enemies
        enemies = enemies.filter(e => !e.isFullyDead());

        // Update achievement system
        if (achievementSystem) {
            achievementSystem.update(dt);
        }

        // Update pickups
        for (const pickup of pickups) {
            pickup.update(dt);

            if (!pickup.collected) {
                const playerBounds = player.getBounds();
                const pickupBounds = pickup.getBounds();
                if (aabbCollision(playerBounds, pickupBounds)) {
                    pickup.collect(player, soundSystem);
                    player.stats.pickupsCollected++;
                }
            }
        }
        pickups = pickups.filter(p => !p.collected);

        // Update checkpoints
        for (const checkpoint of checkpoints) {
            checkpoint.update(dt);

            if (!checkpoint.activated) {
                const playerBounds = player.getBounds();
                const cpBounds = checkpoint.getBounds();
                if (aabbCollision(playerBounds, cpBounds)) {
                    checkpoint.activate(player, soundSystem);
                }
            }
        }

        // Update projectiles
        for (const projectile of projectiles) {
            projectile.update(dt, levelManager.currentMap);
        }

        // Collision detection: player projectiles vs enemies
        for (const projectile of projectiles) {
            if (!projectile.isPlayerProjectile || projectile.isDead()) continue;

            const pBounds = projectile.getBounds();
            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const eBounds = enemy.getBounds();
                if (aabbCollision(pBounds, eBounds)) {
                    enemy.takeDamage(projectile.damage, particleSystem);
                    player.stats.damageDealt += projectile.damage;
                    projectile.onHit(); // Handles piercing and explosive
                    particleSystem.emitHit(
                        projectile.x + projectile.width / 2,
                        projectile.y + projectile.height / 2
                    );
                    if (soundSystem) soundSystem.playEnemyHit();
                    if (!projectile.piercing) break; // Piercing projectiles continue
                }
            }
        }

        // Collision detection: enemy projectiles vs player
        for (const projectile of projectiles) {
            if (projectile.isPlayerProjectile || projectile.isDead()) continue;

            const pBounds = projectile.getBounds();
            const playerBounds = player.getBounds();

            if (aabbCollision(pBounds, playerBounds)) {
                player.takeDamage(projectile.damage, particleSystem);
                projectile.dead = true;
                particleSystem.emitHit(
                    projectile.x + projectile.width / 2,
                    projectile.y + projectile.height / 2
                );
            }
        }

        // Collision detection: enemies vs player (contact damage)
        if (!player.isDead && player.invulnerableTime <= 0) {
            const playerBounds = player.getBounds();
            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const eBounds = enemy.getBounds();
                if (aabbCollision(playerBounds, eBounds)) {
                    player.takeDamage(enemy.damage, particleSystem);
                    // Knockback
                    player.velocityX = enemy.x > player.x ? -200 : 200;
                    player.velocityY = -150;
                    break;
                }
            }
        }

        // Remove dead projectiles
        projectiles = projectiles.filter(p => !p.isDead());

        // Update particles
        particleSystem.update(dt);
    }

    // Update coin system (always, even when paused)
    if (coinSystem) {
        coinSystem.update(dt);
    }

    // Update shop UI if open
    if (gameState.showShop && shopUI) {
        shopUI.handleInput(input);
        shopUI.update(dt);
    }

    // Handle shop opening
    if (input.shopOpen) {
        input.shopOpen = false;
        if (shopUI && !gameState.showShop) {
            shopUI.open();
        }
    }
}

// AABB collision helper
function aabbCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function render() {
    ctx.save();

    // Apply screen shake
    if (screenShake) {
        screenShake.apply(ctx);
    }

    // Render tilemap (includes background)
    if (levelManager.currentMap) {
        levelManager.currentMap.render(ctx, camera);
    }

    // Render pickups
    for (const pickup of pickups) {
        pickup.render(ctx, camera);
    }

    // Render checkpoints
    for (const checkpoint of checkpoints) {
        checkpoint.render(ctx, camera);
    }

    // Render enemies
    for (const enemy of enemies) {
        enemy.render(ctx, camera);
    }

    // Render player
    if (player) {
        player.render(ctx, camera);
    }

    // Render projectiles
    for (const projectile of projectiles) {
        projectile.render(ctx, camera);
    }

    // Render particles
    particleSystem.render(ctx, camera);

    ctx.restore();

    // Render HUD (not affected by screen shake)
    drawHUD();

    // Render transition effect
    levelManager.renderTransition(ctx);

    // Render menus
    if (gameState.showMenu) {
        drawStartMenu();
    } else if (gameState.victory) {
        drawVictoryScreen();
    } else if (gameState.gameOver) {
        drawGameOverMenu();
    } else if (gameState.paused && (!levelEditor || !levelEditor.active)) {
        drawPauseMenu();
    }

    // Render coin popups and notifications
    if (coinSystem) {
        coinSystem.renderPopups(ctx, camera);
        coinSystem.renderNotification(ctx);
    }

    // Render shop UI
    if (gameState.showShop && shopUI) {
        shopUI.render(ctx);
    }

    // Render auth screen
    if (gameState.showAuth) {
        drawAuthScreen();
    }

    // Render tutorial
    if (gameState.showTutorial) {
        drawTutorial();
    }

    // Render help screen
    if (gameState.showHelp) {
        drawHelp();
    }

    // Render achievement notifications
    if (achievementSystem) {
        achievementSystem.render(ctx);
    }

    // Render level editor
    if (levelEditor && levelEditor.active) {
        levelEditor.render(ctx);
    }
}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    if (lastTime === 0) lastTime = timestamp;

    updateTiming(timestamp);

    // Handle menu input
    if (gameState.showMenu) {
        if (input.consumeEnter()) {
            startGame();
        }
        render();
    } else if (gameState.victory) {
        if (input.consumeEnter()) {
            restartGame();
        }
        render();
    } else if (gameState.gameOver) {
        if (input.consumeEnter()) {
            restartGame();
        }
        render();
    } else {
        update(deltaTime);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function returnToMenu() {
    gameState.showMenu = true;
    gameState.started = false;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.victory = false;
    
    // Stop music
    if (soundSystem) {
        soundSystem.stopMusic();
    }
    
    // Reset player
    if (player) {
        player.fullReset();
    }
}

function startGame() {
    // Show tutorial on first run
    if (!gameState.tutorialCompleted) {
        showTutorial();
        return;
    }

    gameState.showMenu = false;
    gameState.started = true;
    gameState.gameOver = false;
    gameState.victory = false;
    gameState.score = 0;

    // Initialize audio on user interaction
    if (soundSystem) {
        soundSystem.init();
        soundSystem.resume();
        soundSystem.startMusic();
    }

    // Reset player and load first level
    player.fullReset();
    levelManager.loadLevel(0);
}

function restartGame() {
    // Save high score locally
    if (highScoreSystem) {
        highScoreSystem.addScore(gameState.score, gameState.currentLevel);
    }

    // Submit score to online leaderboard if logged in
    if (gameState.isLoggedIn && gameState.score > 0) {
        const coins = coinSystem ? coinSystem.balance : 0;
        API.submitScore(gameState.score, gameState.currentLevel, coins)
            .then(result => {
                if (result && !result.error) {
                    console.log('Score submitted to online leaderboard!');
                    if (result.newHighScore) {
                        console.log('🏆 New personal best!');
                    }
                }
            })
            .catch(err => console.error('Failed to submit score:', err));
    }

    gameState.gameOver = false;
    gameState.started = true;
    gameState.score = 0;

    // Reset player and load first level
    player.fullReset();
    player.health = player.maxHealth;
    player.isDead = false;
    levelManager.loadLevel(0);

    if (soundSystem) {
        soundSystem.startMusic();
    }
}

// Global systems for new features
let saveSystem = null;
let fullscreenManager = null;
let levelEditor = null;

function init() {
    console.log('DOOM Platformer initialized');
    console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
    console.log(`Tile size: ${TILE_SIZE}px`);

    // Create camera
    camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Create particle system
    particleSystem = new ParticleSystem();

    // Create sound system
    soundSystem = new SoundSystem();

    // Create screen shake
    screenShake = new ScreenShake();

    // Create high score system
    highScoreSystem = new HighScoreSystem();

    // Create achievement system
    achievementSystem = new AchievementSystem();

    // Create coin system and skin manager
    coinSystem = new CoinSystem();
    skinManager = new SkinManager();
    shopUI = new ShopUI();

    // Create save system
    saveSystem = new SaveSystem();

    // Create fullscreen manager
    fullscreenManager = new FullscreenManager(document.documentElement);

    // Create level editor
    levelEditor = new LevelEditor();

    // Create player (position will be set by level manager)
    player = new Player(0, 0);

    // Create level manager and load first level
    levelManager = new LevelManager();
    levelManager.loadLevel(0);

    // Initialize authentication
    initAuth();

    // Start with menu
    gameState.showMenu = true;
    gameState.started = false;

    // Add canvas click handler for level editor
    canvas.addEventListener('click', (e) => {
        if (levelEditor && levelEditor.active) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            levelEditor.handleClick(mouseX, mouseY);
        }
    });

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.paused = true;
        if (soundSystem) soundSystem.stopMusic();
    } else {
        gameState.paused = false;
        lastTime = 0;
    }
});

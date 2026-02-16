// ============================================================================
// INPUT HANDLER CLASS
// ============================================================================

class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            jump: false,
            shoot: false,
            up: false,
            down: false
        };
        this.jumpPressed = false;
        this.shootPressed = false;
        this.pausePressed = false;
        this.weaponSwitch = 0;
        this.enterPressed = false;

        // Shop input state
        this.shopLeft = false;
        this.shopRight = false;
        this.shopUp = false;
        this.shopDown = false;
        this.shopConfirm = false;
        this.shopBack = false;
        this.shopSort = false;
        this.shopTry = false;
        this.shopOpen = false;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        // Handle tutorial
        if (gameState.showTutorial) {
            if (e.code === 'Enter') {
                nextTutorialStep();
            } else if (e.code === 'Escape') {
                skipTutorial();
            }
            e.preventDefault();
            return;
        }

        // Handle help screen
        if (gameState.showHelp) {
            if (e.code === 'KeyH' || e.code === 'Escape') {
                gameState.showHelp = false;
            }
            e.preventDefault();
            return;
        }

        // Handle auth screen
        if (gameState.showAuth) {
            handleAuthInput(e);
            e.preventDefault();
            return;
        }

        // Handle shop input when shop is open
        if (gameState.showShop) {
            switch (e.code) {
                case 'ArrowLeft': case 'KeyA': this.shopLeft = true; break;
                case 'ArrowRight': case 'KeyD': this.shopRight = true; break;
                case 'ArrowUp': case 'KeyW': this.shopUp = true; break;
                case 'ArrowDown': case 'KeyS': this.shopDown = true; break;
                case 'Enter': case 'Space': this.shopConfirm = true; break;
                case 'Escape': this.shopBack = true; break;
                case 'Tab': this.shopSort = true; e.preventDefault(); break;
                case 'KeyT': this.shopTry = true; break;
            }
            e.preventDefault();
            return;
        }

        // Handle menu/start states
        if (gameState.showMenu) {
            if (e.code === 'Enter' || e.code === 'Space') {
                this.enterPressed = true;
                e.preventDefault();
            }
            // Difficulty selection
            if (e.code === 'Digit1') gameState.difficulty = 'easy';
            if (e.code === 'Digit2') gameState.difficulty = 'normal';
            if (e.code === 'Digit3') gameState.difficulty = 'hard';
            // Open shop from menu
            if (e.code === 'KeyB') this.shopOpen = true;
            // Open auth screen
            if (e.code === 'KeyM') {
                gameState.showAuth = true;
                resetAuthForm();
            }
            // Open help
            if (e.code === 'KeyH') {
                gameState.showHelp = true;
            }
            // Show tutorial
            if (e.code === 'KeyT') {
                showTutorial();
            }
            return;
        }

        if (gameState.gameOver) {
            if (e.code === 'Enter' || e.code === 'Space') {
                this.enterPressed = true;
                e.preventDefault();
            }
            return;
        }

        if (!gameState.started) {
            gameState.started = true;
            if (soundSystem) {
                soundSystem.init();
                soundSystem.resume();
                soundSystem.startMusic();
            }
        }

        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
                // Up key for aiming or jumping
                this.keys.up = true;
                if (e.code === 'KeyW' || !this.keys.shoot) {
                    // W or up without shooting = jump
                    if (!this.keys.jump) {
                        this.jumpPressed = true;
                    }
                    this.keys.jump = true;
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = true;
                e.preventDefault();
                break;
            case 'Space':
                if (!this.keys.jump) {
                    this.jumpPressed = true;
                }
                this.keys.jump = true;
                e.preventDefault();
                break;
            case 'KeyJ':
            case 'KeyZ':
            case 'ControlLeft':
            case 'ControlRight':
                if (!this.keys.shoot) {
                    this.shootPressed = true;
                }
                this.keys.shoot = true;
                break;
            case 'Escape':
            case 'KeyP':
                this.pausePressed = true;
                break;
            case 'KeyB':
                if (gameState.paused) this.shopOpen = true;
                break;
            case 'Digit1':
                this.weaponSwitch = 1;
                break;
            case 'Digit2':
                this.weaponSwitch = 2;
                break;
            case 'Digit3':
                this.weaponSwitch = 3;
                break;
            case 'Digit4':
                this.weaponSwitch = 4;
                break;
            case 'KeyQ':
                this.weaponSwitch = -1; // Previous weapon
                break;
            case 'Digit5':
                this.weaponSwitch = 5;
                break;
            case 'Digit6':
                this.weaponSwitch = 6;
                break;
            case 'KeyF':
                // Fullscreen toggle
                if (fullscreenManager) fullscreenManager.toggle();
                break;
            case 'KeyL':
                // Level editor toggle
                if (levelEditor) levelEditor.toggle();
                break;
            case 'F5':
                // Quick save
                if (saveSystem && player && !gameState.showMenu) {
                    saveSystem.save(player, gameState.currentLevel);
                    console.log('Game saved!');
                }
                e.preventDefault();
                break;
            case 'F9':
                // Quick load
                if (saveSystem && player) {
                    const saveData = saveSystem.load();
                    if (saveData) {
                        const levelIndex = saveSystem.applySave(saveData, player);
                        levelManager.loadLevel(levelIndex);
                        gameState.showMenu = false;
                        gameState.started = true;
                        console.log('Game loaded!');
                    }
                }
                e.preventDefault();
                break;
        }

        // Handle level editor keys
        if (levelEditor && levelEditor.active) {
            levelEditor.handleKey(e.key);
        }
    }

    handleKeyUp(e) {
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = false;
                if (e.code === 'KeyW') {
                    this.keys.jump = false;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'KeyJ':
            case 'KeyZ':
            case 'ControlLeft':
            case 'ControlRight':
                this.keys.shoot = false;
                break;
        }
    }

    consumeShoot() {
        const pressed = this.shootPressed;
        this.shootPressed = false;
        return pressed;
    }

    consumeJump() {
        const pressed = this.jumpPressed;
        this.jumpPressed = false;
        return pressed;
    }

    consumePause() {
        const pressed = this.pausePressed;
        this.pausePressed = false;
        return pressed;
    }

    consumeWeaponSwitch() {
        const weapon = this.weaponSwitch;
        this.weaponSwitch = 0;
        return weapon;
    }

    consumeEnter() {
        const pressed = this.enterPressed;
        this.enterPressed = false;
        return pressed;
    }
}

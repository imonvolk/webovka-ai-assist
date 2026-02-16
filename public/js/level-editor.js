/**
 * Level Editor Module
 * Interactive level editor for creating custom game levels
 */

class LevelEditor {
    constructor() {
        this.active = false;
        this.selectedTile = TILES.SOLID;
        this.gridWidth = 40;
        this.gridHeight = 15;
        this.tiles = [];
        this.enemies = [];
        this.pickups = [];
        this.checkpointsList = [];
        this.playerStart = { x: 2, y: 11 };
        this.cameraX = 0;
        this.selectedTool = 'tile'; // 'tile', 'enemy', 'pickup', 'checkpoint', 'player', 'erase'
        this.selectedEnemy = 'patrol';
        this.selectedPickup = 'health';

        this.initGrid();
    }

    initGrid() {
        this.tiles = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // Default borders
                if (y === 0 || y === this.gridHeight - 1 || x === 0 || x === this.gridWidth - 1) {
                    this.tiles[y][x] = TILES.SOLID;
                } else {
                    this.tiles[y][x] = TILES.EMPTY;
                }
            }
        }
    }

    toggle() {
        this.active = !this.active;
        if (this.active) {
            gameState.paused = true;
        }
    }

    handleClick(mouseX, mouseY) {
        if (!this.active) return;

        const gridX = Math.floor((mouseX + this.cameraX) / TILE_SIZE);
        const gridY = Math.floor(mouseY / TILE_SIZE);

        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) return;

        switch (this.selectedTool) {
            case 'tile':
                this.tiles[gridY][gridX] = this.selectedTile;
                break;
            case 'enemy':
                this.enemies.push({ type: this.selectedEnemy, x: gridX, y: gridY });
                break;
            case 'pickup':
                this.pickups.push({ type: this.selectedPickup, x: gridX, y: gridY });
                break;
            case 'checkpoint':
                this.checkpointsList.push({ x: gridX, y: gridY });
                break;
            case 'player':
                this.playerStart = { x: gridX, y: gridY };
                break;
            case 'erase':
                this.tiles[gridY][gridX] = TILES.EMPTY;
                this.enemies = this.enemies.filter(e => e.x !== gridX || e.y !== gridY);
                this.pickups = this.pickups.filter(p => p.x !== gridX || p.y !== gridY);
                this.checkpointsList = this.checkpointsList.filter(c => c.x !== gridX || c.y !== gridY);
                break;
        }
    }

    scroll(direction) {
        this.cameraX += direction * TILE_SIZE * 2;
        this.cameraX = Math.max(0, Math.min(this.cameraX, (this.gridWidth - 25) * TILE_SIZE));
    }

    exportLevel() {
        const levelData = {
            name: "CUSTOM LEVEL",
            playerStart: this.playerStart,
            width: this.gridWidth,
            height: this.gridHeight,
            enemies: this.enemies,
            pickups: this.pickups,
            checkpoints: this.checkpointsList,
            data: this.tiles.map(row => row.join(''))
        };
        return JSON.stringify(levelData);
    }

    importLevel(jsonString) {
        try {
            const levelData = JSON.parse(jsonString);
            this.gridWidth = levelData.width;
            this.gridHeight = levelData.height;
            this.playerStart = levelData.playerStart;
            this.enemies = levelData.enemies || [];
            this.pickups = levelData.pickups || [];
            this.checkpointsList = levelData.checkpoints || [];
            this.tiles = levelData.data.map(row => row.split('').map(Number));
            return true;
        } catch (e) {
            console.error('Failed to import level:', e);
            return false;
        }
    }

    testLevel() {
        // Create temporary level and load it
        const tempLevel = {
            name: "CUSTOM LEVEL",
            playerStart: this.playerStart,
            width: this.gridWidth,
            height: this.gridHeight,
            enemies: this.enemies,
            pickups: this.pickups,
            checkpoints: this.checkpointsList,
            data: this.tiles.map(row => row.join(''))
        };

        // Add to LEVELS temporarily
        LEVELS.push(tempLevel);
        levelManager.loadLevel(LEVELS.length - 1);
        this.active = false;
        gameState.paused = false;
    }

    render(ctx) {
        if (!this.active) return;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const screenX = x * TILE_SIZE - this.cameraX;
                const screenY = y * TILE_SIZE;

                if (screenX < -TILE_SIZE || screenX > CANVAS_WIDTH) continue;

                // Tile
                const tile = this.tiles[y][x];
                switch (tile) {
                    case TILES.SOLID:
                        ctx.fillStyle = '#442222';
                        break;
                    case TILES.PLATFORM:
                        ctx.fillStyle = '#444466';
                        break;
                    case TILES.SPIKES:
                        ctx.fillStyle = '#882222';
                        break;
                    case TILES.EXIT:
                        ctx.fillStyle = '#226622';
                        break;
                    default:
                        ctx.fillStyle = '#111';
                }
                ctx.fillRect(screenX, screenY, TILE_SIZE - 1, TILE_SIZE - 1);

                // Grid lines
                ctx.strokeStyle = '#333';
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }

        // Enemies
        ctx.fillStyle = '#ff4444';
        for (const enemy of this.enemies) {
            const screenX = enemy.x * TILE_SIZE - this.cameraX + 8;
            const screenY = enemy.y * TILE_SIZE + 8;
            ctx.fillRect(screenX, screenY, 16, 16);
            ctx.font = '10px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(enemy.type[0].toUpperCase(), screenX + 4, screenY + 12);
            ctx.fillStyle = '#ff4444';
        }

        // Pickups
        ctx.fillStyle = '#44ff44';
        for (const pickup of this.pickups) {
            const screenX = pickup.x * TILE_SIZE - this.cameraX + 8;
            const screenY = pickup.y * TILE_SIZE + 8;
            ctx.beginPath();
            ctx.arc(screenX + 8, screenY + 8, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Checkpoints
        ctx.fillStyle = '#ffff44';
        for (const cp of this.checkpointsList) {
            const screenX = cp.x * TILE_SIZE - this.cameraX + 12;
            const screenY = cp.y * TILE_SIZE;
            ctx.fillRect(screenX, screenY, 8, 32);
        }

        // Player start
        ctx.fillStyle = '#4444ff';
        const psx = this.playerStart.x * TILE_SIZE - this.cameraX + 4;
        const psy = this.playerStart.y * TILE_SIZE + 4;
        ctx.fillRect(psx, psy, 24, 24);

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Impact';
        ctx.textAlign = 'left';
        ctx.fillText('LEVEL EDITOR', 10, 25);

        ctx.font = '12px Arial';
        ctx.fillText(`Tool: ${this.selectedTool.toUpperCase()}`, 10, 45);
        ctx.fillText(`Tile: ${Object.keys(TILES)[this.selectedTile]}`, 10, 60);
        ctx.fillText('1-5: Tiles | E: Enemy | P: Pickup | C: Checkpoint | S: Player | X: Erase', 10, CANVAS_HEIGHT - 40);
        ctx.fillText('Arrow Keys: Scroll | T: Test | ESC: Exit | Ctrl+S: Export', 10, CANVAS_HEIGHT - 20);
    }

    handleKey(key) {
        if (!this.active) return false;

        switch (key) {
            case '1': this.selectedTile = TILES.EMPTY; this.selectedTool = 'tile'; break;
            case '2': this.selectedTile = TILES.SOLID; this.selectedTool = 'tile'; break;
            case '3': this.selectedTile = TILES.PLATFORM; this.selectedTool = 'tile'; break;
            case '4': this.selectedTile = TILES.SPIKES; this.selectedTool = 'tile'; break;
            case '5': this.selectedTile = TILES.EXIT; this.selectedTool = 'tile'; break;
            case 'e': this.selectedTool = 'enemy'; break;
            case 'p': this.selectedTool = 'pickup'; break;
            case 'c': this.selectedTool = 'checkpoint'; break;
            case 's': this.selectedTool = 'player'; break;
            case 'x': this.selectedTool = 'erase'; break;
            case 't': this.testLevel(); break;
            case 'ArrowLeft': this.scroll(-1); break;
            case 'ArrowRight': this.scroll(1); break;
            case 'Escape': this.toggle(); return true;
            default: return false;
        }
        return true;
    }
}

// ============================================================================
// TILEMAP CLASS
// ============================================================================

class TileMap {
    constructor(levelData) {
        this.width = levelData.width;
        this.height = levelData.height;
        this.name = levelData.name;
        this.playerStart = levelData.playerStart;
        this.tiles = this.parseLevelData(levelData.data);
        this.pixelWidth = this.width * TILE_SIZE;
        this.pixelHeight = this.height * TILE_SIZE;
    }

    parseLevelData(data) {
        const tiles = [];
        for (let y = 0; y < data.length; y++) {
            tiles[y] = [];
            for (let x = 0; x < data[y].length; x++) {
                tiles[y][x] = parseInt(data[y][x]);
            }
        }
        return tiles;
    }

    getTile(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return TILES.SOLID; // Out of bounds = solid
        }
        return this.tiles[gridY][gridX];
    }

    getTileAtPixel(pixelX, pixelY) {
        const gridX = Math.floor(pixelX / TILE_SIZE);
        const gridY = Math.floor(pixelY / TILE_SIZE);
        return this.getTile(gridX, gridY);
    }

    isSolid(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.SOLID;
    }

    isPlatform(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.PLATFORM;
    }

    isSpike(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.SPIKES;
    }

    isExit(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile === TILES.EXIT;
    }

    render(ctx, camera) {
        // Calculate visible tile range
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.ceil((camera.x + camera.width) / TILE_SIZE);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.ceil((camera.y + camera.height) / TILE_SIZE);

        // Render background first
        this.renderBackground(ctx, camera);

        // Render tiles
        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

                const tile = this.tiles[y][x];
                const screenPos = camera.worldToScreen(x * TILE_SIZE, y * TILE_SIZE);

                this.renderTile(ctx, tile, screenPos.x, screenPos.y, x, y);
            }
        }
    }

    renderBackground(ctx, camera) {
        // Dark hellish gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a0a0a');
        gradient.addColorStop(0.5, '#0d0505');
        gradient.addColorStop(1, '#0a0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
            ctx.fillRect(0, y, CANVAS_WIDTH, 2);
        }
    }

    renderTile(ctx, tile, screenX, screenY, gridX, gridY) {
        if (tile === TILES.EMPTY) return;

        const x = screenX;
        const y = screenY;
        const size = TILE_SIZE;

        switch (tile) {
            case TILES.SOLID:
                this.renderSolidTile(ctx, x, y, size, gridX, gridY);
                break;
            case TILES.PLATFORM:
                this.renderPlatformTile(ctx, x, y, size);
                break;
            case TILES.SPIKES:
                this.renderSpikeTile(ctx, x, y, size);
                break;
            case TILES.BACKGROUND:
                this.renderBackgroundTile(ctx, x, y, size);
                break;
            case TILES.EXIT:
                this.renderExitTile(ctx, x, y, size);
                break;
        }
    }

    renderSolidTile(ctx, x, y, size, gridX, gridY) {
        // Vary color based on position for visual interest
        const colorVar = ((gridX + gridY) % 3) * 5;

        // Main tile body
        const gradient = ctx.createLinearGradient(x, y, x, y + size);
        gradient.addColorStop(0, `rgb(${50 + colorVar}, ${35 + colorVar}, ${35 + colorVar})`);
        gradient.addColorStop(1, `rgb(${35 + colorVar}, ${25 + colorVar}, ${25 + colorVar})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);

        // Border/edge highlights
        ctx.strokeStyle = '#4a3030';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

        // Inner shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + size - 4, y, 4, size);
        ctx.fillRect(x, y + size - 4, size, 4);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y, size, 2);
        ctx.fillRect(x, y, 2, size);

        // Random texture details
        if ((gridX * 7 + gridY * 13) % 5 === 0) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.2)';
            ctx.fillRect(x + 8, y + 8, 4, 4);
        }
    }

    renderPlatformTile(ctx, x, y, size) {
        // Metal grate platform
        const gradient = ctx.createLinearGradient(x, y, x, y + 8);
        gradient.addColorStop(0, '#5a4a4a');
        gradient.addColorStop(1, '#3a2a2a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, 8);

        // Grate lines
        ctx.strokeStyle = '#2a1a1a';
        ctx.lineWidth = 2;
        for (let i = 4; i < size; i += 8) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i, y + 8);
            ctx.stroke();
        }

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, size, 2);

        // Rivets
        ctx.fillStyle = '#6a5a5a';
        ctx.beginPath();
        ctx.arc(x + 4, y + 4, 2, 0, Math.PI * 2);
        ctx.arc(x + size - 4, y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    renderSpikeTile(ctx, x, y, size) {
        // Blood red spikes
        const spikeCount = 4;
        const spikeWidth = size / spikeCount;

        for (let i = 0; i < spikeCount; i++) {
            const spikeX = x + i * spikeWidth;

            // Spike gradient
            const gradient = ctx.createLinearGradient(spikeX, y + size, spikeX, y);
            gradient.addColorStop(0, '#4a0000');
            gradient.addColorStop(0.5, '#8b0000');
            gradient.addColorStop(1, '#cc2020');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(spikeX, y + size);
            ctx.lineTo(spikeX + spikeWidth / 2, y + 4);
            ctx.lineTo(spikeX + spikeWidth, y + size);
            ctx.closePath();
            ctx.fill();

            // Spike highlight
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spikeX + 2, y + size - 2);
            ctx.lineTo(spikeX + spikeWidth / 2, y + 6);
            ctx.stroke();
        }

        // Base
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(x, y + size - 4, size, 4);
    }

    renderBackgroundTile(ctx, x, y, size) {
        // Darker background tile for decoration
        ctx.fillStyle = 'rgba(20, 10, 10, 0.5)';
        ctx.fillRect(x, y, size, size);

        // Subtle brick pattern
        ctx.strokeStyle = 'rgba(40, 20, 20, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }

    renderExitTile(ctx, x, y, size) {
        // Glowing portal/exit
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;

        // Outer glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20 * pulse;

        // Portal frame
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(x, y, size, size);

        // Inner portal
        const gradient = ctx.createRadialGradient(
            x + size / 2, y + size / 2, 0,
            x + size / 2, y + size / 2, size / 2
        );
        gradient.addColorStop(0, `rgba(0, 255, 0, ${0.8 * pulse})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 0, ${0.5 * pulse})`);
        gradient.addColorStop(1, 'rgba(0, 100, 0, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);

        ctx.shadowBlur = 0;

        // Arrow indicator
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + 8);
        ctx.lineTo(x + size - 8, y + size / 2);
        ctx.lineTo(x + size / 2, y + size - 8);
        ctx.closePath();
        ctx.fill();
    }
}

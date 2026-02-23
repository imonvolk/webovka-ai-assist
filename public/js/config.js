/**
 * DOOM Platformer - Configuration
 * All game constants, tile types, physics, difficulty settings, weapons, and levels
 */

// Tile constants
const TILE_SIZE = 32;

// Tile types
const TILES = {
    EMPTY: 0,
    SOLID: 1,
    PLATFORM: 2,      // One-way platform (can jump through from below)
    SPIKES: 3,
    BACKGROUND: 4,    // Decorative, no collision
    EXIT: 5           // Level exit
};

// Physics constants
const PHYSICS = {
    gravity: 1500,
    maxFallSpeed: 800,
    friction: 0.85
};

// Timing constants
const FPS_UPDATE_INTERVAL = 500;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        playerDamageMultiplier: 0.5,
        enemyHealthMultiplier: 0.7,
        enemyDamageMultiplier: 0.5,
        enemySpeedMultiplier: 0.8,
        scoreMultiplier: 0.5
    },
    normal: {
        playerDamageMultiplier: 1.0,
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        scoreMultiplier: 1.0
    },
    hard: {
        playerDamageMultiplier: 1.5,
        enemyHealthMultiplier: 1.5,
        enemyDamageMultiplier: 1.5,
        enemySpeedMultiplier: 1.3,
        scoreMultiplier: 2.0
    }
};

// Weapons configuration
const WEAPONS = {
    pistol: {
        name: 'PISTOL',
        damage: 25,
        fireRate: 0.25,
        projectileSpeed: 500,
        ammo: Infinity,
        maxAmmo: Infinity,
        spread: 0,
        projectileCount: 1,
        color: '#88ff88',
        projectileType: 'bullet',
        piercing: false,
        explosive: false
    },
    shotgun: {
        name: 'SHOTGUN',
        damage: 15,
        fireRate: 0.8,
        projectileSpeed: 450,
        ammo: 20,
        maxAmmo: 50,
        spread: 0.3,
        projectileCount: 5,
        color: '#ffaa44',
        projectileType: 'pellet',
        piercing: false,
        explosive: false,
        knockback: 300
    },
    machinegun: {
        name: 'MACHINE GUN',
        damage: 12,
        fireRate: 0.1,
        projectileSpeed: 550,
        ammo: 100,
        maxAmmo: 200,
        spread: 0.1,
        projectileCount: 1,
        color: '#ffff44',
        projectileType: 'bullet',
        piercing: true,
        explosive: false
    },
    plasma: {
        name: 'PLASMA GUN',
        damage: 40,
        fireRate: 0.4,
        projectileSpeed: 400,
        ammo: 50,
        maxAmmo: 100,
        spread: 0,
        projectileCount: 1,
        color: '#44aaff',
        projectileType: 'plasma',
        piercing: false,
        explosive: true,
        explosionRadius: 50
    },
    rocket: {
        name: 'ROCKET LAUNCHER',
        damage: 80,
        fireRate: 1.2,
        projectileSpeed: 300,
        ammo: 20,
        maxAmmo: 40,
        spread: 0,
        projectileCount: 1,
        color: '#ff4444',
        projectileType: 'rocket',
        piercing: false,
        explosive: true,
        explosionRadius: 80
    },
    laser: {
        name: 'LASER RIFLE',
        damage: 35,
        fireRate: 0.05,
        projectileSpeed: 1000,
        ammo: 150,
        maxAmmo: 300,
        spread: 0,
        projectileCount: 1,
        color: '#ff00ff',
        projectileType: 'laser',
        piercing: true,
        explosive: false,
        hitscan: true
    }
};

// Level data
const LEVELS = [
    // Level 1 - ENTRANCE TO HELL
    {
        name: "ENTRANCE TO HELL",
        playerStart: { x: 2, y: 11 },
        width: 50,
        height: 15,
        enemies: [
            { type: 'patrol', x: 10, y: 11 },
            { type: 'patrol', x: 31, y: 8 },
            { type: 'patrol', x: 40, y: 6 },
            { type: 'patrol', x: 45, y: 5 }
        ],
        pickups: [
            { type: 'health', x: 8, y: 12 },
            { type: 'shotgun', x: 18, y: 10 },
            { type: 'ammo', x: 36, y: 7 },
            { type: 'health', x: 44, y: 5 },
            { type: 'coin', x: 6, y: 12 },
            { type: 'coin', x: 14, y: 11 },
            { type: 'coin', x: 26, y: 9 },
            { type: 'coin', x: 36, y: 7 },
            { type: 'coin', x: 44, y: 5 }
        ],
        checkpoints: [
            { x: 15, y: 11 },
            { x: 36, y: 7 }
        ],
        data: [
            "11111111111111111111111111111111111111111111111111",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000001",
            "10000000000000000000000000000000000000000000000051",
            "10000000000000000000000000000000000000000000011111",
            "10000000000000000000000000000000000000000111000001",
            "10000000000000000000000000000000000011100000000001",
            "10000000000000000000000000000001110000000000000001",
            "10000000000000000000000001110000000000000000000001",
            "10000000000000000000011100000000000000000000000001",
            "10000000000000000001111000000000000000000000000001",
            "10000000000001111000000000000000000000000000000001",
            "11111111111111111111111111111111111111111111111111",
            "11111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 2 - THE BLOOD PITS
    {
        name: "THE BLOOD PITS",
        playerStart: { x: 2, y: 11 },
        width: 60,
        height: 15,
        enemies: [
            { type: 'patrol', x: 12, y: 11 },
            { type: 'shooter', x: 20, y: 7 },
            { type: 'patrol', x: 28, y: 9 },
            { type: 'flying', x: 35, y: 5 },
            { type: 'shooter', x: 42, y: 3 },
            { type: 'patrol', x: 50, y: 8 },
            { type: 'flying', x: 55, y: 6 }
        ],
        pickups: [
            { type: 'health', x: 10, y: 12 },
            { type: 'ammo', x: 18, y: 10 },
            { type: 'machinegun', x: 25, y: 8 },
            { type: 'health', x: 33, y: 6 },
            { type: 'armor', x: 40, y: 4 },
            { type: 'ammo', x: 48, y: 9 },
            { type: 'health', x: 55, y: 4 },
            { type: 'coin', x: 8, y: 12 },
            { type: 'coin', x: 16, y: 10 },
            { type: 'coin', x: 24, y: 8 },
            { type: 'coin', x: 32, y: 6 },
            { type: 'coin', x: 44, y: 7 },
            { type: 'coin', x: 52, y: 9 }
        ],
        checkpoints: [
            { x: 15, y: 9 },
            { x: 30, y: 5 },
            { x: 47, y: 8 }
        ],
        data: [
            "111111111111111111111111111111111111111111111111111111111111",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000051",
            "100000000000000000000000000000000000000000000000000000011111",
            "100000000000000000000000000000000000000000000000000011100001",
            "100000000000000000000000000000000000000000000000011100000001",
            "100000000000000000000000000000000000000000000111000000000001",
            "100000000000000000000000000000000000000011110000000000000001",
            "100000000000000000000000000000000111100000000000000000000001",
            "100000000000000000000000001111000000000000000000000000000001",
            "100000000000000011111000000000000000000000000000000000000001",
            "100000000011111000000000000000000000000000000000000000000001",
            "111111133311111133311111133311111133311111133311111133311111",
            "111111111111111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 3 - DEMON'S LAIR
    {
        name: "DEMON'S LAIR",
        playerStart: { x: 2, y: 11 },
        width: 70,
        height: 15,
        enemies: [
            { type: 'patrol', x: 10, y: 11 },
            { type: 'flying', x: 18, y: 8 },
            { type: 'shooter', x: 25, y: 6 },
            { type: 'patrol', x: 32, y: 9 },
            { type: 'flying', x: 40, y: 5 },
            { type: 'shooter', x: 48, y: 3 },
            { type: 'patrol', x: 55, y: 7 },
            { type: 'flying', x: 62, y: 4 },
            { type: 'shooter', x: 67, y: 2 }
        ],
        pickups: [
            { type: 'health', x: 8, y: 12 },
            { type: 'ammo', x: 15, y: 10 },
            { type: 'armor', x: 22, y: 7 },
            { type: 'plasma', x: 30, y: 10 },
            { type: 'health', x: 38, y: 6 },
            { type: 'ammo', x: 46, y: 4 },
            { type: 'rocket', x: 53, y: 8 },
            { type: 'health', x: 60, y: 5 },
            { type: 'invincibility', x: 35, y: 3 },
            { type: 'coin', x: 7, y: 12 },
            { type: 'coin', x: 14, y: 10 },
            { type: 'coin', x: 21, y: 7 },
            { type: 'coin', x: 29, y: 10 },
            { type: 'coin', x: 37, y: 6 },
            { type: 'coin', x: 45, y: 4 },
            { type: 'coin', x: 52, y: 8 },
            { type: 'coin', x: 59, y: 5 },
            { type: 'coin', x: 66, y: 3 }
        ],
        checkpoints: [
            { x: 12, y: 11 },
            { x: 27, y: 6 },
            { x: 42, y: 5 },
            { x: 58, y: 7 }
        ],
        data: [
            "1111111111111111111111111111111111111111111111111111111111111111111111",
            "1000000000000000000000000000000000000000000000000000000000000000000001",
            "1000000000000000000000000000000000000000000000000000000000000000000051",
            "1000000000000000000000000000000000000000000000000000000000000000011111",
            "1000000000000000000000000000000000000000000000000000000000000011100001",
            "1000000000000000000000000000000000000000000000000000000000011100000001",
            "1000000000000000000000000000000000000000000000000000000011000000000001",
            "1000000000000000000000000000000000000000000000000011000000000000000001",
            "1000000000000000000000000000000000000000000000111000000000000000000001",
            "1000000000000000000000000000000000000000011100000000000000000000000001",
            "1000000000000000000000000000000000001110000000000000000000000000000001",
            "1000000000000000000000000000001111000000000000000000000000000000000001",
            "1000000000000000000001111100000000000000000000000000000000000000000001",
            "1111111133311111133311111133311111133311111133311111133311111133311111",
            "1111111111111111111111111111111111111111111111111111111111111111111111"
        ]
    },
    // Level 4 - THE CYBERDEMON'S THRONE
    {
        name: "THE CYBERDEMON'S THRONE",
        playerStart: { x: 3, y: 11 },
        width: 60,
        height: 15,
        enemies: [
            { type: 'boss', x: 45, y: 6 }
        ],
        pickups: [
            { type: 'health', x: 5, y: 12 },
            { type: 'armor', x: 8, y: 12 },
            { type: 'health', x: 12, y: 10 },
            { type: 'ammo', x: 16, y: 10 },
            { type: 'rocket', x: 20, y: 8 },
            { type: 'plasma', x: 24, y: 8 },
            { type: 'health', x: 28, y: 6 },
            { type: 'armor', x: 32, y: 6 },
            { type: 'invincibility', x: 30, y: 3 },
            { type: 'ammo', x: 40, y: 8 },
            { type: 'health', x: 48, y: 10 },
            { type: 'armor', x: 52, y: 10 },
            { type: 'health', x: 55, y: 12 },
            { type: 'coin', x: 10, y: 11 },
            { type: 'coin', x: 15, y: 9 },
            { type: 'coin', x: 22, y: 7 },
            { type: 'coin', x: 30, y: 5 },
            { type: 'coin', x: 38, y: 7 },
            { type: 'coin', x: 45, y: 9 },
            { type: 'coin', x: 50, y: 9 }
        ],
        checkpoints: [
            { x: 10, y: 11 },
            { x: 25, y: 7 },
            { x: 50, y: 9 }
        ],
        data: [
            "111111111111111111111111111111111111111111111111111111111111",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000002220000000000022200000000000002220000000000022200001",
            "100000000000000000000000000000000000000000000000000000000001",
            "100000000000000022200000000000000000000000002220000000000001",
            "100000000000220000000000000000000000000000000000220000000001",
            "100000002200000000000000000000000000000000000000002200000001",
            "100000000000000000000000000000000000000000000000000000000001",
            "111111111111111111111111111111111111111111111111111111111111",
            "111111111111111111111111111111111111111111111111111111111111"
        ]
    }
];

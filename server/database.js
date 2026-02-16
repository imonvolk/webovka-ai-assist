const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'game.db');

let db = null;

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('✅ Database loaded from file');
    } else {
        db = new SQL.Database();
        console.log('✅ New database created');
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            coins INTEGER DEFAULT 0,
            high_score INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            level INTEGER NOT NULL,
            coins INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS game_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            save_data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_high_score ON users(high_score DESC)`);

    // Save database to file
    saveDatabase();
    
    console.log('✅ Database initialized successfully');
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        fs.writeFileSync(dbPath, data);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    if (db) {
        saveDatabase();
    }
}, 30000);

// Save on exit
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
    saveDatabase();
    process.exit(0);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function executeQuery(sql, params = []) {
    try {
        const result = db.exec(sql, params);
        saveDatabase();
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

function runStatement(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
}

function getOne(sql, params = []) {
    const result = db.exec(sql, params);
    if (result.length > 0 && result[0].values.length > 0) {
        const columns = result[0].columns;
        const values = result[0].values[0];
        const row = {};
        columns.forEach((col, i) => {
            row[col] = values[i];
        });
        return row;
    }
    return null;
}

function getAll(sql, params = []) {
    const result = db.exec(sql, params);
    if (result.length > 0) {
        const columns = result[0].columns;
        return result[0].values.map(values => {
            const row = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            return row;
        });
    }
    return [];
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

module.exports = {
    init: initDatabase,
    
    // User functions
    getUserByUsername: (username) => {
        return getOne('SELECT * FROM users WHERE username = ?', [username]);
    },
    
    getUserByEmail: (email) => {
        return getOne('SELECT * FROM users WHERE email = ?', [email]);
    },
    
    getUserById: (id) => {
        return getOne('SELECT * FROM users WHERE id = ?', [id]);
    },
    
    createUser: (username, email, password) => {
        runStatement(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        const user = getOne('SELECT last_insert_rowid() as id');
        return user.id;
    },
    
    updateLastLogin: (id) => {
        runStatement("UPDATE users SET last_login = datetime('now') WHERE id = ?", [id]);
    },
    
    updateHighScore: (id, score) => {
        runStatement('UPDATE users SET high_score = ? WHERE id = ?', [score, id]);
    },
    
    updateCoins: (id, coins) => {
        runStatement('UPDATE users SET coins = ? WHERE id = ?', [coins, id]);
    },
    
    incrementGamesPlayed: (id) => {
        runStatement('UPDATE users SET games_played = games_played + 1 WHERE id = ?', [id]);
    },
    
    // Score functions
    submitScore: (userId, score, level, coins) => {
        runStatement(
            'INSERT INTO scores (user_id, score, level, coins) VALUES (?, ?, ?, ?)',
            [userId, score, level, coins]
        );
        const result = getOne('SELECT last_insert_rowid() as id');
        return result.id;
    },
    
    getUserScores: (userId, limit = 10) => {
        return getAll(
            `SELECT score, level, coins, created_at
             FROM scores
             WHERE user_id = ?
             ORDER BY score DESC
             LIMIT ?`,
            [userId, limit]
        );
    },
    
    getAllTimeLeaderboard: (limit = 100) => {
        return getAll(
            `SELECT 
                u.username,
                u.high_score as score,
                u.coins,
                u.games_played
             FROM users u
             WHERE u.high_score > 0
             ORDER BY u.high_score DESC
             LIMIT ?`,
            [limit]
        );
    },
    
    getDailyLeaderboard: (limit = 100) => {
        return getAll(
            `SELECT 
                u.username,
                MAX(s.score) as score,
                SUM(s.coins) as coins,
                COUNT(s.id) as games_played
             FROM scores s
             JOIN users u ON s.user_id = u.id
             WHERE DATE(s.created_at) = DATE('now')
             GROUP BY s.user_id
             ORDER BY score DESC
             LIMIT ?`,
            [limit]
        );
    },
    
    getWeeklyLeaderboard: (limit = 100) => {
        return getAll(
            `SELECT 
                u.username,
                MAX(s.score) as score,
                SUM(s.coins) as coins,
                COUNT(s.id) as games_played
             FROM scores s
             JOIN users u ON s.user_id = u.id
             WHERE DATE(s.created_at) >= DATE('now', '-7 days')
             GROUP BY s.user_id
             ORDER BY score DESC
             LIMIT ?`,
            [limit]
        );
    },
    
    getUserRank: (userId) => {
        const result = getOne(
            `SELECT COUNT(*) + 1 as rank
             FROM users
             WHERE high_score > (
                 SELECT high_score FROM users WHERE id = ?
             )`,
            [userId]
        );
        return result ? result.rank : null;
    },
    
    // Game save functions
    saveGameProgress: (userId, saveData) => {
        const existing = getOne('SELECT id FROM game_saves WHERE user_id = ?', [userId]);
        if (existing) {
            runStatement(
                `UPDATE game_saves 
                 SET save_data = ?, updated_at = datetime('now')
                 WHERE user_id = ?`,
                [saveData, userId]
            );
        } else {
            runStatement(
                `INSERT INTO game_saves (user_id, save_data)
                 VALUES (?, ?)`,
                [userId, saveData]
            );
        }
    },
    
    loadGameProgress: (userId) => {
        const result = getOne('SELECT save_data FROM game_saves WHERE user_id = ?', [userId]);
        return result ? result.save_data : null;
    },
    
    // Stats functions
    getTotalPlayers: () => {
        const result = getOne('SELECT COUNT(*) as count FROM users');
        return result.count;
    },
    
    getTotalGames: () => {
        const result = getOne('SELECT COUNT(*) as count FROM scores');
        return result.count;
    },
    
    getTopScore: () => {
        const result = getOne('SELECT MAX(high_score) as score FROM users');
        return result ? result.score || 0 : 0;
    }
};

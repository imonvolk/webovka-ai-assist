require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
db.init().then(() => {
    console.log('Database ready');
}).catch(err => {
    console.error('Database init failed:', err);
    process.exit(1);
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for game
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5 // limit each IP to 5 auth requests per windowMs
});

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ============================================================================
// API ROUTES - INFO
// ============================================================================

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Doom Platformer API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile'
            },
            scores: {
                submit: 'POST /api/scores',
                userScores: 'GET /api/scores/user',
                leaderboard: 'GET /api/leaderboard',
                rank: 'GET /api/scores/rank'
            },
            gameData: {
                save: 'POST /api/save',
                load: 'GET /api/save',
                coins: 'POST /api/coins'
            },
            stats: {
                global: 'GET /api/stats'
            }
        },
        documentation: 'See SERVER_README.md'
    });
});

// ============================================================================
// API ROUTES - AUTHENTICATION
// ============================================================================

// Register new user
app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password required' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be 3-20 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existing = await db.getUserByUsername(username);
        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const existingEmail = await db.getUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await db.createUser(username, email, hashedPassword);

        // Generate token
        const token = jwt.sign(
            { id: userId, username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: userId, username, email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Get user
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.updateLastLogin(user.id);

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                coins: user.coins,
                highScore: user.high_score
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            coins: user.coins,
            highScore: user.high_score,
            gamesPlayed: user.games_played,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// ============================================================================
// API ROUTES - SCORES
// ============================================================================

// Submit score
app.post('/api/scores', authenticateToken, async (req, res) => {
    try {
        const { score, level, coins } = req.body;

        if (score === undefined || level === undefined) {
            return res.status(400).json({ error: 'Score and level required' });
        }

        const scoreId = await db.submitScore(req.user.id, score, level, coins || 0);

        // Update user high score if needed
        const user = await db.getUserById(req.user.id);
        if (!user.high_score || score > user.high_score) {
            await db.updateHighScore(req.user.id, score);
        }

        // Update coins
        if (coins) {
            await db.updateCoins(req.user.id, user.coins + coins);
        }

        // Increment games played
        await db.incrementGamesPlayed(req.user.id);

        res.json({
            message: 'Score submitted',
            scoreId,
            newHighScore: !user.high_score || score > user.high_score
        });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// Get user's scores
app.get('/api/scores/user', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const scores = await db.getUserScores(req.user.id, limit);
        res.json({ scores });
    } catch (error) {
        console.error('Get user scores error:', error);
        res.status(500).json({ error: 'Failed to get scores' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const timeframe = req.query.timeframe || 'all'; // all, daily, weekly

        let leaderboard;
        switch (timeframe) {
            case 'daily':
                leaderboard = await db.getDailyLeaderboard(limit);
                break;
            case 'weekly':
                leaderboard = await db.getWeeklyLeaderboard(limit);
                break;
            default:
                leaderboard = await db.getAllTimeLeaderboard(limit);
        }

        res.json({ leaderboard, timeframe });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Get player rank
app.get('/api/scores/rank', authenticateToken, async (req, res) => {
    try {
        const rank = await db.getUserRank(req.user.id);
        res.json({ rank });
    } catch (error) {
        console.error('Get rank error:', error);
        res.status(500).json({ error: 'Failed to get rank' });
    }
});

// ============================================================================
// API ROUTES - USER DATA
// ============================================================================

// Save game progress
app.post('/api/save', authenticateToken, async (req, res) => {
    try {
        const { saveData } = req.body;

        if (!saveData) {
            return res.status(400).json({ error: 'Save data required' });
        }

        await db.saveGameProgress(req.user.id, JSON.stringify(saveData));

        res.json({ message: 'Game saved successfully' });
    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({ error: 'Failed to save game' });
    }
});

// Load game progress
app.get('/api/save', authenticateToken, async (req, res) => {
    try {
        const saveData = await db.loadGameProgress(req.user.id);

        if (!saveData) {
            return res.status(404).json({ error: 'No save data found' });
        }

        res.json({ saveData: JSON.parse(saveData) });
    } catch (error) {
        console.error('Load game error:', error);
        res.status(500).json({ error: 'Failed to load game' });
    }
});

// Update coins
app.post('/api/coins', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;

        if (amount === undefined) {
            return res.status(400).json({ error: 'Amount required' });
        }

        const user = await db.getUserById(req.user.id);
        const newBalance = user.coins + amount;

        if (newBalance < 0) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        await db.updateCoins(req.user.id, newBalance);

        res.json({ coins: newBalance });
    } catch (error) {
        console.error('Update coins error:', error);
        res.status(500).json({ error: 'Failed to update coins' });
    }
});

// ============================================================================
// API ROUTES - STATS
// ============================================================================

// Get game statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {
            totalPlayers: await db.getTotalPlayers(),
            totalGames: await db.getTotalGames(),
            topScore: await db.getTopScore()
        };
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// ============================================================================
// STATIC FILES
// ============================================================================

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`\n🎮 Doom Platformer Server`);
    console.log(`================================`);
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Database: Supabase`);
    console.log(`================================\n`);
});

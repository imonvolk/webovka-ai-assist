# Doom Platformer - SQLite Backend

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode with auto-restart
npm run dev
```

Server runs at: `http://localhost:3000`

## 📦 Dependencies

- **express** - Web framework
- **better-sqlite3** - SQLite database (no separate installation needed!)
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting
- **dotenv** - Environment configuration

## 🗄️ Database

- **Type**: SQLite
- **File**: `game.db` (auto-created on first run)
- **Location**: Project root
- **No setup required** - database initializes automatically

### Tables

1. **users** - User accounts (username, email, password, coins, high_score)
2. **scores** - Game scores history
3. **game_saves** - Saved game progress

## 🔐 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Scores

#### Submit Score
```http
POST /api/scores
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 15000,
  "level": 3,
  "coins": 250
}
```

#### Get User Scores
```http
GET /api/scores/user?limit=10
Authorization: Bearer <token>
```

#### Get Leaderboard
```http
GET /api/leaderboard?timeframe=all&limit=100

# timeframe options: all, daily, weekly
```

#### Get Player Rank
```http
GET /api/scores/rank
Authorization: Bearer <token>
```

### Game Data

#### Save Game
```http
POST /api/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "saveData": {
    "level": 2,
    "health": 75,
    "weapons": ["pistol", "shotgun"],
    "checkpoint": { "x": 100, "y": 200 }
  }
}
```

#### Load Game
```http
GET /api/save
Authorization: Bearer <token>
```

#### Update Coins
```http
POST /api/coins
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50
}
```

### Statistics

#### Get Game Stats
```http
GET /api/stats
```

Returns:
```json
{
  "totalPlayers": 1523,
  "totalGames": 8942,
  "topScore": 42500
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: 7-day expiry tokens
- **Rate Limiting**: 100 requests per 15 minutes, 5 auth requests per 15 minutes
- **Helmet**: Security headers
- **CORS**: Cross-origin protection
- **Input Validation**: All endpoints validate input

## 🎮 Frontend Integration Example

```javascript
// Login
async function login(username, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
}

// Submit score
async function submitScore(score, level, coins) {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, level, coins })
    });
    return await response.json();
}

// Get leaderboard
async function getLeaderboard(timeframe = 'all') {
    const response = await fetch(`http://localhost:3000/api/leaderboard?timeframe=${timeframe}`);
    return await response.json();
}
```

## 🛠️ Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
```

**⚠️ Important**: Change `JWT_SECRET` in production!

## 📊 Database Management

```javascript
// Access database directly (server-side only)
const db = require('./database');

// Run custom queries
const users = db.db.prepare('SELECT * FROM users WHERE coins > ?').all(1000);
```

## 🚢 Deployment

1. Install dependencies: `npm install`
2. Set environment variables (`.env` or hosting platform)
3. Start server: `npm start`
4. Database file (`game.db`) is created automatically
5. **Backup `game.db` regularly!**

## 📝 Notes

- Database file is **portable** - just copy `game.db`
- No separate database server needed
- Perfect for VPS, shared hosting, or local development
- WAL mode enabled for better performance
- Automatic indexes for fast queries

## 🔍 Testing with curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get leaderboard
curl http://localhost:3000/api/leaderboard?limit=10
```

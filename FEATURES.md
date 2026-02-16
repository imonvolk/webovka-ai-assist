# Doom Platformer - Online Features

## ✅ What's Integrated

### **Main Menu**
- Press **M** to open Login/Register screen
- Shows login status and online rank
- "Press M to Login/Register (Online Features)" prompt

### **Authentication UI**
- Full in-game login/register screen
- Type username, email (register only), password
- **TAB** to switch between Login/Register modes
- **UP/DOWN arrows** to switch fields
- **ENTER** to submit
- **ESC** to cancel
- Real-time error messages

### **Online Features (When Logged In)**
- ✅ Automatic score submission on game over
- ✅ Personal high score tracking
- ✅ Global rank display
- ✅ Online coin balance
- ✅ Game save/load to cloud (backend ready, needs UI integration)

### **Game Over Screen**
- Shows if score was submitted online
- "Press M to login" hint if not logged in
- Local vs Online high score distinction

## 🎮 How to Use

### **First Time Setup:**
1. Start the game
2. Press **M** on main menu
3. Switch to **Register** mode (TAB)
4. Enter username, email, password
5. Press **ENTER**
6. You're logged in!

### **Returning Players:**
1. Press **M** on main menu
2. Enter username and password
3. Press **ENTER**
4. Your rank and stats load automatically

### **Playing Online:**
- Just play normally
- Scores auto-submit when you die/win
- Check your rank on the main menu
- Compete on global leaderboards (view via API)

## 🔧 Backend Status

**Running:** http://localhost:3000

**API Endpoints Working:**
- ✅ Register/Login
- ✅ Submit Score
- ✅ Get Profile & Rank
- ✅ Leaderboard (all-time, daily, weekly)
- ✅ Save/Load game
- ✅ Coin management

## 📊 View Leaderboard

Open browser console and run:
```javascript
fetch('http://localhost:3000/api/leaderboard?limit=10')
  .then(r => r.json())
  .then(d => console.table(d.leaderboard));
```

## 🚀 What Still Needs UI

These work via API but need in-game UI:
- [ ] Leaderboard screen (press L in menu?)
- [ ] Cloud save/load buttons
- [ ] Friend system
- [ ] Profile customization

## 🎯 Testing

1. Register a test account
2. Play a game and die
3. Check console for "Score submitted to online leaderboard!"
4. Restart and see your rank on main menu
5. View leaderboard via API (see above)

## 🔑 Controls

- **M** - Open Login/Register (main menu only)
- **TAB** - Switch Login ↔ Register
- **UP/DOWN** - Switch form fields
- **ENTER** - Submit form / Start game
- **ESC** - Close login screen

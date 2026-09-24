# 🎮 Retro Arcade Deluxe (2048 • Snake • Tic-Tac-Toe)

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Games-2048%20|%20Snake%20|%20Tic--Tac--Toe-purple?style=for-the-badge" alt="Arcade Games" />
  <img src="https://img.shields.io/badge/Sound-Web%20Audio%20API-success?style=for-the-badge" alt="Web Audio API" />
</p>

An ultra-modern, aesthetic, and responsive multi-game arcade suite built with pure **HTML5, Vanilla CSS3 (Glassmorphism & CSS Variables)**, and **JavaScript (ES6+)**. Featuring a sleek top navigation bar for seamless game switching between **2048 Deluxe**, **Neon Snake**, and **Neon Tic-Tac-Toe**, with procedural synthesizer audio, switchable themes, celebratory confetti, responsive touch swipe controls, and persistent high scores.

---

## ✨ Features

- 🕹️ **Sleek Top Game Switcher Menu Bar**: Instant zero-reload switching between 2048, Snake, and Tic-Tac-Toe with glowing active tabs and state coordination.
- 💎 **Ultra-Modern Glassmorphism Design**: Frosted glass cards, ambient background lighting orbs, smooth borders, and fluid animations.
- 🎨 **4 Dynamic Switchable Themes** (applied globally to all games):
  - 🌌 **Cyberpunk Glow** (*Default*): Electric purples, deep space blacks, and neon blues.
  - 🌅 **Sunset Horizon**: Warm amber gradients, vivid coral, and dusk violet tones.
  - 🍃 **Emerald Matrix**: Deep forest greens, digital mint highlights, and neon jade glow.
  - ☕ **Classic Warm**: Nostalgic coffee, wood, and warm cream tones inspired by the original 2048.
- 🔊 **Built-in Web Audio Synthesizer**: Procedural sound effects generated in real-time with the browser's native **Web Audio API** (no external `.mp3` assets required). Includes dedicated sounds for moving, tile merges, victory fanfare, and game over, plus a mute toggle.
- 📱 **Fully Responsive & Cross-Platform**:
  - **Desktop Keyboard**: Full support for Arrow keys, `W`, `A`, `S`, `D`, `Space`, and `P`.
  - **Mobile Touch / Swipe**: Native swipe gesture detection for both 2048 and Snake, with tap controls for Tic-Tac-Toe.
- 🏆 **Score Persistence & Celebrations**:
  - Live Score & Best Score tracking saved locally via `localStorage` for each game.
  - Confetti particle explosion canvas upon winning.

---

## 🎮 Included Games

### 1. 🔢 2048 Deluxe
- Slide and merge matching numbers on a 4x4 grid to forge the legendary **2048** tile.
- Features floating merge score indicators, endless mode, pause/resume, and victory confetti.

### 2. 🐍 Neon Snake
- Guide the glowing neon serpent to consume pulsing energy orbs while avoiding walls and self-collision.
- Features particle explosion bursts upon feeding, customizable speed presets (*Casual*, *Normal*, *Turbo*), high score tracking, and touch swipe steering.

### 3. ⭕ Neon Tic-Tac-Toe
- Play against a **Smart Minimax AI** (unbeatable or casual) or challenge a friend in **2-Player Local Pass & Play**.
- Features animated glowing SVG marks, laser-glow win strike lines, turn status indicators, and win/draw score counters.

---

## 🕹️ Controls Guide

| Game | Action | Desktop Controls | Touch / Mobile Controls |
| :--- | :--- | :--- | :--- |
| **All Games** | Switch Game | Click tabs on the top Menu Bar | Tap tabs on the top Menu Bar |
| **All Games** | Theme & Sound | Top right controls | Top right controls |
| **2048** | Move Tiles | <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Swipe in any direction |
| **2048** | Pause / Resume | <kbd>P</kbd> or <kbd>Escape</kbd> | Pause button |
| **Snake** | Steer Snake | <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Swipe Up, Down, Left, Right |
| **Snake** | Pause / Resume | <kbd>Space</kbd>, <kbd>P</kbd>, or <kbd>Escape</kbd> | Pause button |
| **Tic-Tac-Toe** | Place Mark | Mouse click on any cell | Tap on any cell |
| **Tic-Tac-Toe** | Restart Round | Press <kbd>R</kbd> or click New Round | Tap New Round button |

---

## 🚀 Getting Started

No compilers, bundlers, or heavy setups required! You can run this project locally in seconds.

### Option 1: Direct in Browser
Simply double-click [`index.html`](file:///d:/KK-Project/2048%20Game/index.html) or open it with your browser of choice (Chrome, Edge, Firefox, Safari).

### Option 2: Using a Local Web Server

Clone the repository:
```bash
git clone https://github.com/krishnakant09/2048-Game.git
cd 2048-Game
```

Run using Node / `npm`:
```bash
npm start
# or
npx serve .
```
Then open `http://localhost:3000` (or the displayed port) in your browser.

---

## 📁 Project Structure

```
├── index.html       # Single-page multi-game markup with top navigation bar
├── styles.css       # Glassmorphism design system, themes, and game components
├── script.js        # 2048 game engine, Web Audio synth, and theme controller
├── snake.js         # Neon Snake engine with particle physics and canvas renderer
├── tictactoe.js     # Tic-Tac-Toe engine with Minimax AI and 2-Player modes
├── arcade.js        # Coordinator for game switching, tab state, and input routing
├── package.json     # Project configuration and local dev scripts
└── README.md        # Comprehensive documentation and controls guide
```

---

## 📜 License

This project is licensed under the [ISC License](LICENSE). Feel free to customize, modify, and build upon it!

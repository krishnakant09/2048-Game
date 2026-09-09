# 🎮 2048 Deluxe Modern Edition

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Sound-Web%20Audio%20API-success?style=for-the-badge" alt="Web Audio API" />
</p>

An ultra-modern, aesthetic, and responsive edition of the classic **2048** puzzle game. Built with pure **HTML5, Vanilla CSS3 (Glassmorphism & CSS Variables)**, and **JavaScript (ES6+)**, featuring procedural synthesizer audio, switchable themes, celebratory confetti, responsive touch swipe controls, and persistent high scores.

---

## ✨ Features

- 💎 **Ultra-Modern Glassmorphism Design**: Sleek frosted glass cards, subtle ambient light orbs, smooth borders, and fluid animations.
- 🎨 **4 Dynamic Switchable Themes**:
  - 🌌 **Cyberpunk Glow** (*Default*): Electric purples, deep space blacks, and neon blues.
  - 🌅 **Sunset Horizon**: Warm amber gradients, vivid coral, and dusk violet tones.
  - 🍃 **Emerald Matrix**: Deep forest greens, digital mint highlights, and neon jade glow.
  - ☕ **Classic Warm**: Nostalgic coffee, wood, and warm cream tones inspired by the original 2048.
- 🔊 **Built-in Web Audio Synthesizer**: Procedural sound effects generated in real-time with the browser's native **Web Audio API** (no external `.mp3` assets required). Includes dedicated sounds for moving, tile merges, victory fanfare, and game over, plus a mute toggle.
- 📱 **Fully Responsive & Cross-Platform**:
  - **Desktop Keyboard**: Full support for both Arrow keys and `W`, `A`, `S`, `D`.
  - **Mobile Touch / Swipe**: Native swipe gesture detection with configurable swipe threshold.
  - **Virtual On-Screen D-Pad**: Clickable and touch-friendly control panel for accessible gameplay on any device.
- 🏆 **Score Persistence & Celebrations**:
  - Live Score & Best Score tracking saved locally via `localStorage`.
  - Floating score addition badge (`+points`) on merges.
  - Confetti particle explosion canvas upon reaching the **2048** milestone.
  - **Endless Mode**: Ability to "Keep Going" after winning to conquer 4096, 8192, and beyond.
- ⏸️ **Game Pause & Resume**: Pause your game anytime using the `P` key, `Esc`, or in-game buttons without losing progress.

---

## 🎯 How to Play

1. **Slide the Tiles**: Move the tiles on the 4x4 grid in four directions (Up, Down, Left, Right).
2. **Merge Matching Numbers**: When two tiles with the same number collide, they merge into one with double the value ($2 + 2 = 4$, $4 + 4 = 8$, ..., $1024 + 1024 = 2048$).
3. **Reach 2048**: Build your strategy to forge the legendary **2048** tile!
4. **Keep Playing**: Once you reach 2048, choose "Keep Going" to aim for new world-record scores.
5. **Game Over**: The game ends when the board fills up and no adjacent tiles can be merged.

---

## 🕹️ Controls

| Control Type | Keys / Actions |
| :--- | :--- |
| **Arrow Keys** | <kbd>↑</kbd> Up &nbsp;|&nbsp; <kbd>↓</kbd> Down &nbsp;|&nbsp; <kbd>←</kbd> Left &nbsp;|&nbsp; <kbd>→</kbd> Right |
| **WASD Keys** | <kbd>W</kbd> Up &nbsp;|&nbsp; <kbd>S</kbd> Down &nbsp;|&nbsp; <kbd>A</kbd> Left &nbsp;|&nbsp; <kbd>D</kbd> Right |
| **Touch / Mobile** | Swipe Up, Down, Left, or Right anywhere on the screen |
| **On-Screen D-Pad** | Click or tap the virtual directional buttons on the lower panel |
| **Pause / Resume** | Press <kbd>P</kbd> or <kbd>Escape</kbd> |

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
npx serve -l 3000 .
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: VS Code Live Server
If you use VS Code, right-click [`index.html`](file:///d:/KK-Project/2048%20Game/index.html) and select **"Open with Live Server"**.

---

## 📂 Project Structure

```text
2048-Game/
├── index.html       # Semantic HTML5 layout, UI modals, scoreboards & SVG D-Pad
├── styles.css       # Design tokens, themes, glassmorphism, responsive grid & animations
├── script.js        # Core game matrix engine, Web Audio synth, touch & confetti logic
├── package.json     # Project metadata and quick-start scripts
└── README.md        # Documentation and game guide
```

---

## ⚙️ Architecture & Technical Details

- **Zero External Dependencies**: Pure vanilla web standards.
- **Web Audio API**: Procedural frequency oscillators (`sine`, `triangle`, `sawtooth`) paired with exponential gain envelopes create crisp 8-bit / modern hybrid UI audio cues without network latency or file loading.
- **Dynamic Theme Engine**: CSS variables controlled via `data-theme` attribute on the root `<html>` element, saved to `localStorage` for returning players.
- **Canvas Confetti Particle System**: Lightweight physics-based confetti engine with rotation and velocity calculation drawn on an overlay `<canvas>`.
- **Responsive Geometry**: CSS clamp and flex/grid layout ensures the game board scales cleanly on screens from small phones to 4K displays.

---

## 🤝 Contributing

Contributions, feedback, and star ratings are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [ISC License](package.json).

/**
 * 2048 MODERN DELUXE - Game Engine & Audio/Visual Controller
 */

// Global State
let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];
let currentScore = 0;
let bestScore = 0;
let isGameOver = false;
let isPaused = false;
let hasWon = false;
let wonDismissed = false;
let soundEnabled = true;
let currentTheme = "cyberpunk";

// Web Audio API Synth Context
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'merge') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.45);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
        noteGain.gain.setValueAtTime(0.12, now + idx * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
        noteOsc.start(now + idx * 0.1);
        noteOsc.stop(now + idx * 0.1 + 0.25);
      });
    }
  } catch (e) {
    console.warn("Audio playback not supported or blocked", e);
  }
}

// -------------------------------------------------------------
// Core Game Logic & Board Operations
// -------------------------------------------------------------

function getGridCells() {
  const gamearea = document.getElementById("gamearea");
  return gamearea ? gamearea.getElementsByClassName("element") : [];
}

// Ensure board has 16 interactive tiles in DOM
function setupDOMGrid() {
  const gamearea = document.getElementById("gamearea");
  if (!gamearea) return;
  
  // Clear any existing elements and initialize 16 tile slots
  gamearea.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("div");
    tile.className = "element";
    tile.id = `tile-${i}`;
    gamearea.appendChild(tile);
  }
}

function updateDOM(newTileIndex = null, mergedIndices = []) {
  const elements = getGridCells();
  if (elements.length < 16) return;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const val = board[r][c];
      const el = elements[idx];

      // Remove previous animation classes
      el.classList.remove("tile-new", "tile-merged");

      if (val > 0) {
        el.textContent = val;
        el.setAttribute("data-val", val.toString());
      } else {
        el.textContent = "";
        el.removeAttribute("data-val");
      }

      if (newTileIndex === idx) {
        // Trigger reflow to restart animation
        void el.offsetWidth;
        el.classList.add("tile-new");
      } else if (mergedIndices.includes(idx)) {
        void el.offsetWidth;
        el.classList.add("tile-merged");
      }
    }
  }

  // Update Score Displays
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = currentScore;

  if (currentScore > bestScore) {
    bestScore = currentScore;
    localStorage.setItem("2048_best_score", bestScore.toString());
  }

  const bestScoreEl = document.getElementById("bestScore");
  if (bestScoreEl) bestScoreEl.textContent = bestScore;
}

function spawnRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c, idx: r * 4 + c });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  // 90% chance for 2, 10% chance for 4
  const value = Math.random() < 0.9 ? 2 : 4;
  board[randomCell.r][randomCell.c] = value;
  return randomCell.idx;
}

function showScoreAddition(points) {
  if (points <= 0) return;
  const scoreAddition = document.getElementById("scoreAddition");
  if (!scoreAddition) return;

  scoreAddition.textContent = `+${points}`;
  scoreAddition.classList.remove("show");
  void scoreAddition.offsetWidth;
  scoreAddition.classList.add("show");
}

// -------------------------------------------------------------
// Tile Movement Matrix Handlers
// -------------------------------------------------------------

function slideAndMergeRow(row) {
  let filtered = row.filter(val => val !== 0);
  let merged = [];
  let pointsGained = 0;
  let mergeIndicesInRow = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2;
      merged.push(mergedVal);
      pointsGained += mergedVal;
      mergeIndicesInRow.push(merged.length - 1);
      i++; // Skip next since it merged
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < 4) {
    merged.push(0);
  }

  return { newRow: merged, pointsGained, mergeIndicesInRow };
}

function handleMove(direction) {
  if (isGameOver || isPaused) return;

  let moved = false;
  let totalScoreGained = 0;
  let mergedCellIndices = [];

  if (direction === "left") {
    for (let r = 0; r < 4; r++) {
      const oldRow = [...board[r]];
      const res = slideAndMergeRow(oldRow);
      board[r] = res.newRow;
      totalScoreGained += res.pointsGained;

      res.mergeIndicesInRow.forEach(c => {
        mergedCellIndices.push(r * 4 + c);
      });

      if (oldRow.some((val, idx) => val !== board[r][idx])) {
        moved = true;
      }
    }
  } else if (direction === "right") {
    for (let r = 0; r < 4; r++) {
      const oldRow = [...board[r]];
      const reversed = [...oldRow].reverse();
      const res = slideAndMergeRow(reversed);
      const newRow = res.newRow.reverse();
      board[r] = newRow;
      totalScoreGained += res.pointsGained;

      res.mergeIndicesInRow.forEach(cRev => {
        const c = 3 - cRev;
        mergedCellIndices.push(r * 4 + c);
      });

      if (oldRow.some((val, idx) => val !== board[r][idx])) {
        moved = true;
      }
    }
  } else if (direction === "up") {
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const res = slideAndMergeRow(col);
      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== res.newRow[r]) {
          moved = true;
        }
        board[r][c] = res.newRow[r];
      }
      totalScoreGained += res.pointsGained;

      res.mergeIndicesInRow.forEach(r => {
        mergedCellIndices.push(r * 4 + c);
      });
    }
  } else if (direction === "down") {
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const reversed = [...col].reverse();
      const res = slideAndMergeRow(reversed);
      const newCol = res.newRow.reverse();

      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== newCol[r]) {
          moved = true;
        }
        board[r][c] = newCol[r];
      }
      totalScoreGained += res.pointsGained;

      res.mergeIndicesInRow.forEach(rRev => {
        const r = 3 - rRev;
        mergedCellIndices.push(r * 4 + c);
      });
    }
  }

  if (moved) {
    currentScore += totalScoreGained;
    if (totalScoreGained > 0) {
      showScoreAddition(totalScoreGained);
      playSound('merge');
    } else {
      playSound('move');
    }

    const newTileIdx = spawnRandomTile();
    updateDOM(newTileIdx, mergedCellIndices);

    // Check for 2048 win condition
    if (!hasWon && !wonDismissed) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 2048) {
            triggerWin();
            return;
          }
        }
      }
    }

    // Check if game over
    if (checkGameOver()) {
      triggerGameOver();
    }
  }
}

function checkGameOver() {
  // Check for any empty cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  // Check for possible horizontal merges
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === board[r][c + 1]) return false;
    }
  }

  // Check for possible vertical merges
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] === board[r + 1][c]) return false;
    }
  }

  return true;
}

// -------------------------------------------------------------
// Directional Control Functions for Buttons & Keybinds
// -------------------------------------------------------------

function left() { handleMove("left"); }
function right() { handleMove("right"); }
function up() { handleMove("up"); }
function down() { handleMove("down"); }

// -------------------------------------------------------------
// Modals & Game Flow Management
// -------------------------------------------------------------

function init() {
  // Load Saved High Score
  const savedBest = localStorage.getItem("2048_best_score");
  if (savedBest) {
    bestScore = parseInt(savedBest, 10) || 0;
    const bestScoreEl = document.getElementById("bestScore");
    if (bestScoreEl) bestScoreEl.textContent = bestScore;
  }

  // Load Saved Theme
  const savedTheme = localStorage.getItem("2048_theme") || "cyberpunk";
  changeTheme(savedTheme, false);

  // Load Saved Sound Preference
  const savedSound = localStorage.getItem("2048_sound");
  if (savedSound !== null) {
    soundEnabled = savedSound === "true";
    updateSoundIcon();
  }

  setupDOMGrid();

  // Hide pause button initially on main/splash screen
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.style.display = "none";

  // Show Splash screen initially
  const splash = document.getElementById("splash");
  if (splash) splash.style.display = "flex";
}

function start() {
  const splash = document.getElementById("splash");
  if (splash) splash.style.display = "none";
  startNewGame();
}

function startNewGame() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  currentScore = 0;
  isGameOver = false;
  isPaused = false;
  hasWon = false;
  wonDismissed = false;

  // Show Pause button during active gameplay
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.style.display = "flex";

  // Hide all modals
  hideAllModals();

  // Spawn initial 2 tiles
  setupDOMGrid();
  spawnRandomTile();
  const secondTileIdx = spawnRandomTile();
  updateDOM(secondTileIdx);
}

function pauseGame() {
  const splash = document.getElementById("splash");
  if (isGameOver || (splash && splash.style.display === "flex")) return;
  isPaused = true;
  const pauseModal = document.getElementById("pause");
  if (pauseModal) pauseModal.style.display = "flex";
}

function resumeGame() {
  isPaused = false;
  const pauseModal = document.getElementById("pause");
  if (pauseModal) pauseModal.style.display = "none";
}

function resetGame() {
  hideAllModals();
  startNewGame();
}

function hideAllModals() {
  const splash = document.getElementById("splash");
  const pause = document.getElementById("pause");
  const gameOver = document.getElementById("gameOverModal");
  const win = document.getElementById("winModal");

  if (splash) splash.style.display = "none";
  if (pause) pause.style.display = "none";
  if (gameOver) gameOver.style.display = "none";
  if (win) win.style.display = "none";
}

function triggerGameOver() {
  isGameOver = true;
  playSound('gameover');

  // Hide pause button when game ends
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.style.display = "none";

  const finalScoreVal = document.getElementById("finalScoreVal");
  const finalBestVal = document.getElementById("finalBestVal");
  if (finalScoreVal) finalScoreVal.textContent = currentScore;
  if (finalBestVal) finalBestVal.textContent = bestScore;

  const gameOverModal = document.getElementById("gameOverModal");
  if (gameOverModal) gameOverModal.style.display = "flex";
}

function triggerWin() {
  hasWon = true;
  playSound('win');
  startConfetti();

  const winModal = document.getElementById("winModal");
  if (winModal) winModal.style.display = "flex";
}

function continuePlaying() {
  wonDismissed = true;
  const winModal = document.getElementById("winModal");
  if (winModal) winModal.style.display = "none";
}

// -------------------------------------------------------------
// Theme & Sound Controls
// -------------------------------------------------------------

function changeTheme(themeName, save = true) {
  currentTheme = themeName;
  document.documentElement.setAttribute("data-theme", themeName);
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) themeSelect.value = themeName;

  if (save) {
    localStorage.setItem("2048_theme", themeName);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("2048_sound", soundEnabled.toString());
  updateSoundIcon();
  if (soundEnabled) {
    playSound('move');
  }
}

function updateSoundIcon() {
  const soundIcon = document.getElementById("soundIcon");
  if (soundIcon) {
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
  }
}

// -------------------------------------------------------------
// Keyboard and Touch Event Listeners
// -------------------------------------------------------------

window.addEventListener("keydown", function (e) {
  // Prevent page scroll when using arrow keys
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    left();
  } else if (e.code === "ArrowRight" || e.code === "KeyD") {
    right();
  } else if (e.code === "ArrowUp" || e.code === "KeyW") {
    up();
  } else if (e.code === "ArrowDown" || e.code === "KeyS") {
    down();
  } else if (e.code === "KeyP" || e.code === "Escape") {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }
});

// Touch Swipe Detection
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 35;

window.addEventListener("touchstart", function (e) {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener("touchend", function (e) {
  if (e.changedTouches && e.changedTouches.length > 0) {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleTouchSwipe();
  }
}, { passive: true });

function handleTouchSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) >= minSwipeDistance) {
      if (deltaX > 0) {
        right();
      } else {
        left();
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) >= minSwipeDistance) {
      if (deltaY > 0) {
        down();
      } else {
        up();
      }
    }
  }
}

// -------------------------------------------------------------
// Victory Celebration Confetti Particles
// -------------------------------------------------------------

function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = [];
  const colors = ["#F43F5E", "#FB923C", "#FBBF24", "#34D399", "#38BDF8", "#A855F7", "#EC4899"];

  for (let i = 0; i < 90; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3
    });
  }

  let animationFrame;
  let duration = 0;

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    duration++;

    confettiPieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (duration < 220) {
      animationFrame = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  renderConfetti();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", init);

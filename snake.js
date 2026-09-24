/**
 * ARCADE SUITE - NEON SNAKE ENGINE
 * Modern glassmorphic snake with procedural sound, particle effects,
 * responsive canvas scaling, and dynamic theme synchronization.
 */

(function () {
  const GRID_SIZE = 20; // 20x20 grid
  let canvas, ctx;
  let animationId = null;
  let lastTick = 0;
  let tickInterval = 120; // ms per step

  // Game State
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 15, y: 10 };
  let score = 0;
  let bestScore = 0;
  let isRunning = false;
  let isPaused = false;
  let isGameOver = false;
  let particles = [];
  let foodPulse = 0;

  // Speed Presets
  const SPEEDS = {
    casual: 140,
    normal: 110,
    turbo: 75
  };

  function init() {
    canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    // Load Best Score
    const savedBest = localStorage.getItem("arcade_snake_best");
    if (savedBest) {
      bestScore = parseInt(savedBest, 10) || 0;
      updateBestScoreUI();
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial render
    resetState();
    draw();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Scale for crisp high-DPI displays
    const size = Math.floor(rect.width || 380);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function resetState() {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    particles = [];
    isGameOver = false;
    isPaused = false;
    updateScoreUI();
    spawnFood();
  }

  function spawnFood() {
    let valid = false;
    while (!valid) {
      food.x = Math.floor(Math.random() * GRID_SIZE);
      food.y = Math.floor(Math.random() * GRID_SIZE);
      valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  }

  function start() {
    hideAllModals();
    resetState();
    isRunning = true;
    lastTick = performance.now();
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);

    const pauseBtn = document.getElementById("snakePauseBtn");
    if (pauseBtn) {
      pauseBtn.style.display = "flex";
      pauseBtn.textContent = "Pause";
    }

    if (typeof playSound === "function") {
      playSound("move");
    }
  }

  function pause() {
    if (!isRunning || isGameOver) return;
    isPaused = true;
    const modal = document.getElementById("snakePauseModal");
    if (modal) modal.style.display = "flex";
    const pauseBtn = document.getElementById("snakePauseBtn");
    if (pauseBtn) pauseBtn.textContent = "Resume";
  }

  function resume() {
    if (!isRunning || isGameOver) return;
    isPaused = false;
    const modal = document.getElementById("snakePauseModal");
    if (modal) modal.style.display = "none";
    const pauseBtn = document.getElementById("snakePauseBtn");
    if (pauseBtn) pauseBtn.textContent = "Pause";
    lastTick = performance.now();
  }

  function togglePause() {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }

  function gameOver() {
    isRunning = false;
    isGameOver = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("arcade_snake_best", bestScore.toString());
      updateBestScoreUI();
      if (typeof startConfetti === "function") {
        startConfetti();
      }
    }

    if (typeof playSound === "function") {
      playSound("gameover");
    }

    const pauseBtn = document.getElementById("snakePauseBtn");
    if (pauseBtn) pauseBtn.style.display = "none";

    const finalScore = document.getElementById("snakeFinalScore");
    const finalBest = document.getElementById("snakeFinalBest");
    if (finalScore) finalScore.textContent = score;
    if (finalBest) finalBest.textContent = bestScore;

    const modal = document.getElementById("snakeGameOverModal");
    if (modal) modal.style.display = "flex";
  }

  function hideAllModals() {
    ["snakeSplash", "snakePauseModal", "snakeGameOverModal"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  function gameLoop(now) {
    if (!isRunning) return;

    if (!isPaused) {
      if (now - lastTick >= tickInterval) {
        lastTick = now;
        update();
      }
    }

    foodPulse = (foodPulse + 0.05) % (Math.PI * 2);
    updateParticles();
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  function update() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall Collision Check
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    // Self Collision Check
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Food Collision Check
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScoreUI();
      createEatParticles(head.x, head.y);

      if (typeof playSound === "function") {
        playSound("merge");
      }

      spawnFood();
    } else {
      snake.pop();
    }
  }

  function createEatParticles(gx, gy) {
    const rect = canvas.getBoundingClientRect();
    const cellSize = rect.width / GRID_SIZE;
    const px = (gx + 0.5) * cellSize;
    const py = (gy + 0.5) * cellSize;

    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.2;
      const speed = Math.random() * 3 + 1.5;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        life: 1,
        color: Math.random() > 0.5 ? getThemeColor("--text-accent", "#38bdf8") : "#f43f5e"
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function getThemeColor(varName, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || fallback;
  }

  function draw() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 380;
    const height = rect.height || 380;
    const cellSize = width / GRID_SIZE;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Subtle Neon Grid Background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Food (Pulsing glowing node)
    const foodX = (food.x + 0.5) * cellSize;
    const foodY = (food.y + 0.5) * cellSize;
    const pulseRadius = (cellSize * 0.38) + Math.sin(foodPulse) * 1.5;

    ctx.save();
    const foodColor = getThemeColor("--text-accent", "#38bdf8");
    ctx.shadowColor = foodColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(foodX, foodY, Math.max(2, pulseRadius), 0, Math.PI * 2);
    ctx.fill();

    // Food inner shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(foodX - pulseRadius * 0.25, foodY - pulseRadius * 0.25, pulseRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Snake
    const accent1 = getThemeColor("--text-accent", "#38bdf8");
    const accent2 = getThemeColor("--border-glass-highlight", "#a855f7");

    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const x = seg.x * cellSize;
      const y = seg.y * cellSize;
      const pad = 1.5;
      const isHead = i === 0;

      ctx.save();
      if (isHead) {
        ctx.shadowColor = accent1;
        ctx.shadowBlur = 16;
        ctx.fillStyle = accent1;
      } else {
        const ratio = i / snake.length;
        ctx.fillStyle = ratio > 0.6 ? accent2 : accent1;
        ctx.shadowColor = accent2;
        ctx.shadowBlur = 6;
      }

      // Rounded Segment
      roundRect(ctx, x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, cellSize * 0.28);
      ctx.fill();

      // Snake Head Eyes
      if (isHead) {
        ctx.fillStyle = "#090A10";
        const eyeOffset = cellSize * 0.24;
        const eyeSize = cellSize * 0.14;
        let eye1 = { x: x + eyeOffset, y: y + eyeOffset };
        let eye2 = { x: x + cellSize - eyeOffset, y: y + eyeOffset };

        if (dir.y !== 0) {
          eye1 = { x: x + eyeOffset, y: y + (dir.y > 0 ? cellSize - eyeOffset : eyeOffset) };
          eye2 = { x: x + cellSize - eyeOffset, y: y + (dir.y > 0 ? cellSize - eyeOffset : eyeOffset) };
        } else if (dir.x !== 0) {
          eye1 = { x: x + (dir.x > 0 ? cellSize - eyeOffset : eyeOffset), y: y + eyeOffset };
          eye2 = { x: x + (dir.x > 0 ? cellSize - eyeOffset : eyeOffset), y: y + cellSize - eyeOffset };
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function setDirection(newDir) {
    if (!isRunning || isPaused || isGameOver) return;
    // Disallow 180-degree reverse into self
    if (newDir.x === -dir.x && newDir.y === -dir.y) return;
    nextDir = newDir;
  }

  function updateScoreUI() {
    const el = document.getElementById("snakeScore");
    if (el) el.textContent = score;
  }

  function updateBestScoreUI() {
    const el = document.getElementById("snakeBestScore");
    if (el) el.textContent = bestScore;
  }

  function setSpeed(mode) {
    if (SPEEDS[mode]) {
      tickInterval = SPEEDS[mode];
    }
  }

  // Export public API
  window.snakeGame = {
    init,
    start,
    pause,
    resume,
    togglePause,
    setDirection,
    setSpeed,
    isRunning: () => isRunning && !isPaused && !isGameOver,
    resize: resizeCanvas
  };

  window.addEventListener("DOMContentLoaded", init);
})();

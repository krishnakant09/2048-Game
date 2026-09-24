/**
 * ARCADE SUITE - GAME SWITCHER & COORDINATOR
 * Manages the top navigation menu bar, smooth stage switching,
 * input event routing, and cross-game state.
 */

(function () {
  window.activeGame = "2048";

  const GAME_INFO = {
    "2048": {
      title: '20<span class="highlight">48</span>',
      badge: "DELUXE"
    },
    "snake": {
      title: 'SNA<span class="highlight">KE</span>',
      badge: "NEON"
    },
    "tictactoe": {
      title: 'TIC<span class="highlight">TAC</span>TOE',
      badge: "AI & 2P"
    }
  };

  function init() {
    // Check saved active game or default to 2048
    const savedGame = localStorage.getItem("arcade_active_game") || "2048";
    switchGame(savedGame, false);
    setupInputRouting();
  }

  function switchGame(gameId, playAudio = true) {
    if (!GAME_INFO[gameId]) gameId = "2048";

    // Pause outgoing game if needed
    if (window.activeGame === "snake" && window.snakeGame) {
      if (typeof window.snakeGame.pause === "function") {
        window.snakeGame.pause();
      }
    } else if (window.activeGame === "2048") {
      if (typeof pauseGame === "function" && typeof isGameOver !== "undefined" && !isGameOver && typeof isPaused !== "undefined" && !isPaused) {
        // Automatically pause 2048 when navigating away
        pauseGame();
      }
    }

    window.activeGame = gameId;
    localStorage.setItem("arcade_active_game", gameId);

    // Update Navigation Tabs
    const tabs = document.querySelectorAll(".game-tab");
    tabs.forEach(tab => {
      const isTarget = tab.dataset.game === gameId;
      tab.classList.toggle("active", isTarget);
      tab.setAttribute("aria-selected", isTarget ? "true" : "false");
    });

    // Update Stage Visibility
    const stages = document.querySelectorAll(".game-section");
    stages.forEach(stage => {
      const isTarget = stage.id === `stage-${gameId}`;
      if (isTarget) {
        stage.style.display = "flex";
        stage.classList.add("active");
      } else {
        stage.style.display = "none";
        stage.classList.remove("active");
      }
    });

    // Update Header Brand Title & Badge
    const titleEl = document.getElementById("arcadeTitle");
    const badgeEl = document.getElementById("arcadeBadge");
    if (titleEl && GAME_INFO[gameId]) {
      titleEl.innerHTML = GAME_INFO[gameId].title;
    }
    if (badgeEl && GAME_INFO[gameId]) {
      badgeEl.textContent = GAME_INFO[gameId].badge;
    }

    // Special initialization per game
    if (gameId === "snake" && window.snakeGame) {
      setTimeout(() => {
        if (typeof window.snakeGame.resize === "function") {
          window.snakeGame.resize();
        }
      }, 50);
    }

    if (playAudio && typeof playSound === "function") {
      playSound("move");
    }
  }

  function setupInputRouting() {
    // Keyboard inputs for Snake & Tic-Tac-Toe
    window.addEventListener("keydown", function (e) {
      if (window.activeGame === "snake" && window.snakeGame) {
        if (["ArrowUp", "KeyW"].includes(e.code)) {
          e.preventDefault();
          window.snakeGame.setDirection({ x: 0, y: -1 });
        } else if (["ArrowDown", "KeyS"].includes(e.code)) {
          e.preventDefault();
          window.snakeGame.setDirection({ x: 0, y: 1 });
        } else if (["ArrowLeft", "KeyA"].includes(e.code)) {
          e.preventDefault();
          window.snakeGame.setDirection({ x: -1, y: 0 });
        } else if (["ArrowRight", "KeyD"].includes(e.code)) {
          e.preventDefault();
          window.snakeGame.setDirection({ x: 1, y: 0 });
        } else if (["KeyP", "Space", "Escape"].includes(e.code)) {
          e.preventDefault();
          window.snakeGame.togglePause();
        }
      } else if (window.activeGame === "tictactoe" && window.tttGame) {
        if (e.code === "KeyR") {
          window.tttGame.resetRound();
        }
      }
    });

    // Touch Swipe handling for Snake
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;

    window.addEventListener("touchstart", function (e) {
      if (window.activeGame === "snake" && e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchend", function (e) {
      if (window.activeGame !== "snake" || !window.snakeGame) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) >= minSwipeDistance) {
          window.snakeGame.setDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
        }
      } else {
        if (Math.abs(deltaY) >= minSwipeDistance) {
          window.snakeGame.setDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
        }
      }
    }, { passive: true });
  }

  // Global helper for onclick
  window.switchGame = switchGame;

  window.addEventListener("DOMContentLoaded", init);
})();

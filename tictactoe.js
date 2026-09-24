/**
 * ARCADE SUITE - NEON TIC-TAC-TOE ENGINE
 * Glassmorphic interactive grid, Unbeatable Minimax AI & 2-Player modes,
 * laser win lines, procedural sound effects, and confetti celebrations.
 */

(function () {
  let board = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let gameMode = "ai"; // 'ai' or 'pvp'
  let difficulty = "unbeatable"; // 'unbeatable' or 'casual'
  let isGameOver = false;
  let isAiThinking = false;

  let scores = {
    x: 0,
    o: 0,
    ties: 0
  };

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  function init() {
    loadScores();
    renderBoard();
    updateUI();
  }

  function loadScores() {
    const saved = localStorage.getItem("arcade_ttt_scores");
    if (saved) {
      try {
        scores = JSON.parse(saved);
        updateScoreBoard();
      } catch (e) {}
    }
  }

  function saveScores() {
    localStorage.setItem("arcade_ttt_scores", JSON.stringify(scores));
    updateScoreBoard();
  }

  function renderBoard() {
    const grid = document.getElementById("tttGrid");
    if (!grid) return;

    grid.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.className = "ttt-cell";
      cell.dataset.index = i;
      cell.setAttribute("aria-label", `Cell ${i + 1}`);
      cell.addEventListener("click", () => handleCellClick(i));
      grid.appendChild(cell);
    }
  }

  function handleCellClick(index) {
    if (isGameOver || isAiThinking || board[index] !== "") return;

    makeMove(index, currentPlayer);

    const winResult = checkWinner(board);
    if (winResult) {
      handleGameEnd(winResult);
      return;
    }

    if (isBoardFull(board)) {
      handleGameEnd({ winner: "tie" });
      return;
    }

    // Switch Player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();

    // If AI Mode and it's AI's turn (O)
    if (gameMode === "ai" && currentPlayer === "O") {
      isAiThinking = true;
      updateStatus();
      setTimeout(aiPlay, 320);
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    const grid = document.getElementById("tttGrid");
    if (!grid) return;
    const cell = grid.children[index];
    if (cell) {
      cell.classList.add("filled", player.toLowerCase());
      cell.innerHTML = player === "X"
        ? `<svg class="ttt-mark-x" viewBox="0 0 40 40"><line x1="10" y1="10" x2="30" y2="30" /><line x1="30" y1="10" x2="10" y2="30" /></svg>`
        : `<svg class="ttt-mark-o" viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" /></svg>`;
    }

    if (typeof playSound === "function") {
      playSound(player === "X" ? "move" : "merge");
    }
  }

  function aiPlay() {
    if (isGameOver) {
      isAiThinking = false;
      return;
    }

    let move;
    if (difficulty === "casual" && Math.random() < 0.35) {
      // Casual: random available spot
      const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
      move = available[Math.floor(Math.random() * available.length)];
    } else {
      // Unbeatable: Minimax algorithm
      move = findBestMove(board);
    }

    isAiThinking = false;
    if (move !== undefined && move !== null) {
      makeMove(move, "O");

      const winResult = checkWinner(board);
      if (winResult) {
        handleGameEnd(winResult);
        return;
      }

      if (isBoardFull(board)) {
        handleGameEnd({ winner: "tie" });
        return;
      }

      currentPlayer = "X";
      updateStatus();
    }
  }

  function findBestMove(currentBoard) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        currentBoard[i] = "O";
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(boardState, depth, isMaximizing) {
    const result = checkWinner(boardState);
    if (result) {
      if (result.winner === "O") return 10 - depth;
      if (result.winner === "X") return depth - 10;
    }
    if (isBoardFull(boardState)) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === "") {
          boardState[i] = "O";
          const score = minimax(boardState, depth + 1, false);
          boardState[i] = "";
          maxScore = Math.max(score, maxScore);
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === "") {
          boardState[i] = "X";
          const score = minimax(boardState, depth + 1, true);
          boardState[i] = "";
          minScore = Math.min(score, minScore);
        }
      }
      return minScore;
    }
  }

  function checkWinner(boardState) {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], combo };
      }
    }
    return null;
  }

  function isBoardFull(boardState) {
    return boardState.every(cell => cell !== "");
  }

  function handleGameEnd(result) {
    isGameOver = true;
    isAiThinking = false;
    const grid = document.getElementById("tttGrid");
    const statusText = document.getElementById("tttStatus");

    if (result.winner === "tie") {
      scores.ties++;
      if (statusText) statusText.innerHTML = "🤝 It's a Draw!";
      if (typeof playSound === "function") playSound("gameover");
    } else {
      if (result.winner === "X") {
        scores.x++;
        if (statusText) statusText.innerHTML = gameMode === "ai" ? "🏆 You Won!" : "🏆 Player X Wins!";
        if (typeof startConfetti === "function") startConfetti();
        if (typeof playSound === "function") playSound("win");
      } else {
        scores.o++;
        if (statusText) statusText.innerHTML = gameMode === "ai" ? "🤖 AI Wins!" : "🏆 Player O Wins!";
        if (typeof playSound === "function") playSound(gameMode === "ai" ? "gameover" : "win");
      }

      // Highlight winning combination with laser glow
      if (result.combo && grid) {
        result.combo.forEach(idx => {
          const cell = grid.children[idx];
          if (cell) cell.classList.add("winning-cell");
        });
      }
    }

    saveScores();
  }

  function updateStatus() {
    const statusText = document.getElementById("tttStatus");
    if (!statusText || isGameOver) return;

    if (isAiThinking) {
      statusText.innerHTML = `<span class="thinking-spinner">🤖</span> AI is analyzing moves...`;
    } else if (gameMode === "ai") {
      statusText.innerHTML = currentPlayer === "X"
        ? `Your Turn (<span class="txt-x">X</span>)`
        : `AI's Turn (<span class="txt-o">O</span>)`;
    } else {
      statusText.innerHTML = `Player <span class="txt-${currentPlayer.toLowerCase()}">${currentPlayer}</span>'s Turn`;
    }
  }

  function updateScoreBoard() {
    const scoreX = document.getElementById("tttScoreX");
    const scoreTies = document.getElementById("tttScoreTies");
    const scoreO = document.getElementById("tttScoreO");
    const labelO = document.getElementById("tttLabelO");

    if (scoreX) scoreX.textContent = scores.x;
    if (scoreTies) scoreTies.textContent = scores.ties;
    if (scoreO) scoreO.textContent = scores.o;
    if (labelO) labelO.textContent = gameMode === "ai" ? "AI (O)" : "PLAYER O";
  }

  function resetRound() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameOver = false;
    isAiThinking = false;

    const grid = document.getElementById("tttGrid");
    if (grid) {
      Array.from(grid.children).forEach(cell => {
        cell.className = "ttt-cell";
        cell.innerHTML = "";
      });
    }

    updateStatus();
    if (typeof playSound === "function") playSound("move");
  }

  function resetAllScores() {
    scores = { x: 0, o: 0, ties: 0 };
    saveScores();
    resetRound();
  }

  function setMode(newMode) {
    if (gameMode === newMode) return;
    gameMode = newMode;
    updateScoreBoard();
    resetRound();

    // Toggle active state on buttons
    document.querySelectorAll(".ttt-mode-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === newMode);
    });
  }

  function setDifficulty(newDiff) {
    difficulty = newDiff;
    document.querySelectorAll(".ttt-diff-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.diff === newDiff);
    });
  }

  function updateUI() {
    updateScoreBoard();
    updateStatus();
  }

  // Export public API
  window.tttGame = {
    init,
    resetRound,
    resetAllScores,
    setMode,
    setDifficulty
  };

  window.addEventListener("DOMContentLoaded", init);
})();

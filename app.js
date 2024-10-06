// Game Logic as Provided
function createBoard() {
  const board = Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));

  return {
    getBoard() {
      return board;
    },
    markRowCol(row, col, token) {
      if (board[row][col] === null) {
        board[row][col] = token;
        return true;
      } else {
        return false;
      }
    },
    isFull() {
      return board.every((row) => row.every((cell) => cell !== null));
    },
    reset() {
      board.forEach((row) => row.fill(null));
    },
  };
}

function createPlayer(name, token) {
  return {
    name,
    token,
    markMove(row, col, board) {
      return board.markRowCol(row, col, this.token);
    },
  };
}

const GameController = (() => {
  let board = createBoard();
  let players = [];
  let currentPlayer = 0;
  let gameStarted = false;

  function checkWin() {
    const b = board.getBoard();

    // Check rows and columns
    for (let i = 0; i < 3; i++) {
      if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
        return true;
      }
      if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
        return true;
      }
    }
    // Check diagonals
    if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      return true;
    }
    if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      return true;
    }
    return false;
  }

  function switchPlayer() {
    currentPlayer = (currentPlayer + 1) % 2;
  }

  return {
    startGame(p1, p2) {
      board = createBoard();
      players = [
        createPlayer(p1.name, p1.token),
        createPlayer(p2.name, p2.token),
      ];
      currentPlayer = 0;
      gameStarted = true;
    },
    playerTurn(row, col) {
      if (!gameStarted) {
        alert("Game has not started yet.");
        return false;
      }

      const player = players[currentPlayer];
      const moveMade = player.markMove(row, col, board);

      if (!moveMade) {
        alert("Invalid move! Cell already occupied.");
        return false;
      }

      if (checkWin()) {
        gameStarted = false;
        return { winner: player.name };
      }

      if (board.isFull()) {
        gameStarted = false;
        return { tie: true };
      }

      switchPlayer();
      return { nextPlayer: players[currentPlayer].name };
    },
    getBoard() {
      return board.getBoard();
    },
    resetGame() {
      board.reset();
      gameStarted = false;
    },
    isGameStarted() {
      return gameStarted;
    },
    getCurrentPlayer() {
      return players[currentPlayer];
    },
  };
})();

// UI Integration
document.addEventListener("DOMContentLoaded", () => {
  const firstPlayerInput = document.getElementById("first_player");
  const secondPlayerInput = document.getElementById("second_player");
  const set1Btn1 = document.getElementById("set1-btn1");
  const set1Btn2 = document.getElementById("set1-btn2");
  const set2Btn1 = document.getElementById("set2-btn1");
  const set2Btn2 = document.getElementById("set2-btn2");
  const submitBtn = document.getElementById("submit-btn");
  const boardDiv = document.getElementById("board");
  const turnAnnouncement = document.getElementById("turn");
  const endgameMsg = document.getElementById("endgame-msg");
  const endgameBtns = document.querySelector(".endgame-btns");
  const playAgainBtn = document.getElementById("play-again");
  const exitGameBtn = document.getElementById("exit-game");
  const sidebar = document.getElementById("sidebar");
  const mainSection = document.getElementById("main-section");

  let player1Token = null;
  let player2Token = null;

  // Helper function to toggle active state on token buttons
  function toggleActive(buttons, selectedButton) {
    buttons.forEach((btn) => btn.classList.remove("active"));
    selectedButton.classList.add("active");
  }

  // Event listeners for Player 1 token selection
  set1Btn1.addEventListener("click", () => {
    player1Token = "X";
    toggleActive([set1Btn1, set1Btn2], set1Btn1);
    // Automatically set Player 2 token
    if (player2Token === "X") {
      player2Token = "O";
      toggleActive([set2Btn1, set2Btn2], set2Btn2);
    }
  });

  set1Btn2.addEventListener("click", () => {
    player1Token = "O";
    toggleActive([set1Btn1, set1Btn2], set1Btn2);
    // Automatically set Player 2 token
    if (player2Token === "O") {
      player2Token = "X";
      toggleActive([set2Btn1, set2Btn2], set2Btn1);
    }
  });

  // Event listeners for Player 2 token selection
  set2Btn1.addEventListener("click", () => {
    player2Token = "X";
    toggleActive([set2Btn1, set2Btn2], set2Btn1);
    // Automatically set Player 1 token
    if (player1Token === "X") {
      player1Token = "O";
      toggleActive([set1Btn1, set1Btn2], set1Btn2);
    }
  });

  set2Btn2.addEventListener("click", () => {
    player2Token = "O";
    toggleActive([set2Btn1, set2Btn2], set2Btn2);
    // Automatically set Player 1 token
    if (player1Token === "O") {
      player1Token = "X";
      toggleActive([set1Btn1, set1Btn2], set1Btn1);
    }
  });

  // Handle Submit Button Click
  submitBtn.addEventListener("click", () => {
    const p1Name = firstPlayerInput.value.trim();
    const p2Name = secondPlayerInput.value.trim();

    if (!p1Name || !p2Name) {
      alert("Please enter both player names.");
      return;
    }

    if (!player1Token || !player2Token) {
      alert("Please select tokens for both players.");
      return;
    }

    if (player1Token === player2Token) {
      alert("Players must have different tokens.");
      return;
    }

    // Initialize Game
    GameController.startGame(
      { name: p1Name, token: player1Token },
      { name: p2Name, token: player2Token }
    );

    // Update Turn Announcement
    updateTurnAnnouncement();

    // Hide Sidebar and Show Main Section
    sidebar.classList.add("hidden");
    mainSection.classList.remove("hidden");
  });

  // Function to update the turn announcement
  function updateTurnAnnouncement(message) {
    if (message) {
      turnAnnouncement.textContent = message;
    } else {
      const currentPlayer = GameController.getCurrentPlayer();
      turnAnnouncement.textContent = `${currentPlayer.name}'s (${currentPlayer.token}) turn`;
    }
  }

  // Handle Cell Clicks
  boardDiv.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      if (!GameController.isGameStarted()) {
        return;
      }

      const cellIndex = parseInt(cell.getAttribute("data-set")) - 1;
      const row = Math.floor(cellIndex / 3);
      const col = cellIndex % 3;

      const result = GameController.playerTurn(row, col);

      if (result === false) {
        return; // Invalid move already handled
      }

      // Update the cell with the current player's token
      const board = GameController.getBoard();
      cell.textContent = board[row][col];
      cell.style.pointerEvents = "none"; // Disable further clicks on this cell

      if (result && result.winner) {
        endgameMsg.textContent = `${result.winner} wins!`;
        endgameMsg.classList.remove("hidden");
        endgameBtns.classList.remove("hidden");
        boardDiv.classList.add("blur");
        turnAnnouncement.textContent = "";
      } else if (result && result.tie) {
        endgameMsg.textContent = `It's a tie!`;
        endgameMsg.classList.remove("hidden");
        endgameBtns.classList.remove("hidden");
        boardDiv.classList.add("blur");
        turnAnnouncement.textContent = "";
      } else if (result && result.nextPlayer) {
        updateTurnAnnouncement();
      }
    });
  });

  // Handle Play Again Button
  playAgainBtn.addEventListener("click", () => {
    // Reset Game Logic
    GameController.resetGame();

    // Reset UI
    boardDiv.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.style.pointerEvents = "auto";
    });
    endgameMsg.classList.add("hidden");
    endgameBtns.classList.add("hidden");
    boardDiv.classList.remove("blur");
    updateTurnAnnouncement();

    // Start Game Again
    GameController.startGame(
      { name: firstPlayerInput.value.trim(), token: player1Token },
      { name: secondPlayerInput.value.trim(), token: player2Token }
    );
    updateTurnAnnouncement();
  });

  // Handle Exit Game Button
  exitGameBtn.addEventListener("click", () => {
    // Reset Game Logic
    GameController.resetGame();

    // Reset UI
    boardDiv.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.style.pointerEvents = "auto";
    });
    endgameMsg.classList.add("hidden");
    endgameBtns.classList.add("hidden");
    boardDiv.classList.remove("blur");
    turnAnnouncement.textContent = "Game Ended";

    // Show Sidebar Again
    sidebar.classList.remove("hidden");
    mainSection.classList.add("hidden");
  });
});

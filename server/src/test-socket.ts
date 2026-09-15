import { io } from "socket.io-client";

const player1 = io("http://localhost:5000");
const player2 = io("http://localhost:5000");

let roomCode = "";
let player2Connected = false;

let turnCount = 0;
let gameFinished = false;

// ─────────────────────────────────────
// PLAYER 1 CONNECT
// ─────────────────────────────────────

player1.on("connect", () => {
  console.log("🟢 Rohan connected");

  player1.emit("create_room", "Rohan");
});

// ─────────────────────────────────────
// ROOM CREATED
// ─────────────────────────────────────

player1.on("room_created", (data) => {
  console.log("🏠 Rohan created room:", data.code);

  roomCode = data.code;

  if (player2Connected) {
    joinRoom();
  }
});

// ─────────────────────────────────────
// PLAYER 2 CONNECT
// ─────────────────────────────────────

player2.on("connect", () => {
  console.log("🔵 Rahul connected");

  player2Connected = true;

  if (roomCode) {
    joinRoom();
  }
});

// ─────────────────────────────────────
// JOIN ROOM
// ─────────────────────────────────────

function joinRoom() {
  console.log("➡️ Rahul joining:", roomCode);

  player2.emit("join_room", {
    code: roomCode,
    username: "Rahul",
  });
}

// ─────────────────────────────────────
// ROOM JOINED
// ─────────────────────────────────────

player2.on("room_joined", (data) => {
  console.log("✅ Rahul joined:", data.code);
});

// ─────────────────────────────────────
// PLAYER JOINED
// ─────────────────────────────────────

player1.on("player_joined", (data) => {
  console.log("👥 Players in room:");
  console.log(data.players);

  console.log("🎮 Starting game...");

  player1.emit("start_game");
});

// ─────────────────────────────────────
// GAME STARTED
// ─────────────────────────────────────

player1.on("game_started", (data) => {
  console.log("");
  console.log("🎮 Rohan received game_started:");
  console.log(data);

  console.log(
    "🎨 First drawer:",
    data.drawerId === player1.id ? "Rohan" : "Rahul"
  );

  if (gameFinished) {
    console.log("");
    console.log("🎉 REMATCH TEST PASSED!");
    console.log("✅ Game 1 finished");
    console.log("✅ Room game was cleared");
    console.log("✅ Game 2 started successfully");

    setTimeout(() => {
      player1.disconnect();
      player2.disconnect();
    }, 1000);
  }
});
player2.on("game_started", (data) => {
  console.log("");
  console.log("🎮 Rahul received game_started:");
  console.log(data);
});

// ─────────────────────────────────────
// TURN CHANGED
// ─────────────────────────────────────

player1.on("turn_changed", (data) => {
  turnCount++;

  console.log("");
  console.log(`🔄 Turn ${turnCount} changed:`);
  console.log(data);

  console.log(
    "🎨 Current drawer:",
    data.drawerId === player1.id ? "Rohan" : "Rahul"
  );

  if (turnCount === 5) {
    console.log("⏳ Final turn is starting...");
  }
});

player2.on("turn_changed", (data) => {
  console.log(
    `🔄 Rahul received turn_changed | Round ${data.currentRound}`
  );
});

// ─────────────────────────────────────
// DRAWER WORD
// ─────────────────────────────────────

// Rohan is drawer
player1.on("drawer_word", (data) => {
  console.log(`🔐 Rohan received secret word: ${data.word}`);

  // TEST ONLY:
  // Rahul submits the correct word
  player2.emit("submit_guess", data.word);
});

// Rahul is drawer
player2.on("drawer_word", (data) => {
  console.log(`🔐 Rahul received secret word: ${data.word}`);

  // TEST ONLY:
  // Rohan submits the correct word
  player1.emit("submit_guess", data.word);
});

// ─────────────────────────────────────
// TIMER
// ─────────────────────────────────────

player1.on("timer_tick", (data) => {
  console.log(`⏱️ Rohan timer: ${data.timeLeft}s`);
});

player2.on("timer_tick", (data) => {
  console.log(`⏱️ Rahul timer: ${data.timeLeft}s`);
});

// ─────────────────────────────────────
// SCORE UPDATED
// ─────────────────────────────────────

player1.on("scores_updated", (data) => {
  console.log("");
  console.log("📊 Rohan received scores_updated:");

  console.log(data.players);
});

player2.on("scores_updated", (data) => {
  console.log("");
  console.log("📊 Rahul received scores_updated:");

  console.log(data.players);
});

// ─────────────────────────────────────
// CORRECT GUESS
// ─────────────────────────────────────

player1.on("correct_guess", (data) => {
  console.log("");
  console.log("🎯 Rohan received correct_guess:");
  console.log(data);
});

player2.on("correct_guess", (data) => {
  console.log("");
  console.log("🎯 Rahul received correct_guess:");
  console.log(data);
});

// ─────────────────────────────────────
// WRONG GUESS
// ─────────────────────────────────────

player1.on("guess_submitted", (data) => {
  console.log("❌ Rohan received guess_submitted:");
  console.log(data);
});

player2.on("guess_submitted", (data) => {
  console.log("❌ Rahul received guess_submitted:");
  console.log(data);
});

// ─────────────────────────────────────
// GUESS ERROR
// ─────────────────────────────────────

player1.on("guess_error", (data) => {
  console.log("⚠️ Rohan guess error:", data);
});

player2.on("guess_error", (data) => {
  console.log("⚠️ Rahul guess error:", data);
});

// ─────────────────────────────────────
// GAME FINISHED
// ─────────────────────────────────────

player1.on("game_finished", (data) => {
  console.log("");
  console.log("🏁 Rohan received game_finished:");
  console.log(data);

  gameFinished = true;

  console.log("");
  console.log("🔄 Game 1 finished!");
  console.log("🎮 Trying to start Game 2...");

  setTimeout(() => {
    player1.emit("start_game");
  }, 1000);
});

player2.on("game_finished", (data) => {
  console.log("");
  console.log("🏁 Rahul received game_finished:");
  console.log(data);
});

// ─────────────────────────────────────
// ROOM / START ERRORS
// ─────────────────────────────────────

player1.on("start_game_error", (data) => {
  console.log("❌ Start game failed:", data.message);
});

player2.on("join_room_error", (data) => {
  console.log("❌ Join room failed:", data.message);
});

// ─────────────────────────────────────
// CONNECTION ERRORS
// ─────────────────────────────────────

player1.on("connect_error", (error) => {
  console.log("❌ Rohan connection error:", error.message);
});

player2.on("connect_error", (error) => {
  console.log("❌ Rahul connection error:", error.message);
});

// ─────────────────────────────────────
// FINISH TEST
// ─────────────────────────────────────

function finishTest() {
  setTimeout(() => {
    console.log("");

    console.log("════════════════════════════════");
    console.log("🏁 FULL GAME LIFECYCLE TEST");
    console.log("════════════════════════════════");

    console.log(
      turnCount === 5
        ? "✅ Turn progression PASSED"
        : `❌ Turn progression FAILED (${turnCount} turn changes)`
    );

    console.log(
      gameFinished
        ? "✅ Game finished event PASSED"
        : "❌ Game finished event FAILED"
    );

    console.log("✅ 3 rounds × 2 players tested");

    console.log("════════════════════════════════");

    player1.disconnect();
    player2.disconnect();
  }, 500);
}
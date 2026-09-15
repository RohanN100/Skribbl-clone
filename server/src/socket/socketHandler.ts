import { Server, Socket } from "socket.io";
import { Player } from "../classes/Player.js";
import { RoomManager } from "../classes/RoomManager.js";
import { Game } from "../classes/Game.js";
import { WordService } from "../services/WordService.js";
import { Room } from "../classes/Room.js";
import { prisma } from "../config/prisma.js";

const roomManager = new RoomManager();
const wordService = new WordService();

async function startNextTurn(
  io: Server,
  room: Room,
  notifyTurnChange: boolean = true
): Promise<void> {
  const game = room.getGame();

  if (!game) {
    return;
  }

  if (game.isFinished()) {
    if (game.isFinishHandled()) {
      return;
    }

    game.markFinishHandled();

    if (game.dbGameId !== null) {
      try {
        await prisma.game.update({
          where: {
            id: game.dbGameId,
          },
          data: {
            status: "FINISHED",
            endedAt: new Date(),
            currentRound: game.getTotalRounds(),
          },
        });
      } catch (e) {
        console.warn("⚠️ Could not update DB game finish status:", e);
      }
    }

    room.clearGame();

    console.log("🏁 Game finished and saved");

    io.to(room.id).emit("game_finished", {
      gameId: game.id,
    });

    return;
  }

  const drawer = game.getCurrentDrawer();

  if (!drawer) {
    console.error("❌ No drawer available");
    return;
  }

  const word = await wordService.getRandomWord();

  game.setWord(word);

  if (notifyTurnChange) {
    io.to(room.id).emit("turn_changed", {
      currentRound: game.getCurrentRound(),
      totalRounds: game.getTotalRounds(),
      drawerId: drawer.id,
    });
  }

  io.to(drawer.id).emit("drawer_word", {
    word,
  });

  console.log(
    `🔄 Turn started | Round: ${game.getCurrentRound()} | Drawer: ${drawer.username}`
  );

  console.log(`🔐 Secret word: ${word}`);

  game.startTurnTimer(
    (timeLeft) => {
      io.to(room.id).emit("timer_tick", {
        timeLeft,
      });
    },
    async () => {
      console.log("⏰ Turn timer ended");

      game.nextTurn();

      await startNextTurn(io, room);
    }
  );
}

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // ─────────────────────────────────────
    // CREATE ROOM
    // ─────────────────────────────────────
    socket.on("create_room", async (username: string) => {
      console.log("📥 create_room received:", username);
      if (
        typeof username !== "string" ||
        username.trim().length === 0 ||
        username.trim().length > 20
      ) {
        socket.emit("create_room_error", {
          message: "Username must be between 1 and 20 characters",
        });
        return;
      }

      const cleanUsername = username.trim();
      const player = new Player(socket.id, cleanUsername);

      try {
        const user = await prisma.user.create({
          data: { username: cleanUsername },
        });
        player.userId = user.id;
      } catch (e) {
        console.warn("⚠️ DB User creation skipped:", e);
      }

      const code = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const room = roomManager.createRoom(code);

      try {
        const dbRoom = await prisma.room.create({
          data: { code: room.code },
        });
        room.dbRoomId = dbRoom.id;
      } catch (e) {
        console.warn("⚠️ DB Room creation skipped:", e);
      }

      room.addPlayer(player);
      socket.join(room.id);

      socket.emit("room_created", {
        roomId: room.id,
        code: room.code,
        player: {
          id: player.id,
          username: player.username,
        },
      });

      console.log(`🏠 Room ${room.code} created by ${username}`);
    });

    // ─────────────────────────────────────
    // JOIN ROOM
    // ─────────────────────────────────────
    socket.on(
      "join_room",
      async (data: { code: string; username: string }) => {
        console.log("📥 join_room received:", data);

        if (
          !data ||
          typeof data.code !== "string" ||
          typeof data.username !== "string"
        ) {
          socket.emit("join_room_error", {
            message: "Room code and username are required",
          });
          return;
        }

        const cleanUsername = data.username.trim();
        const cleanCode = data.code.trim().toUpperCase();

        if (cleanUsername.length === 0 || cleanUsername.length > 20) {
          socket.emit("join_room_error", {
            message: "Username must be between 1 and 20 characters",
          });
          return;
        }

        if (cleanCode.length === 0) {
          socket.emit("join_room_error", {
            message: "Room code is required",
          });
          return;
        }

        const room = roomManager.getRoomByCode(cleanCode);

        if (!room) {
          socket.emit("join_room_error", {
            message: "Room not found",
          });
          return;
        }

        if (room.getPlayerCount() >= 8) {
          socket.emit("join_room_error", {
            message: "Room is full",
          });
          return;
        }

        if (room.hasPlayer(socket.id)) {
          socket.emit("join_room_error", {
            message: "You are already in this room",
          });
          return;
        }

        if (room.hasGame()) {
          socket.emit("join_room_error", {
            message: "Game has already started",
          });
          return;
        }

        const player = new Player(socket.id, cleanUsername);

        try {
          const user = await prisma.user.create({
            data: { username: cleanUsername },
          });
          player.userId = user.id;
        } catch (e) {
          console.warn("⚠️ DB User creation on join skipped:", e);
        }

        room.addPlayer(player);
        socket.join(room.id);

        // Send room information to the player who joined
        socket.emit("room_joined", {
          roomId: room.id,
          code: room.code,
          players: room.getPlayerList(),
        });

        // Notify existing players
        socket.to(room.id).emit("player_joined", {
          players: room.getPlayerList(),
        });

        console.log(`👤 ${cleanUsername} joined room ${room.code}`);
      }
    );

    // ─────────────────────────────────────
    // CHAT MESSAGE
    // ─────────────────────────────────────
    socket.on("chat_message", (data: { message: string }) => {
      if (!data || typeof data.message !== "string") {
        socket.emit("chat_error", {
          message: "Message is required",
        });
        return;
      }

      const cleanMessage = data.message.trim();

      if (cleanMessage.length === 0) {
        socket.emit("chat_error", {
          message: "Message cannot be empty",
        });
        return;
      }

      if (cleanMessage.length > 200) {
        socket.emit("chat_error", {
          message: "Message must be 200 characters or less",
        });
        return;
      }

      const room = roomManager.getRoomByPlayerId(socket.id);

      if (!room) {
        socket.emit("chat_error", {
          message: "You are not in a room",
        });
        return;
      }

      const player = room.getPlayer(socket.id);

      if (!player) {
        socket.emit("chat_error", {
          message: "Player not found",
        });
        return;
      }

      io.to(room.id).emit("chat_message", {
        playerId: socket.id,
        username: player.username,
        message: cleanMessage,
      });
    });

    // ─────────────────────────────────────
    // START GAME
    // ─────────────────────────────────────
    socket.on("start_game", async () => {
      console.log(`🎮 start_game requested by ${socket.id}`);

      try {
        const room = roomManager.getRoomByPlayerId(socket.id);

        if (!room) {
          socket.emit("start_game_error", {
            message: "You are not in a room",
          });
          return;
        }

        if (room.hasGame()) {
          socket.emit("start_game_error", {
            message: "Game has already started",
          });
          return;
        }

        if (room.getPlayerCount() < 2) {
          socket.emit("start_game_error", {
            message: "At least 2 players are required",
          });
          return;
        }

        // Create Game
        const game = new Game(crypto.randomUUID(), room.id);

        // Attempt DB persistence if room.dbRoomId exists
        if (room.dbRoomId !== null) {
          try {
            const dbGame = await prisma.game.create({
              data: {
                roomId: room.dbRoomId,
                currentRound: 1,
                totalRounds: 3,
                status: "PLAYING",
                startedAt: new Date(),
              },
            });
            game.dbGameId = dbGame.id;

            for (const player of room.getPlayers()) {
              if (player.userId !== null) {
                await prisma.gamePlayer.create({
                  data: {
                    gameId: dbGame.id,
                    userId: player.userId,
                  },
                }).catch((e) => console.warn("⚠️ Could not link gamePlayer:", e));
              }
            }
          } catch (dbErr) {
            console.warn("⚠️ Database game creation skipped:", dbErr);
          }
        }

        // Add all room players to the in-memory game
        for (const player of room.getPlayers()) {
          game.addPlayer(player);
        }

        // Start game
        game.start();

        // Store game inside room
        room.setGame(game);

        const drawer = game.getCurrentDrawer();

        if (!drawer) {
          throw new Error("No drawer available");
        }

        io.to(room.id).emit("game_started", {
          gameId: game.id,
          currentRound: game.getCurrentRound(),
          totalRounds: game.getTotalRounds(),
          drawerId: drawer.id,
        });

        // Start first turn
        await startNextTurn(io, room, false);

        console.log(`🎮 Game ${game.id} started in room ${room.code}`);
        console.log(`🎨 Drawer: ${drawer.username}`);
      } catch (error) {
        console.error("❌ Failed to start game:", error);

        socket.emit("start_game_error", {
          message: "Failed to start game",
        });
      }
    });

    // ─────────────────────────────────────
    // SUBMIT GUESS
    // ─────────────────────────────────────
    socket.on("submit_guess", async (guess: string) => {
      console.log(`💬 Guess from ${socket.id}: ${guess}`);

      if (typeof guess !== "string" || guess.trim().length === 0) {
        socket.emit("guess_error", {
          message: "Guess is required",
        });
        return;
      }

      if (guess.trim().length > 50) {
        socket.emit("guess_error", {
          message: "Guess must be 50 characters or less",
        });
        return;
      }

      const room = roomManager.getRoomByPlayerId(socket.id);

      if (!room) {
        socket.emit("guess_error", {
          message: "You are not in a room",
        });
        return;
      }

      const game = room.getGame();

      if (!game) {
        socket.emit("guess_error", {
          message: "Game has not started",
        });
        return;
      }

      if (game.isFinished()) {
        socket.emit("guess_error", {
          message: "Game has finished",
        });
        return;
      }

      const drawer = game.getCurrentDrawer();

      if (!drawer) {
        socket.emit("guess_error", {
          message: "No drawer available",
        });
        return;
      }

      if (drawer.id === socket.id) {
        socket.emit("guess_error", {
          message: "Drawer cannot submit a guess",
        });
        return;
      }

      if (game.hasGuessed(socket.id)) {
        socket.emit("guess_error", {
          message: "You already guessed correctly",
        });
        return;
      }

      const correctWord = game.getWord();

      if (!correctWord) {
        socket.emit("guess_error", {
          message: "No active word",
        });
        return;
      }

      const normalizedGuess = guess.trim().toLowerCase();
      const normalizedWord = correctWord.trim().toLowerCase();

      // Check answer
      if (normalizedGuess === normalizedWord) {
        const POINTS = 100;

        game.addScore(socket.id, POINTS);
        game.markPlayerGuessed(socket.id);

        const player = room.getPlayer(socket.id);

        if (game.dbGameId !== null && player?.userId) {
          try {
            await prisma.gamePlayer.update({
              where: {
                gameId_userId: {
                  gameId: game.dbGameId,
                  userId: player.userId,
                },
              },
              data: {
                score: {
                  increment: POINTS,
                },
              },
            });
          } catch (e) {
            console.warn("⚠️ Could not update DB score:", e);
          }
        }

        io.to(room.id).emit("scores_updated", {
          players: room.getPlayerList(),
        });

        io.to(room.id).emit("correct_guess", {
          playerId: socket.id,
          username: player?.username || "Player",
          points: POINTS,
        });

        console.log(`✅ ${player?.username} guessed correctly! +${POINTS}`);
        return;
      }

      // Wrong guess
      const player = room.getPlayer(socket.id);

      io.to(room.id).emit("guess_submitted", {
        playerId: socket.id,
        username: player?.username,
        guess,
      });

      console.log(`❌ Wrong guess by ${player?.username}: ${guess}`);
    });

    // ─────────────────────────────────────
    // DRAWING EVENTS
    // ─────────────────────────────────────
    socket.on("draw_start", (data: { x: number; y: number }) => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room) return;

      const game = room.getGame();
      if (!game || game.isFinished()) return;

      const drawer = game.getCurrentDrawer();
      if (!drawer || drawer.id !== socket.id) return;

      socket.to(room.id).emit("draw_start", {
        x: data.x,
        y: data.y,
      });
    });

    socket.on("draw_move", (data: { x: number; y: number }) => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room) return;

      const game = room.getGame();
      if (!game || game.isFinished()) return;

      const drawer = game.getCurrentDrawer();
      if (!drawer || drawer.id !== socket.id) return;

      socket.to(room.id).emit("draw_move", {
        x: data.x,
        y: data.y,
      });
    });

    socket.on("draw_end", () => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room) return;

      const game = room.getGame();
      if (!game || game.isFinished()) return;

      const drawer = game.getCurrentDrawer();
      if (!drawer || drawer.id !== socket.id) return;

      socket.to(room.id).emit("draw_end");
    });

    // ─────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────
    socket.on("disconnect", () => {
      const room = roomManager.removePlayerFromRoom(socket.id);

      if (!room) {
        console.log(`❌ Player ${socket.id} disconnected`);
        return;
      }

      console.log(`❌ Player ${socket.id} left room ${room.code}`);

      io.to(room.id).emit("player_left", {
        playerId: socket.id,
        players: room.getPlayerList(),
      });

      const game = room.getGame();
      if (game) {
        game.stopTurnTimer();
        console.log("⏹️ Game timer stopped");
      }

      if (room.getPlayerCount() === 0) {
        roomManager.deleteRoom(room.id);
        console.log(`🗑️ Room ${room.code} deleted`);
      }
    });
  });
}
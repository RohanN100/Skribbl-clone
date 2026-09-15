import React, { useState, useEffect, useCallback } from "react";
import { socket } from "./socket/socket";
import { Header } from "./components/Header";
import { HomeView } from "./components/HomeView";
import { LobbyView } from "./components/LobbyView";
import { GameView } from "./components/GameView";
import { GameOverView } from "./components/GameOverView";
import type {
  Player,
  ChatMessage,
  GameStatus,
  RoomCreatedPayload,
  RoomJoinedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  GameStartedPayload,
  TurnChangedPayload,
  DrawerWordPayload,
  TimerTickPayload,
  GuessSubmittedPayload,
  CorrectGuessPayload,
  ScoresUpdatedPayload,
  ChatMessagePayload,
  GameFinishedPayload,
  ErrorPayload,
} from "./types";

export const App: React.FC = () => {
  // Connection State
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Game Room State
  const [username, setUsername] = useState<string>("");
  const [_roomId, setRoomId] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);

  // Turn & Game State
  const [gameStatus, setGameStatus] = useState<GameStatus>("HOME");
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [drawerId, setDrawerId] = useState<string>("");
  const [isDrawer, setIsDrawer] = useState<boolean>(false);
  const [secretWord, setSecretWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // System Chat Helper
  const addSystemMessage = useCallback((text: string, type: ChatMessage["type"] = "system") => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        message: text,
        type,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Set up socket listeners with proper cleanup
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {
      setIsConnected(false);
      setError("Failed to connect to server. Please ensure backend is running.");
    };

    // 1) ROOM CREATED
    const onRoomCreated = (data: RoomCreatedPayload) => {
      setIsLoading(false);
      setRoomId(data.roomId);
      setRoomCode(data.code);
      setPlayers([
        {
          id: data.player.id,
          username: data.player.username,
          score: 0,
        },
      ]);
      setGameStatus("LOBBY");
      setError(null);
      addSystemMessage(`Room created! Share code [${data.code}] with friends.`);
    };

    const onCreateRoomError = (data: ErrorPayload) => {
      setIsLoading(false);
      setError(data.message);
    };

    // 2) ROOM JOINED
    const onRoomJoined = (data: RoomJoinedPayload) => {
      setIsLoading(false);
      setRoomId(data.roomId);
      setRoomCode(data.code);
      setPlayers(data.players);
      setGameStatus("LOBBY");
      setError(null);
      addSystemMessage(`Joined room [${data.code}]!`);
    };

    const onJoinRoomError = (data: ErrorPayload) => {
      setIsLoading(false);
      setError(data.message);
    };

    // 3) LOBBY EVENTS
    const onPlayerJoined = (data: PlayerJoinedPayload) => {
      setPlayers(data.players);
      const newestPlayer = data.players[data.players.length - 1];
      if (newestPlayer) {
        addSystemMessage(`👤 ${newestPlayer.username} joined the room.`);
      }
    };

    const onPlayerLeft = (data: PlayerLeftPayload) => {
      setPlayers(data.players);
      addSystemMessage(`❌ A player left the room.`);
    };

    // 4) START GAME
    const onGameStarted = (data: GameStartedPayload) => {
      setIsLoading(false);
      setGameStatus("PLAYING");
      setCurrentRound(data.currentRound);
      setTotalRounds(data.totalRounds);
      setDrawerId(data.drawerId);
      setIsDrawer(data.drawerId === socket.id);
      setError(null);
      addSystemMessage("🎮 Game started! Get ready...");
    };

    const onStartGameError = (data: ErrorPayload) => {
      setIsLoading(false);
      setError(data.message);
    };

    // 5) TURN CHANGED
    const onTurnChanged = (data: TurnChangedPayload) => {
      setCurrentRound(data.currentRound);
      setTotalRounds(data.totalRounds);
      setDrawerId(data.drawerId);
      const isSelfDrawer = data.drawerId === socket.id;
      setIsDrawer(isSelfDrawer);

      if (!isSelfDrawer) {
        setSecretWord("");
      }

      // Find drawer username
      setPlayers((prevPlayers) => {
        const d = prevPlayers.find((p) => p.id === data.drawerId);
        if (d) {
          addSystemMessage(`🎨 Round ${data.currentRound}: ${d.username} is now drawing!`);
        }
        return prevPlayers;
      });
    };

    // 6) SECRET WORD (ONLY DRAWER RECEIVES)
    const onDrawerWord = (data: DrawerWordPayload) => {
      setSecretWord(data.word);
    };

    // 7) TIMER TICK
    const onTimerTick = (data: TimerTickPayload) => {
      setTimeLeft(data.timeLeft);
    };

    // 8) GUESS EVENTS
    const onGuessSubmitted = (data: GuessSubmittedPayload) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          playerId: data.playerId,
          username: data.username || "Player",
          message: data.guess,
          type: "guess",
          timestamp: Date.now(),
        },
      ]);
    };

    const onCorrectGuess = (data: CorrectGuessPayload) => {
      addSystemMessage(
        `🎉 ${data.username || "A player"} guessed the word! (+${data.points} pts)`,
        "correct"
      );
    };

    const onScoresUpdated = (data: ScoresUpdatedPayload) => {
      setPlayers(data.players);
    };

    const onGuessError = (data: ErrorPayload) => {
      setError(data.message);
    };

    // 9) CHAT MESSAGES
    const onChatMessage = (data: ChatMessagePayload) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          playerId: data.playerId,
          username: data.username,
          message: data.message,
          type: "chat",
          timestamp: Date.now(),
        },
      ]);
    };

    const onChatError = (data: ErrorPayload) => {
      setError(data.message);
    };

    // 10) GAME FINISHED
    const onGameFinished = (_data: GameFinishedPayload) => {
      setGameStatus("FINISHED");
      addSystemMessage("🏁 Game finished! Checking final leaderboard...", "correct");
    };

    // Register all socket event handlers
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("room_created", onRoomCreated);
    socket.on("create_room_error", onCreateRoomError);
    socket.on("room_joined", onRoomJoined);
    socket.on("join_room_error", onJoinRoomError);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_left", onPlayerLeft);
    socket.on("game_started", onGameStarted);
    socket.on("start_game_error", onStartGameError);
    socket.on("turn_changed", onTurnChanged);
    socket.on("drawer_word", onDrawerWord);
    socket.on("timer_tick", onTimerTick);
    socket.on("guess_submitted", onGuessSubmitted);
    socket.on("correct_guess", onCorrectGuess);
    socket.on("scores_updated", onScoresUpdated);
    socket.on("guess_error", onGuessError);
    socket.on("chat_message", onChatMessage);
    socket.on("chat_error", onChatError);
    socket.on("game_finished", onGameFinished);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("room_created", onRoomCreated);
      socket.off("create_room_error", onCreateRoomError);
      socket.off("room_joined", onRoomJoined);
      socket.off("join_room_error", onJoinRoomError);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_left", onPlayerLeft);
      socket.off("game_started", onGameStarted);
      socket.off("start_game_error", onStartGameError);
      socket.off("turn_changed", onTurnChanged);
      socket.off("drawer_word", onDrawerWord);
      socket.off("timer_tick", onTimerTick);
      socket.off("guess_submitted", onGuessSubmitted);
      socket.off("correct_guess", onCorrectGuess);
      socket.off("scores_updated", onScoresUpdated);
      socket.off("guess_error", onGuessError);
      socket.off("chat_message", onChatMessage);
      socket.off("chat_error", onChatError);
      socket.off("game_finished", onGameFinished);
    };
  }, [addSystemMessage]);

  // Handle Create Room emit
  const handleCreateRoom = (name: string) => {
    setIsLoading(true);
    setError(null);
    socket.emit("create_room", name);
  };

  // Handle Join Room emit
  const handleJoinRoom = (code: string, name: string) => {
    setIsLoading(true);
    setError(null);
    socket.emit("join_room", { code, username: name });
  };

  // Handle Start Game emit
  const handleStartGame = () => {
    setIsLoading(true);
    setError(null);
    socket.emit("start_game");
  };

  // Handle Send Chat Message emit
  const handleSendMessage = (message: string) => {
    setError(null);
    socket.emit("chat_message", { message });
  };

  // Handle Submit Guess emit
  const handleSendGuess = (guess: string) => {
    setError(null);
    socket.emit("submit_guess", guess);
  };

  // Play Again: Returns to lobby and reuses the same room/socket
  const handlePlayAgain = () => {
    setGameStatus("LOBBY");
    setCurrentRound(0);
    setDrawerId("");
    setIsDrawer(false);
    setSecretWord("");
    setTimeLeft(0);
    setError(null);
    addSystemMessage("Returned to lobby! Click Start Game when ready.");
  };

  // Back to Home: Disconnect / Leave room
  const handleBackToHome = () => {
    socket.disconnect();
    socket.connect();
    setGameStatus("HOME");
    setRoomId("");
    setRoomCode("");
    setPlayers([]);
    setChatMessages([]);
    setSecretWord("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header
        isConnected={isConnected}
        username={username}
        roomCode={roomCode}
        onLeaveRoom={gameStatus !== "HOME" ? handleBackToHome : undefined}
      />

      <main className="flex-1 flex flex-col">
        {gameStatus === "HOME" && (
          <HomeView
            username={username}
            setUsername={setUsername}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            error={error}
            isLoading={isLoading}
          />
        )}

        {gameStatus === "LOBBY" && (
          <LobbyView
            roomCode={roomCode}
            players={players}
            currentSocketId={socket.id || ""}
            onStartGame={handleStartGame}
            onSendMessage={handleSendMessage}
            chatMessages={chatMessages}
            error={error}
          />
        )}

        {gameStatus === "PLAYING" && (
          <GameView
            currentRound={currentRound}
            totalRounds={totalRounds}
            drawerId={drawerId}
            isDrawer={isDrawer}
            secretWord={secretWord}
            timeLeft={timeLeft}
            players={players}
            currentSocketId={socket.id || ""}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onSendGuess={handleSendGuess}
            error={error}
          />
        )}

        {gameStatus === "FINISHED" && (
          <GameOverView
            players={players}
            currentSocketId={socket.id || ""}
            onPlayAgain={handlePlayAgain}
            onBackToHome={handleBackToHome}
          />
        )}
      </main>
    </div>
  );
};

export default App;

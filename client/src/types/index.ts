export interface Player {
  id: string;
  username: string;
  score: number;
  isDrawing?: boolean;
}

export type MessageType = "chat" | "system" | "correct" | "error" | "guess";

export interface ChatMessage {
  id: string;
  playerId?: string;
  username?: string;
  message: string;
  type: MessageType;
  timestamp: number;
}

export type GameStatus = "HOME" | "LOBBY" | "PLAYING" | "FINISHED";

export interface RoomCreatedPayload {
  roomId: string;
  code: string;
  player: {
    id: string;
    username: string;
  };
}

export interface RoomJoinedPayload {
  roomId: string;
  code: string;
  players: Player[];
}

export interface PlayerJoinedPayload {
  players: Player[];
}

export interface PlayerLeftPayload {
  playerId: string;
  players: Player[];
}

export interface GameStartedPayload {
  gameId: string;
  currentRound: number;
  totalRounds: number;
  drawerId: string;
}

export interface TurnChangedPayload {
  currentRound: number;
  totalRounds: number;
  drawerId: string;
}

export interface DrawerWordPayload {
  word: string;
}

export interface TimerTickPayload {
  timeLeft: number;
}

export interface DrawStartPayload {
  x: number;
  y: number;
}

export interface DrawMovePayload {
  x: number;
  y: number;
}

export interface GuessSubmittedPayload {
  playerId: string;
  username?: string;
  guess: string;
}

export interface CorrectGuessPayload {
  playerId: string;
  username?: string;
  points: number;
}

export interface ScoresUpdatedPayload {
  players: Player[];
}

export interface ChatMessagePayload {
  playerId: string;
  username: string;
  message: string;
}

export interface GameFinishedPayload {
  gameId: string;
}

export interface ErrorPayload {
  message: string;
}

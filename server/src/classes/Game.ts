import { Player } from "./Player.js";

export type GameStatus = "WAITING" | "PLAYING" | "FINISHED";

export class Game {
  public readonly id: string;
  public readonly roomId: string;
  public dbGameId: number | null;

  private players: Player[];
  private currentRound: number;
  private totalRounds: number;
  private currentDrawerIndex: number;
  private currentWord: string | null;
  private status: GameStatus;
  private turnDuration: number;
private turnTimer: ReturnType<typeof setInterval> | null;
  private guessedPlayers: Set<string>;
  private finishHandled: boolean;
  
  

  constructor(
    id: string,
    roomId: string,
    totalRounds: number = 3
    
  ) {
    this.id = id;
    this.roomId = roomId;
    this.totalRounds = totalRounds;

    this.players = [];
    this.currentRound = 0;
    this.currentDrawerIndex = 0;
    this.currentWord = null;
    this.status = "WAITING";
    this.turnDuration = 40;
this.turnTimer = null;
    this.guessedPlayers = new Set();
    this.dbGameId = null;
    this.finishHandled = false;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

start(): void {
  if (this.players.length < 2) {
    throw new Error("At least 2 players are required to start");
  }

  this.status = "PLAYING";
  this.currentRound = 1;
  this.currentDrawerIndex = 0;

  // Set first player as drawer
  this.players.forEach((player, index) => {
    player.setDrawingStatus(index === this.currentDrawerIndex);
  });
}

  getCurrentDrawer(): Player | undefined {
    return this.players[this.currentDrawerIndex];
  }

  setWord(word: string): void {
    this.currentWord = word;
  }

  getWord(): string | null {
    return this.currentWord;
  }

nextTurn(): void {
  // Remove drawing status from current drawer
  const currentDrawer = this.getCurrentDrawer();

  if (currentDrawer) {
    currentDrawer.setDrawingStatus(false);
  }

  this.currentDrawerIndex++;

  if (this.currentDrawerIndex >= this.players.length) {
    this.currentDrawerIndex = 0;
    this.currentRound++;
  }

  if (this.currentRound > this.totalRounds) {
    this.status = "FINISHED";
    this.currentWord = null;
    this.resetGuesses();
    return;
  }

  // Set new drawer
  const newDrawer = this.getCurrentDrawer();

  if (newDrawer) {
    newDrawer.setDrawingStatus(true);
  }

  this.currentWord = null;
  this.resetGuesses();
}

  addScore(playerId: string, points: number): void {
    const player = this.players.find(
      (player) => player.id === playerId
    );

    if (player) {
      player.addScore(points);
    }
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getTotalRounds(): number {
    return this.totalRounds;
  }

  getStatus(): GameStatus {
    return this.status;
  }

  isFinished(): boolean {
    return this.status === "FINISHED";
  }


  hasGuessed(playerId: string): boolean {
  return this.guessedPlayers.has(playerId);
}

markPlayerGuessed(playerId: string): void {
  this.guessedPlayers.add(playerId);
}

resetGuesses(): void {
  this.guessedPlayers.clear();
}

startTurnTimer(
  onTick: (timeLeft: number) => void,
  onTurnEnd: () => void
): void {
  this.stopTurnTimer();

  let timeLeft = this.turnDuration;

  onTick(timeLeft);

  this.turnTimer = setInterval(() => {
    timeLeft--;

    onTick(timeLeft);

    if (timeLeft <= 0) {
      this.stopTurnTimer();
      onTurnEnd();
    }
  }, 1000);
}

stopTurnTimer(): void {
  if (this.turnTimer) {
    clearInterval(this.turnTimer);
    this.turnTimer = null;
  }
}

getTurnDuration(): number {
  return this.turnDuration;
}
isFinishHandled(): boolean {
  return this.finishHandled;
}

markFinishHandled(): void {
  this.finishHandled = true;
}
}
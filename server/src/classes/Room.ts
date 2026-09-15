import { Player } from "./Player.js";
import { Game } from "./Game.js";

export class Room {
  public readonly id: string;
  public readonly code: string;
  private players: Map<string, Player>;
  private game: Game | null;
  public dbRoomId: number | null;

  constructor(id: string, code: string) {
    this.id = id;
    this.code = code;
    this.players = new Map();
    this.game = null;
      this.dbRoomId = null;

  }

  addPlayer(player: Player): void {
    this.players.set(player.id, player);
    player.joinRoom(this.id);
  }

  getPlayerList() {
  return this.getPlayers().map((player) => ({
    id: player.id,
    username: player.username,
    score: player.score,
    isDrawing: player.isDrawing,
  }));
}

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);

    if (player) {
      player.leaveRoom();
      this.players.delete(playerId);
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  setGame(game: Game): void {
  this.game = game;
}
clearGame(): void {
  this.game = null;
}

getGame(): Game | null {
  return this.game;
}


hasGame(): boolean {
  return this.game !== null;
}
}


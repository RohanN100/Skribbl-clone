export class Player {
  public readonly id: string;
  public username: string;
  public score: number;
  public roomId: string | null;
  public isDrawing: boolean;
  public userId: number | null;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
    this.score = 0;
    this.roomId = null;
    this.isDrawing = false;
     this.userId = null;
  }

  addScore(points: number): void {
    this.score += points;
  }

  resetScore(): void {
    this.score = 0;
  }

  joinRoom(roomId: string): void {
    this.roomId = roomId;
  }

  leaveRoom(): void {
    this.roomId = null;
    this.isDrawing = false;
  }

  setDrawingStatus(isDrawing: boolean): void {
    this.isDrawing = isDrawing;
  }
}
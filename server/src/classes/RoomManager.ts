import { Room } from "./Room.js";

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(code: string): Room {
    const roomId = crypto.randomUUID();

    const room = new Room(roomId, code);

    this.rooms.set(roomId, room);

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(code: string): Room | undefined {
    return Array.from(this.rooms.values()).find(
      (room) => room.code === code
    );
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.hasPlayer(playerId)) {
        return room;
      }
    }

    return undefined;
  }

  removePlayerFromRoom(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.hasPlayer(playerId)) {
        room.removePlayer(playerId);

        return room;
      }
    }

    return undefined;
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}
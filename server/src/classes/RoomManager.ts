import { randomUUID } from "crypto";
import { Room } from "./Room.js";

function generateUUID(): string {
  try {
    return randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }
}

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(code: string): Room {
    const roomId = generateUUID();
    const cleanCode = code.trim().toUpperCase();

    const room = new Room(roomId, cleanCode);
    this.rooms.set(roomId, room);

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(code: string): Room | undefined {
    if (!code) return undefined;
    const cleanCode = code.trim().toUpperCase();
    return Array.from(this.rooms.values()).find(
      (room) => room.code.trim().toUpperCase() === cleanCode
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
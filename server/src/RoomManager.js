"use strict";

const GameRoom = require("./GameRoom");

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.clientToRoom = new Map();
  }

  generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;
    do {
      code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(ws, playerName) {
    const code = this.generateCode();
    const room = new GameRoom(code);
    room.addPlayer(ws, playerName, 0);
    this.rooms.set(code, room);
    this.clientToRoom.set(ws, code);
    return { code, room };
  }

  joinRoom(code, ws, playerName) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) {
      return { error: "Sala não encontrada." };
    }
    if (room.isFull()) {
      return { error: "Sala cheia." };
    }
    if (room.status !== "waiting") {
      return { error: "Jogo já em andamento." };
    }

    room.addPlayer(ws, playerName, 1);
    this.clientToRoom.set(ws, code.toUpperCase());
    return { room };
  }

  getRoomByClient(ws) {
    const code = this.clientToRoom.get(ws);
    if (!code) return null;
    return this.rooms.get(code);
  }

  removeClient(ws) {
    const code = this.clientToRoom.get(ws);
    if (!code) return;
    const room = this.rooms.get(code);
    if (room) {
      room.removePlayer(ws);
      if (room.isEmpty()) {
        this.rooms.delete(code);
      }
    }
    this.clientToRoom.delete(ws);
  }

  removeRoom(code) {
    const room = this.rooms.get(code);
    if (room) {
      room.players.forEach((p) => {
        if (p && p.ws) {
          this.clientToRoom.delete(p.ws);
        }
      });
      this.rooms.delete(code);
    }
  }
}

module.exports = RoomManager;

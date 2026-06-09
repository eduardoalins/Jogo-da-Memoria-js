"use strict";

const RoomManager = require("./RoomManager");

const roomManager = new RoomManager();

function handleConnection(ws) {
  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data);
    } catch {
      ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Mensagem inválida." } }));
      return;
    }

    switch (message.type) {
      case "CREATE_ROOM":
        handleCreateRoom(ws, message.payload);
        break;
      case "JOIN_ROOM":
        handleJoinRoom(ws, message.payload);
        break;
      case "FLIP_CARD":
        handleFlipCard(ws, message.payload);
        break;
      case "REQUEST_REMATCH":
        handleRematch(ws);
        break;
      case "LEAVE_ROOM":
        handleLeave(ws);
        break;
      default:
        ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Tipo de mensagem desconhecido." } }));
    }
  });

  ws.on("close", () => {
    const room = roomManager.getRoomByClient(ws);
    if (room) {
      const opponent = room.getOpponent(ws);
      if (opponent && opponent.ws && opponent.ws.readyState === 1) {
        opponent.ws.send(JSON.stringify({
          type: "OPPONENT_DISCONNECTED",
          payload: { message: "Oponente desconectou." },
        }));
      }
      roomManager.removeClient(ws);
    }
  });
}

function handleCreateRoom(ws, payload) {
  if (!payload || !payload.playerName || !payload.playerName.trim()) {
    ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Nome inválido." } }));
    return;
  }

  const { code } = roomManager.createRoom(ws, payload.playerName.trim());
  ws.send(JSON.stringify({
    type: "ROOM_CREATED",
    payload: { roomCode: code, playerIndex: 0 },
  }));
}

function handleJoinRoom(ws, payload) {
  if (!payload || !payload.roomCode || !payload.playerName || !payload.playerName.trim()) {
    ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Dados inválidos." } }));
    return;
  }

  const result = roomManager.joinRoom(payload.roomCode.trim(), ws, payload.playerName.trim());

  if (result.error) {
    ws.send(JSON.stringify({ type: "ERROR", payload: { message: result.error } }));
    return;
  }

  const room = result.room;

  ws.send(JSON.stringify({
    type: "ROOM_JOINED",
    payload: {
      roomCode: room.code,
      playerIndex: 1,
      opponentName: room.players[0].name,
    },
  }));

  room.sendTo(0, {
    type: "OPPONENT_JOINED",
    payload: { opponentName: payload.playerName.trim() },
  });

  setTimeout(() => {
    room.startGame();
  }, 1000);
}

function handleFlipCard(ws, payload) {
  if (!payload || payload.cardId === undefined) return;
  const room = roomManager.getRoomByClient(ws);
  if (!room) return;
  room.handleFlipCard(ws, payload.cardId);
}

function handleRematch(ws) {
  const room = roomManager.getRoomByClient(ws);
  if (!room) return;
  room.handleRematchRequest(ws);
}

function handleLeave(ws) {
  const room = roomManager.getRoomByClient(ws);
  if (room) {
    const opponent = room.getOpponent(ws);
    if (opponent && opponent.ws && opponent.ws.readyState === 1) {
      opponent.ws.send(JSON.stringify({
        type: "OPPONENT_DISCONNECTED",
        payload: { message: "Oponente saiu da sala." },
      }));
    }
    roomManager.removeClient(ws);
  }
}

module.exports = { handleConnection };

"use strict";

const GameState = require("./GameState");

class GameRoom {
  constructor(code) {
    this.code = code;
    this.players = [null, null];
    this.status = "waiting";
    this.gameState = null;
    this.rematchVotes = [false, false];
  }

  addPlayer(ws, name, index) {
    this.players[index] = { ws, name, index };
  }

  removePlayer(ws) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] && this.players[i].ws === ws) {
        this.players[i] = null;
        break;
      }
    }
  }

  isFull() {
    return this.players[0] !== null && this.players[1] !== null;
  }

  isEmpty() {
    return this.players[0] === null && this.players[1] === null;
  }

  getPlayerIndex(ws) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] && this.players[i].ws === ws) {
        return i;
      }
    }
    return -1;
  }

  getOpponent(ws) {
    const idx = this.getPlayerIndex(ws);
    if (idx === -1) return null;
    return this.players[(idx + 1) % 2];
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    for (const p of this.players) {
      if (p && p.ws && p.ws.readyState === 1) {
        p.ws.send(data);
      }
    }
  }

  sendTo(playerIndex, message) {
    const p = this.players[playerIndex];
    if (p && p.ws && p.ws.readyState === 1) {
      p.ws.send(JSON.stringify(message));
    }
  }

  startGame() {
    this.status = "animating";
    this.gameState = new GameState(this.players[0].name, this.players[1].name);
    this.rematchVotes = [false, false];

    const publicCards = this.gameState.getPublicCards();
    this.broadcast({
      type: "GAME_STARTING",
      payload: {
        cards: publicCards,
        players: this.gameState.players.map((p) => ({ name: p.name, color: p.color })),
        currentPlayerIndex: 0,
      },
    });

    this._runAnimationSequence();
  }

  _runAnimationSequence() {
    const entranceDuration = 16 * 100 + 300;
    const revealDuration = 16 * 80 + 1500;
    const hideDuration = 16 * 80 + 500;
    const shuffleDuration = 800;

    setTimeout(() => {
      this.broadcast({
        type: "ANIMATION_REVEAL",
        payload: { cards: this.gameState.getAllCardsRevealed() },
      });
    }, entranceDuration);

    setTimeout(() => {
      this.broadcast({ type: "ANIMATION_HIDE", payload: {} });
    }, entranceDuration + revealDuration);

    setTimeout(() => {
      this.broadcast({ type: "ANIMATION_SHUFFLE", payload: {} });
    }, entranceDuration + revealDuration + hideDuration);

    setTimeout(() => {
      this.status = "playing";
      this.broadcast({
        type: "GAME_ACTIVE",
        payload: { currentPlayerIndex: this.gameState.currentPlayerIndex },
      });
      this.broadcast({
        type: "LOG_ENTRY",
        payload: { message: "Jogo iniciado! Vez de " + this.players[0].name, type: "system" },
      });
    }, entranceDuration + revealDuration + hideDuration + shuffleDuration);
  }

  handleFlipCard(ws, cardId) {
    if (this.status !== "playing") return;

    const playerIndex = this.getPlayerIndex(ws);
    if (playerIndex === -1) return;

    const result = this.gameState.flipCard(cardId, playerIndex);

    if (result.error) {
      this.sendTo(playerIndex, { type: "ERROR", payload: { message: result.error } });
      return;
    }

    if (result.type === "first_flip") {
      this.broadcast({
        type: "CARD_FLIPPED",
        payload: { cardId: result.cardId, symbol: result.symbol, playerIndex: result.playerIndex },
      });
      this.broadcast({ type: "LOG_ENTRY", payload: result.logEntry });
      return;
    }

    if (result.type === "match") {
      this.broadcast({
        type: "CARD_FLIPPED",
        payload: { cardId: result.card2Id, symbol: this.gameState.cards.find((c) => c.id === result.card2Id).symbol, playerIndex: result.playerIndex },
      });
      this.broadcast({ type: "LOG_ENTRY", payload: result.flipLogEntry });

      setTimeout(() => {
        this.broadcast({
          type: "MATCH_FOUND",
          payload: {
            card1Id: result.card1Id,
            card2Id: result.card2Id,
            playerIndex: result.playerIndex,
            scores: result.scores,
            historyEntry: result.historyEntry,
          },
        });
        this.broadcast({ type: "LOG_ENTRY", payload: result.matchLogEntry });

        if (result.gameOver) {
          this.status = "ended";
          this.broadcast({ type: "GAME_OVER", payload: result.gameOver });
        }
      }, 600);
      return;
    }

    if (result.type === "mismatch") {
      this.broadcast({
        type: "CARD_FLIPPED",
        payload: { cardId: result.card2Id, symbol: this.gameState.cards.find((c) => c.id === result.card2Id).symbol, playerIndex: result.playerIndex },
      });
      this.broadcast({ type: "LOG_ENTRY", payload: result.flipLogEntry });

      setTimeout(() => {
        const resolution = this.gameState.resolveMismatch();
        this.broadcast({
          type: "MISMATCH",
          payload: {
            card1Id: result.card1Id,
            card2Id: result.card2Id,
            nextPlayerIndex: resolution.nextPlayerIndex,
          },
        });
        this.broadcast({ type: "LOG_ENTRY", payload: result.mismatchLogEntry });
        this.broadcast({ type: "LOG_ENTRY", payload: resolution.turnLogEntry });
      }, 1000);
    }
  }

  handleRematchRequest(ws) {
    const idx = this.getPlayerIndex(ws);
    if (idx === -1) return;

    this.rematchVotes[idx] = true;

    if (this.rematchVotes[0] && this.rematchVotes[1]) {
      this.broadcast({ type: "REMATCH_ACCEPTED", payload: {} });
      this.startGame();
    } else {
      const opponentIdx = (idx + 1) % 2;
      this.sendTo(opponentIdx, { type: "REMATCH_REQUESTED", payload: { byPlayerIndex: idx } });
    }
  }
}

module.exports = GameRoom;

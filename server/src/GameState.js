"use strict";

const SYMBOLS = ["😎", "🔥", "🚀", "🎮", "👾", "🌈", "⭐", "🏆"];
const TOTAL_PAIRS = 8;

class GameState {
  constructor(player1Name, player2Name) {
    this.players = [
      { name: player1Name, color: "red", score: 0 },
      { name: player2Name, color: "blue", score: 0 },
    ];
    this.cards = [];
    this.currentPlayerIndex = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isProcessing = false;
    this.matchesFound = 0;
    this.totalPairs = TOTAL_PAIRS;
    this.history = [];
    this.log = [];

    this._createCards();
  }

  _createCards() {
    const cardList = [];
    let id = 0;
    for (let i = 0; i < SYMBOLS.length; i++) {
      cardList.push({ id: id++, symbol: SYMBOLS[i], pairId: i, isFlipped: false, isMatched: false, matchedBy: null });
      cardList.push({ id: id++, symbol: SYMBOLS[i], pairId: i, isFlipped: false, isMatched: false, matchedBy: null });
    }
    this.cards = this._shuffle(cardList);
  }

  _shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getPublicCards() {
    return this.cards.map((card) => ({
      id: card.id,
      isFlipped: card.isFlipped,
      isMatched: card.isMatched,
      matchedBy: card.matchedBy,
      symbol: card.isFlipped || card.isMatched ? card.symbol : null,
    }));
  }

  getAllCardsRevealed() {
    return this.cards.map((card) => ({
      id: card.id,
      symbol: card.symbol,
    }));
  }

  flipCard(cardId, playerIndex) {
    if (playerIndex !== this.currentPlayerIndex) {
      return { error: "Não é sua vez." };
    }
    if (this.isProcessing) {
      return { error: "Aguarde o processamento." };
    }

    const card = this.cards.find((c) => c.id === cardId);
    if (!card) {
      return { error: "Carta inválida." };
    }
    if (card.isFlipped || card.isMatched) {
      return { error: "Carta já virada." };
    }

    card.isFlipped = true;

    if (!this.firstCard) {
      this.firstCard = card;
      const logEntry = { message: this.players[playerIndex].name + " virou: " + card.symbol, type: this.players[playerIndex].color };
      this.log.unshift(logEntry);
      return { type: "first_flip", cardId: card.id, symbol: card.symbol, playerIndex, logEntry };
    }

    this.secondCard = card;
    this.isProcessing = true;
    const logEntry = { message: this.players[playerIndex].name + " virou: " + card.symbol, type: this.players[playerIndex].color };
    this.log.unshift(logEntry);

    if (this.firstCard.pairId === this.secondCard.pairId) {
      return this._handleMatch(playerIndex, logEntry);
    }
    return this._handleMismatch(playerIndex, logEntry);
  }

  _handleMatch(playerIndex, flipLogEntry) {
    const player = this.players[playerIndex];
    player.score++;
    this.matchesFound++;

    this.firstCard.isMatched = true;
    this.firstCard.matchedBy = player.color;
    this.secondCard.isMatched = true;
    this.secondCard.matchedBy = player.color;

    const historyEntry = {
      round: this.history.length + 1,
      playerName: player.name,
      playerColor: player.color,
      symbol: this.firstCard.symbol,
    };
    this.history.push(historyEntry);

    const matchLogEntry = { message: player.name + " encontrou um par! " + this.firstCard.symbol, type: player.color };
    this.log.unshift(matchLogEntry);

    const result = {
      type: "match",
      card1Id: this.firstCard.id,
      card2Id: this.secondCard.id,
      playerIndex,
      scores: [this.players[0].score, this.players[1].score],
      historyEntry,
      flipLogEntry,
      matchLogEntry,
    };

    this.firstCard = null;
    this.secondCard = null;
    this.isProcessing = false;

    if (this.matchesFound === this.totalPairs) {
      result.gameOver = this._getGameResult();
    }

    return result;
  }

  _handleMismatch(playerIndex, flipLogEntry) {
    const player = this.players[playerIndex];
    const mismatchLogEntry = { message: player.name + " errou.", type: player.color };
    this.log.unshift(mismatchLogEntry);

    const result = {
      type: "mismatch",
      card1Id: this.firstCard.id,
      card2Id: this.secondCard.id,
      playerIndex,
      flipLogEntry,
      mismatchLogEntry,
    };

    return result;
  }

  resolveMismatch() {
    if (this.firstCard) this.firstCard.isFlipped = false;
    if (this.secondCard) this.secondCard.isFlipped = false;
    this.firstCard = null;
    this.secondCard = null;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    this.isProcessing = false;

    const turnLogEntry = { message: "Vez de " + this.players[this.currentPlayerIndex].name, type: "system" };
    this.log.unshift(turnLogEntry);

    return { nextPlayerIndex: this.currentPlayerIndex, turnLogEntry };
  }

  _getGameResult() {
    const p1 = this.players[0];
    const p2 = this.players[1];

    if (p1.score > p2.score) {
      return { winner: { name: p1.name, color: p1.color, score: p1.score }, isTie: false, scores: [p1.score, p2.score] };
    } else if (p2.score > p1.score) {
      return { winner: { name: p2.name, color: p2.color, score: p2.score }, isTie: false, scores: [p1.score, p2.score] };
    }
    return { winner: null, isTie: true, scores: [p1.score, p2.score] };
  }

  isGameOver() {
    return this.matchesFound === this.totalPairs;
  }
}

module.exports = GameState;

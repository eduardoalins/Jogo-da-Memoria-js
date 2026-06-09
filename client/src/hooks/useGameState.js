import { useReducer } from "react";

const initialState = {
  phase: "lobby",
  roomCode: null,
  playerIndex: null,
  playerName: "",
  opponentName: "",
  players: [],
  cards: [],
  currentPlayerIndex: 0,
  scores: [0, 0],
  history: [],
  log: [],
  animationPhase: null,
  gameOver: null,
  error: null,
  rematchRequested: false,
  opponentWantsRematch: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };

    case "ROOM_CREATED":
      return {
        ...state,
        phase: "waiting",
        roomCode: action.payload.roomCode,
        playerIndex: action.payload.playerIndex,
        error: null,
      };

    case "ROOM_JOINED":
      return {
        ...state,
        phase: "waiting",
        roomCode: action.payload.roomCode,
        playerIndex: action.payload.playerIndex,
        opponentName: action.payload.opponentName,
        error: null,
      };

    case "OPPONENT_JOINED":
      return {
        ...state,
        opponentName: action.payload.opponentName,
      };

    case "GAME_STARTING":
      return {
        ...state,
        phase: "playing",
        cards: action.payload.cards,
        players: action.payload.players,
        currentPlayerIndex: action.payload.currentPlayerIndex,
        scores: [0, 0],
        history: [],
        log: [],
        animationPhase: "entering",
        gameOver: null,
        rematchRequested: false,
        opponentWantsRematch: false,
      };

    case "ANIMATION_REVEAL":
      return {
        ...state,
        animationPhase: "revealing",
        cards: state.cards.map((card) => {
          const revealed = action.payload.cards.find((c) => c.id === card.id);
          return revealed ? { ...card, symbol: revealed.symbol, isFlipped: true } : card;
        }),
      };

    case "ANIMATION_HIDE":
      return {
        ...state,
        animationPhase: "hiding",
        cards: state.cards.map((card) => (card.isMatched ? card : { ...card, isFlipped: false, symbol: null })),
      };

    case "ANIMATION_SHUFFLE":
      return { ...state, animationPhase: "shuffling" };

    case "GAME_ACTIVE":
      return {
        ...state,
        animationPhase: null,
        currentPlayerIndex: action.payload.currentPlayerIndex,
      };

    case "CARD_FLIPPED": {
      const { cardId, symbol } = action.payload;
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === cardId ? { ...card, isFlipped: true, symbol } : card
        ),
      };
    }

    case "MATCH_FOUND": {
      const { card1Id, card2Id, playerIndex, scores, historyEntry } = action.payload;
      return {
        ...state,
        cards: state.cards.map((card) => {
          if (card.id === card1Id || card.id === card2Id) {
            return { ...card, isMatched: true, matchedBy: state.players[playerIndex].color };
          }
          return card;
        }),
        scores,
        history: [...state.history, historyEntry],
      };
    }

    case "MISMATCH": {
      const { card1Id, card2Id, nextPlayerIndex } = action.payload;
      return {
        ...state,
        cards: state.cards.map((card) => {
          if (card.id === card1Id || card.id === card2Id) {
            return { ...card, isFlipped: false, symbol: null };
          }
          return card;
        }),
        currentPlayerIndex: nextPlayerIndex,
      };
    }

    case "LOG_ENTRY":
      return {
        ...state,
        log: [action.payload, ...state.log].slice(0, 50),
      };

    case "GAME_OVER":
      return {
        ...state,
        phase: "ended",
        gameOver: action.payload,
      };

    case "REMATCH_REQUESTED":
      return { ...state, opponentWantsRematch: true };

    case "REMATCH_ACCEPTED":
      return { ...state, rematchRequested: false, opponentWantsRematch: false };

    case "REQUEST_REMATCH_SENT":
      return { ...state, rematchRequested: true };

    case "OPPONENT_DISCONNECTED":
      return { ...state, phase: "disconnected", error: action.payload.message };

    case "ERROR":
      return { ...state, error: action.payload.message };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "RESET":
      return { ...initialState, playerName: state.playerName };

    default:
      return state;
  }
}

export function useGameState() {
  return useReducer(gameReducer, initialState);
}

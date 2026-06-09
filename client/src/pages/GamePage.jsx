import { useGame } from "../context/GameContext";
import Scoreboard from "../components/Scoreboard";
import Board from "../components/Board";
import Sidebar from "../components/Sidebar";
import EndGameModal from "../components/EndGameModal";
import "../styles/game.css";

export default function GamePage() {
  const { state, send, dispatch } = useGame();

  function handleCardClick(cardId) {
    if (state.animationPhase) return;
    if (state.currentPlayerIndex !== state.playerIndex) return;
    send("FLIP_CARD", { cardId });
  }

  function handleRematch() {
    dispatch({ type: "REQUEST_REMATCH_SENT" });
    send("REQUEST_REMATCH");
  }

  function handleLeave() {
    send("LEAVE_ROOM");
    dispatch({ type: "RESET" });
  }

  return (
    <div className="game-layout">
      <Scoreboard
        players={state.players}
        scores={state.scores}
        currentPlayerIndex={state.currentPlayerIndex}
        myPlayerIndex={state.playerIndex}
      />

      <main className="game-area">
        <Board
          cards={state.cards}
          animationPhase={state.animationPhase}
          onCardClick={handleCardClick}
          isMyTurn={state.currentPlayerIndex === state.playerIndex}
        />
      </main>

      <Sidebar history={state.history} log={state.log} />

      {state.phase === "ended" && (
        <EndGameModal
          gameOver={state.gameOver}
          players={state.players}
          onRematch={handleRematch}
          onLeave={handleLeave}
          rematchRequested={state.rematchRequested}
          opponentWantsRematch={state.opponentWantsRematch}
        />
      )}
    </div>
  );
}

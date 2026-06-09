import { useGame } from "../context/GameContext";
import "../styles/lobby.css";

export default function WaitingRoom() {
  const { state, send } = useGame();

  function handleCopyCode() {
    if (state.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
    }
  }

  function handleLeave() {
    send("LEAVE_ROOM");
    window.location.reload();
  }

  return (
    <div className="container">
      <h1 className="title">Sala Criada</h1>

      {state.playerIndex === 0 && !state.opponentName && (
        <>
          <p className="subtitle">Compartilhe o código com seu oponente</p>
          <div className="room-code-display">
            <span className="room-code">{state.roomCode}</span>
            <button className="btn-copy" onClick={handleCopyCode}>
              Copiar
            </button>
          </div>
          <div className="waiting-indicator">
            <div className="spinner"></div>
            <p>Aguardando oponente...</p>
          </div>
        </>
      )}

      {state.opponentName && (
        <div className="opponent-joined">
          <p className="subtitle">
            <strong>{state.opponentName}</strong> entrou na sala!
          </p>
          <div className="waiting-indicator">
            <div className="spinner"></div>
            <p>Iniciando jogo...</p>
          </div>
        </div>
      )}

      {state.playerIndex === 1 && !state.opponentName && (
        <div className="waiting-indicator">
          <div className="spinner"></div>
          <p>Entrando na sala...</p>
        </div>
      )}

      <button className="btn-leave" onClick={handleLeave}>
        Sair
      </button>
    </div>
  );
}

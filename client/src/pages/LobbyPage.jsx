import { useState } from "react";
import { useGame } from "../context/GameContext";
import "../styles/lobby.css";

export default function LobbyPage() {
  const { state, dispatch, send, connectionStatus } = useGame();
  const [playerName, setPlayerName] = useState(state.playerName || "");
  const [roomCode, setRoomCode] = useState("");
  const [localError, setLocalError] = useState("");

  function handleCreate() {
    if (!playerName.trim()) {
      setLocalError("Digite seu nome.");
      return;
    }
    setLocalError("");
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName.trim() });
    send("CREATE_ROOM", { playerName: playerName.trim() });
  }

  function handleJoin() {
    if (!playerName.trim()) {
      setLocalError("Digite seu nome.");
      return;
    }
    if (!roomCode.trim()) {
      setLocalError("Digite o código da sala.");
      return;
    }
    setLocalError("");
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName.trim() });
    send("JOIN_ROOM", { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim() });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (roomCode.trim()) {
        handleJoin();
      } else {
        handleCreate();
      }
    }
  }

  const isConnected = connectionStatus === "connected";

  return (
    <div className="container">
      <h1 className="title">Jogo da Memória</h1>
      <p className="subtitle">Multiplayer em tempo real</p>

      <div className="lobby-form">
        <div className="input-group">
          <label htmlFor="player-name">Seu Nome</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite seu nome"
            maxLength={15}
          />
        </div>

        <div className="lobby-actions">
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={!isConnected}
          >
            Criar Sala
          </button>

          <div className="join-section">
            <div className="divider">
              <span>ou entre em uma sala</span>
            </div>
            <div className="join-row">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Código da sala"
                maxLength={6}
                className="code-input"
              />
              <button
                className="btn-join"
                onClick={handleJoin}
                disabled={!isConnected}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>

        {(localError || state.error) && (
          <p className="error-msg">{localError || state.error}</p>
        )}

        {!isConnected && (
          <p className="connection-status">Conectando ao servidor...</p>
        )}
      </div>
    </div>
  );
}

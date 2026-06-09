import { GameProvider, useGame } from "./context/GameContext";
import LobbyPage from "./pages/LobbyPage";
import WaitingRoom from "./pages/WaitingRoom";
import GamePage from "./pages/GamePage";

function AppContent() {
  const { state } = useGame();

  switch (state.phase) {
    case "lobby":
      return <LobbyPage />;
    case "waiting":
      return <WaitingRoom />;
    case "playing":
    case "ended":
      return <GamePage />;
    case "disconnected":
      return <DisconnectedScreen message={state.error} />;
    default:
      return <LobbyPage />;
  }
}

function DisconnectedScreen({ message }) {
  const { dispatch } = useGame();

  return (
    <div className="container">
      <h1 className="title">Conexão Perdida</h1>
      <p className="subtitle">{message || "O oponente desconectou."}</p>
      <button className="btn-start" onClick={() => dispatch({ type: "RESET" })}>
        Voltar ao Início
      </button>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

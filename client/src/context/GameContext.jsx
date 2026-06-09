import { createContext, useContext, useCallback, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useGameState } from "../hooks/useGameState";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useGameState();
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const handleMessage = useCallback((message) => {
    dispatchRef.current(message);
  }, []);

  const { connectionStatus, send } = useWebSocket(handleMessage);

  return (
    <GameContext.Provider value={{ state, dispatch, send, connectionStatus }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame deve ser usado dentro de GameProvider");
  }
  return context;
}

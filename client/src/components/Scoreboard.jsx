export default function Scoreboard({ players, scores, currentPlayerIndex, myPlayerIndex }) {
  if (!players || players.length < 2) return null;

  return (
    <header className="scoreboard">
      <div className={"player-score player1-score" + (currentPlayerIndex === 0 ? " active" : "")}>
        <span className="player-name">
          {players[0].name}
          {myPlayerIndex === 0 ? " (você)" : ""}
        </span>
        <span className="score">{scores[0]}</span>
      </div>

      <div
        className="turn-indicator"
        style={{ color: currentPlayerIndex === 0 ? "#e74c3c" : "#3498db" }}
      >
        {currentPlayerIndex === myPlayerIndex ? "Sua vez!" : "Vez do oponente"}
      </div>

      <div className={"player-score player2-score" + (currentPlayerIndex === 1 ? " active" : "")}>
        <span className="player-name">
          {players[1].name}
          {myPlayerIndex === 1 ? " (você)" : ""}
        </span>
        <span className="score">{scores[1]}</span>
      </div>
    </header>
  );
}

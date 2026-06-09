export default function EndGameModal({ gameOver, players, onRematch, onLeave, rematchRequested, opponentWantsRematch }) {
  if (!gameOver) return null;

  let title;
  let titleColor;

  if (gameOver.isTie) {
    title = "Empate!";
    titleColor = "#f39c12";
  } else {
    title = gameOver.winner.name + " Venceu!";
    titleColor = gameOver.winner.color === "red" ? "#e74c3c" : "#3498db";
  }

  const message = gameOver.isTie
    ? "Ambos com " + gameOver.scores[0] + " pares!"
    : players[0].name + ": " + gameOver.scores[0] + " | " + players[1].name + ": " + gameOver.scores[1];

  return (
    <div className="modal-overlay visible">
      <div className="modal">
        <h2 style={{ color: titleColor }}>{title}</h2>
        <p>{message}</p>

        {opponentWantsRematch && !rematchRequested && (
          <p className="rematch-notice">Oponente quer jogar novamente!</p>
        )}

        {rematchRequested ? (
          <p className="rematch-notice">Aguardando oponente aceitar...</p>
        ) : (
          <button className="btn-restart" onClick={onRematch}>
            {opponentWantsRematch ? "Aceitar Revanche" : "Jogar Novamente"}
          </button>
        )}

        <button className="btn-home" onClick={onLeave}>
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}

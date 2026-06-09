export default function GameLog({ log }) {
  return (
    <section className="log-section">
      <h3>Log de Jogadas</h3>
      <ul id="game-log">
        {log.map((entry, i) => (
          <li key={i} className={entry.type ? "log-" + entry.type : ""}>
            {entry.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

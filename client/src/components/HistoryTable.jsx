export default function HistoryTable({ history }) {
  return (
    <section className="history-section">
      <h3>Histórico de Pares</h3>
      <table id="history-table">
        <thead>
          <tr>
            <th>Rodada</th>
            <th>Jogador</th>
            <th>Par</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.round} className={"row-" + entry.playerColor}>
              <td>{entry.round}</td>
              <td>{entry.playerName}</td>
              <td>{entry.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

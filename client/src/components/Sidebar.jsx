import HistoryTable from "./HistoryTable";
import GameLog from "./GameLog";

export default function Sidebar({ history, log }) {
  return (
    <aside className="sidebar">
      <HistoryTable history={history} />
      <GameLog log={log} />
    </aside>
  );
}

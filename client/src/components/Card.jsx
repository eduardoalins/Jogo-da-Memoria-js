import { memo } from "react";

function Card({ id, symbol, isFlipped, isMatched, matchedBy, animState, onClick, disabled }) {
  const classes = [
    "card",
    isFlipped ? "flipped" : "",
    isMatched ? "matched-" + matchedBy : "",
    disabled || isMatched ? "locked" : "",
    animState || "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleClick() {
    if (disabled || isFlipped || isMatched) return;
    onClick(id);
  }

  return (
    <div className={classes} onClick={handleClick}>
      <div className="card-inner">
        <div className="card-front">{symbol || ""}</div>
        <div className="card-back"></div>
      </div>
    </div>
  );
}

export default memo(Card);

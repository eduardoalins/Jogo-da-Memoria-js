import { useState, useEffect } from "react";
import Card from "./Card";

export default function Board({ cards, animationPhase, onCardClick, isMyTurn }) {
  const [cardAnimStates, setCardAnimStates] = useState({});

  useEffect(() => {
    if (animationPhase === "entering") {
      setCardAnimStates({});
      cards.forEach((card, i) => {
        setTimeout(() => {
          setCardAnimStates((prev) => ({ ...prev, [card.id]: "entered" }));
        }, i * 100);
      });
    }
  }, [animationPhase]);

  useEffect(() => {
    if (animationPhase === "shuffling") {
      const states = {};
      cards.forEach((card) => {
        states[card.id] = "shuffling";
      });
      setCardAnimStates(states);

      setTimeout(() => {
        setCardAnimStates({});
      }, 400);
    }
  }, [animationPhase]);

  const isInteractive = !animationPhase && isMyTurn;

  return (
    <div className="board">
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          symbol={card.symbol}
          isFlipped={card.isFlipped}
          isMatched={card.isMatched}
          matchedBy={card.matchedBy}
          animState={
            animationPhase === "entering" && !cardAnimStates[card.id]
              ? "entering"
              : cardAnimStates[card.id] || ""
          }
          onClick={onCardClick}
          disabled={!isInteractive}
        />
      ))}
    </div>
  );
}

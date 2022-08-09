import styles from "~/components/FlipCard/styles.css";
import Portal from "@reach/portal";
import { useEffect, useState } from "react";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
}

const animationTime = 3000;

export default function FlipCard({ front, back, categoryName }: FlipCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setCanClose(true), animationTime);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="absolute top-0 h-full w-full bg-secondary-500 opacity-70"
        onClick={() => canClose && setIsOpen(false)}
      />
      <div className="flip-card overflow-hidden rounded-lg">
        <div className="flip-card-inner">
          <div className="flip-card-front flip-card-front-first">
            <div className="flip-card-front hidden-before">{categoryName}</div>
            {front}
          </div>
          <div className="flip-card-back">{back}</div>
        </div>
      </div>
    </Portal>
  );
}

interface FlipCardProps {
  front: JSX.Element;
  back: JSX.Element;
  categoryName: string;
}

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%*#&";

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Label whose letters settle from random glyphs into the final text, left to right.
// Screen readers always get the real text; the animation is skipped for reduced motion.
const ScrambleText = ({ text, className, duration = 900 }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const settled = Math.floor(progress * text.length);
      setDisplay(
        [...text].map((char, index) => (index < settled || char === " " ? char : randomGlyph())).join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [text, duration]);

  return (
    <span className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

export default ScrambleText;

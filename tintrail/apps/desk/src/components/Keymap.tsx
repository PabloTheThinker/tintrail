import { useState } from "react";

const STEPS = [
  "Work arrives on three buttons: Find, Match, or Online.",
  "Tap Add to line. The can lands on the Line.",
  "On the right, follow Scan → Mix → Print → Done. One yellow button.",
] as const;

const PACKS = ["hd", "walmart", "lowes", "ace", "sherwin"] as const;

type KeymapProps = {
  pack: string;
  station: string;
  stations: string[];
  offline: boolean;
  staleReady: number;
  busy: boolean;
  onPack: (pack: string) => void;
  onStation: (station: string) => void;
  onToggleSync: () => void;
  onClearStale: () => void;
  onClose: () => void;
};

export function Keymap({
  pack,
  station,
  stations,
  offline,
  staleReady,
  busy,
  onPack,
  onStation,
  onToggleSync,
  onClearStale,
  onClose,
}: KeymapProps) {
  const [tech, setTech] = useState(false);

  return (
    <div className="overlay" role="dialog" aria-label="How to run the desk" onClick={onClose}>
      <div className="keymap" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>How this works</h2>
          <button type="button" className="skip" onClick={onClose}>
            Close
          </button>
        </header>
        <ol className="simple-steps">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="help tight">
          Online: tap Online, tap the order, mix it, then put it on the online shelf — not
          in a customer’s hand.
        </p>
        <button type="button" className="skip wide" onClick={() => setTech((open) => !open)}>
          {tech ? "Hide technician tools" : "Technician tools"}
        </button>
        {tech ? (
          <div className="tech-panel">
            <p className="field-label">Store pack</p>
            <div className="choices compact" role="group" aria-label="Retailer pack">
              {PACKS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={pack === id ? "on" : ""}
                  onClick={() => onPack(id)}
                >
                  {id}
                </button>
              ))}
            </div>
            <p className="field-label">Mixer</p>
            <div className="choices compact" role="group" aria-label="Station">
              {stations.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={station === id ? "on" : ""}
                  onClick={() => onStation(id)}
                >
                  {id}
                </button>
              ))}
            </div>
            <button type="button" className="skip wide" onClick={onToggleSync}>
              {offline ? "Go online" : "Go offline"}
            </button>
            <button type="button" className="skip wide" disabled={busy || staleReady === 0} onClick={onClearStale}>
              {staleReady > 0 ? `Clear leftover cans (${staleReady})` : "No leftover cans"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import type { ColorHit, MeasureShot } from "../api";
import { Swatch } from "./Swatch";

type MeasurePaneProps = {
  shot: MeasureShot | null;
  busy: boolean;
  onMeasure: () => void;
  onPick: (hit: ColorHit) => void;
};

export function MeasurePane({ shot, busy, onMeasure, onPick }: MeasurePaneProps) {
  return (
    <section className="panel measure" aria-label="Match a sample">
      <h2>Match a sample</h2>
      <p className="help">Hold it to the reader, then tap Read.</p>
      <button type="button" className="commit xl measure-btn" disabled={busy} onClick={onMeasure}>
        Read
      </button>
      {shot ? (
        <>
          <div className="ticket-head">
            <Swatch hex={shot.shot.swatch} large />
            <div>
              <div className="name">We read this</div>
              <div className="dim">Pick the closest color below.</div>
            </div>
          </div>
          {shot.closest.map((hit) => (
            <button
              key={hit.id}
              type="button"
              className="row"
              onClick={() => onPick(hit)}
            >
              <Swatch hex={hit.swatch} />
              <span className="dim">{hit.brand}</span>
              <strong>{hit.name}</strong>
              <span className="use-this">Use this</span>
            </button>
          ))}
        </>
      ) : (
        <p className="empty">Nothing read yet.</p>
      )}
    </section>
  );
}

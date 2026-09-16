import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceTicket,
  commitTicket,
  dispenseTicket,
  dumpTicket,
  getDevices,
  clearStaleRail,
  getInbound,
  getOnHand,
  getOptions,
  getRail,
  getSync,
  pullAllInbound,
  railInbound,
  setPack,
  setStation,
  measureSample,
  printTicket,
  searchCatalog,
  setSyncEnabled,
  validateTicket,
  type CanSize,
  type ColorHit,
  type DeviceStatus,
  type InboundOrder,
  type MeasureShot,
  type Ticket,
} from "./api";
import { Keymap } from "./components/Keymap";
import { LineStrip } from "./components/LineStrip";
import { MeasurePane } from "./components/MeasurePane";
import { Swatch } from "./components/Swatch";
import { TintStation } from "./components/TintStation";
import { devicesNeedAttention, deviceStatusLabel } from "./lib/devices";
import { catalogClock } from "./lib/format";
import { isOpenLineTicket, isStaleReady, sortLineTickets } from "./lib/source";

const FALLBACK_LINES = ["Marquee", "Premium Plus", "Dynasty", "Ultra"];
const FALLBACK_SHEENS = ["Flat", "Eggshell", "Satin", "Semi", "Gloss"];
const FALLBACK_SIZES: CanSize[] = ["8oz", "Qt", "Gal", "5gal"];
const QTY_CHOICES = [1, 2, 3, 4] as const;

type LeftPane = "take" | "measure";

export function App() {
  const [left, setLeft] = useState<LeftPane>("take");
  const [help, setHelp] = useState(false);
  const [offline, setOffline] = useState(false);
  const [asOf, setAsOf] = useState("2026-09-14T10:14:00Z");
  const [devices, setDevices] = useState<DeviceStatus>({
    spectro: "ok",
    dispenser: "ok",
    printer: "ok",
  });
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ColorHit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>(FALLBACK_LINES);
  const [sheens, setSheens] = useState<string[]>(FALLBACK_SHEENS);
  const [sizes, setSizes] = useState<CanSize[]>(FALLBACK_SIZES);
  const [line, setLine] = useState(FALLBACK_LINES[0] ?? "Marquee");
  const [sheen, setSheen] = useState("Satin");
  const [size, setSize] = useState<CanSize>("Gal");
  const [qty, setQty] = useState(1);
  const [token, setToken] = useState("");
  const [onHand, setOnHand] = useState(14);
  const [rail, setRail] = useState<Ticket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");
  const [shot, setShot] = useState<MeasureShot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [moreTicket, setMoreTicket] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [inboundOrders, setInboundOrders] = useState<InboundOrder[]>([]);
  const [pack, setPackName] = useState("hd");
  const [layout, setLayout] = useState("hd-pit");
  const [commerce, setCommerce] = useState(false);
  const [station, setStationName] = useState("D1");
  const [stations, setStations] = useState<string[]>(["D1", "D2"]);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = hits.find((hit) => hit.id === selectedId) ?? hits[0] ?? null;
  const clock = catalogClock(asOf);
  const openLine = useMemo(
    () => sortLineTickets(rail.filter((ticket) => isOpenLineTicket(ticket, now)), now),
    [now, rail],
  );
  const staleReady = rail.filter((ticket) => isStaleReady(ticket, now)).length;
  const active = useMemo(() => {
    const pinned = activeId ? rail.find((ticket) => ticket.id === activeId) : null;
    if (
      pinned &&
      (pinned.state === "done" || pinned.state === "dumped" || !isStaleReady(pinned, now))
    ) {
      return pinned;
    }
    return openLine.find((ticket) => ticket.state === "on_rail") ?? openLine[0] ?? null;
  }, [activeId, now, openLine, rail]);

  const refreshRail = useCallback(async () => {
    const [data, inbound] = await Promise.all([getRail(), getInbound()]);
    setRail(data.tickets);
    setInboundOrders(inbound.orders);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = "simple";
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [options, sync, catalog, device] = await Promise.all([
          getOptions(),
          getSync(),
          searchCatalog(""),
          getDevices(),
        ]);
        if (cancelled) {
          return;
        }
        setLines(options.lines);
        setSheens(options.sheens);
        setSizes(options.sizes);
        setAsOf(options.asOf);
        setOffline(!sync.enabled);
        setHits(catalog.hits);
        setDevices(device);
        setStationName(options.station);
        if (options.stations) {
          setStations(options.stations);
        }
        if (options.pack) {
          setPackName(options.pack);
        }
        if (options.layout) {
          setLayout(options.layout);
        }
        if (options.commerce !== undefined) {
          setCommerce(options.commerce);
        }
        await refreshRail();
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "This computer cannot reach the mixer.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshRail]);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void searchCatalog(query)
        .then((data) => {
          if (!cancelled) {
            setHits(data.hits);
            setAsOf(data.asOf);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : "Search failed");
          }
        });
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    void getOnHand(line)
      .then((data) => {
        if (!cancelled) {
          setOnHand(data.onHand);
        }
      })
      .catch(() => {
        /* keep last stub */
      });
    return () => {
      cancelled = true;
    };
  }, [line, offline]);

  const openMix = useCallback((ticket?: Ticket | null) => {
    if (ticket) {
      setActiveId(ticket.id);
      setBarcode("");
    }
  }, []);

  const addToList = useCallback(
    async () => {
      if (!selected || onHand === 0 || busy) {
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const phone = token.trim();
        const { ticket } = await commitTicket({
          colorId: selected.id,
          productLine: line,
          sheen,
          size,
          qty,
          token: phone,
          origin: phone ? "pro-job" : "walk-up",
        });
        if (!activeId) {
          setActiveId(ticket.id);
          setBarcode("");
        }
        setToken("");
        setMoreTicket(false);
        setNote("On the line. Mix it on the right.");
        setLeft("take");
        await refreshRail();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not add this can.");
      } finally {
        setBusy(false);
      }
    },
    [activeId, busy, line, onHand, qty, refreshRail, selected, sheen, size, token],
  );

  const run = async (work: () => Promise<Ticket>) => {
    setBusy(true);
    setError(null);
    try {
      const ticket = await work();
      setActiveId(ticket.id);
      await refreshRail();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That step did not finish.");
    } finally {
      setBusy(false);
    }
  };

  const nextMix = async () => {
    if (!active) {
      setError("Add a can to the Line first.");
      setLeft("take");
      return;
    }
    if (active.state === "on_rail") {
      if (barcode.trim() === "") {
        setError("Scan the can.");
        return;
      }
      await run(async () => (await validateTicket(active.id, barcode)).ticket);
      return;
    }
    if (active.state === "validating" || (active.state === "dispensing" && !active.ackHash)) {
      await run(async () => (await dispenseTicket(active.id)).ticket);
      return;
    }
    if (active.ackHash && active.state !== "labeled" && active.state !== "shaken" && active.state !== "done") {
      await run(async () => (await printTicket(active.id)).ticket);
      setNote(active.origin === "online" ? "Printed. Tap Done, then put it on the online shelf." : "Printed. Tap Done when you hand it over.");
      return;
    }
    if (active.state === "labeled" || active.state === "shaken") {
      await run(async () => (await advanceTicket(active.id, "done")).ticket);
      setNote(
        active.origin === "online"
          ? "Staged · Online shelf A. Do not hand the untinted base."
          : "Done. Hand the can to the customer.",
      );
    }
  };

  const startOver = async () => {
    if (!active) {
      setLeft("take");
      return;
    }
    await run(async () => (await dumpTicket(active.id, "wrong can")).ticket);
    setNote("Thrown out. Find the color again on the left.");
    setBarcode("");
    setLeft("take");
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const inField =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === "?" && !inField) {
        event.preventDefault();
        setHelp((open) => !open);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setHelp(false);
        setLeft("take");
        return;
      }
      if (event.key === "/" && document.activeElement !== searchRef.current) {
        event.preventDefault();
        setLeft("take");
        searchRef.current?.focus();
        return;
      }
      if (event.key === "F1") {
        event.preventDefault();
        setLeft("take");
        searchRef.current?.focus();
        return;
      }
      if (event.key === "F2") {
        event.preventDefault();
        setLeft((pane) => (pane === "measure" ? "take" : "measure"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMix]);

  const toggleSync = async () => {
    try {
      const next = await setSyncEnabled(offline);
      setOffline(!next.enabled);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not change online status.");
    }
  };

  const emptySearch = query.trim().length > 0 && hits.length === 0;

  const applyPack = async (nextPack: string) => {
    setBusy(true);
    setError(null);
    try {
      const info = await setPack(nextPack);
      setPackName(info.pack);
      setLayout(info.layout);
      setCommerce(info.commerce);
      setStations(info.stations);
      setStationName(info.station);
      const catalog = await searchCatalog(query);
      setHits(catalog.hits);
      setNote(`Store look: ${info.pack}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not change pack.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="desk pit" data-left={left} data-pack={layout}>
      <header className="topbar">
        <div className="brand">
          <strong>TintRail</strong>
          <span>Paint</span>
        </div>
        <div className="chips one-chip">
          <span className="chip">
            <i className={`dot${devicesNeedAttention(devices, offline) ? " warn" : ""}`} />
            {devicesNeedAttention(devices, offline) ? deviceStatusLabel(devices, offline) : "Ready"}
          </span>
          <button type="button" className="ghost text" onClick={() => setHelp(true)}>
            Help
          </button>
        </div>
      </header>

      <div className="searchbar">
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId(null);
            setNote(null);
            setError(null);
            setLeft("take");
          }}
          placeholder="Find a color"
          aria-label="Find a color"
        />
        <div className="everyday" role="toolbar" aria-label="Everyday jobs">
          <button
            type="button"
            className={`everyday-btn${left === "take" && !trayOpen ? " on" : ""}`}
            onClick={() => {
              setLeft("take");
              setTrayOpen(false);
              searchRef.current?.focus();
            }}
          >
            Find
          </button>
          <button
            type="button"
            className={`everyday-btn${left === "measure" ? " on" : ""}`}
            onClick={() => setLeft((pane) => (pane === "measure" ? "take" : "measure"))}
          >
            {left === "measure" ? "Back" : "Match"}
          </button>
          <button
            type="button"
            className={`everyday-btn${trayOpen ? " on" : ""}`}
            disabled={inboundOrders.length === 0}
            onClick={() => {
              setTrayOpen((open) => !open);
              setLeft("take");
            }}
          >
            {inboundOrders.length > 0 ? `Online (${inboundOrders.length})` : "Online"}
          </button>
        </div>
      </div>

      {offline ? (
        <div className="banner" role="status">
          Offline. You can still mix. Shelf counts are from {clock}.
        </div>
      ) : null}
      {error ? (
        <div className="banner bad" role="alert">
          {error}
        </div>
      ) : null}
      {note ? (
        <div className="banner ok" role="status">
          {note}
        </div>
      ) : null}

      <div className="body pit-body">
        {left === "measure" ? (
          <MeasurePane
            shot={shot}
            busy={busy}
            onMeasure={() => {
              void (async () => {
                setBusy(true);
                setError(null);
                try {
                  setShot(await measureSample());
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "Could not read the sample.");
                } finally {
                  setBusy(false);
                }
              })();
            }}
            onPick={(hit) => {
              setSelectedId(hit.id);
              setHits((rows) => {
                if (rows.some((row) => row.id === hit.id)) {
                  return rows;
                }
                return [hit, ...rows];
              });
              setNote("Color ready. Add it on the left — the mixer stays up.");
              setLeft("take");
            }}
          />
        ) : (
          <div className="take">
            <section className="panel" aria-label="Search results">
              <h2>Take</h2>
              {emptySearch ? (
                <p className="empty">
                  No colors match that. Try another name, or tap Match sample.
                </p>
              ) : (
                hits.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    className={`row${selected?.id === hit.id ? " sel" : ""}`}
                    onClick={() => setSelectedId(hit.id)}
                  >
                    <Swatch hex={hit.swatch} />
                    <span className="row-copy">
                      <strong>{hit.name}</strong>
                      <span className="dim">
                        {hit.brand} · {hit.code}
                      </span>
                    </span>
                    <span className="use-this">Pick</span>
                  </button>
                ))
              )}
            </section>
            <aside className="panel ticket" aria-live="polite">
              {selected ? (
                <>
                  <div className="ticket-head">
                    <Swatch hex={selected.swatch} large />
                    <div>
                      <div className="dim">
                        {selected.brand} · {selected.code}
                      </div>
                      <div className="name">{selected.name}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="commit xl sticky-actions"
                    disabled={onHand === 0 || busy}
                    onClick={() => void addToList()}
                  >
                    Add to line
                  </button>
                  <p className="choice-summary">
                    {line} · {sheen} · {size}
                    {qty > 1 ? ` × ${qty}` : ""}
                  </p>
                  <button type="button" className="more-link" onClick={() => setMoreTicket((open) => !open)}>
                    {moreTicket ? "Hide options" : "More options"}
                  </button>
                  {moreTicket ? (
                    <>
                  <p className="field-label">Paint</p>
                  <div className="choices" role="group" aria-label="Paint">
                    {lines.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={line === item ? "on" : ""}
                        onClick={() => setLine(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <p className="field-label">Finish</p>
                  <div className="choices" role="group" aria-label="Finish">
                    {sheens.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={sheen === item ? "on" : ""}
                        onClick={() => setSheen(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <p className="field-label">Size</p>
                  <div className="choices" role="group" aria-label="Size">
                    {sizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={size === item ? "on" : ""}
                        onClick={() => setSize(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <p className="field-label">How many</p>
                  <div className="choices" role="group" aria-label="How many">
                    {QTY_CHOICES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={qty === n ? "on" : ""}
                        onClick={() => setQty(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className={`onhand${onHand === 0 ? " bad" : ""}`}>
                    {onHand === 0
                      ? "None on the shelf — pick another paint."
                      : `${onHand} on the shelf`}
                  </div>
                  <label className="field">
                    <span>Phone (optional)</span>
                    <input
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="Walk-in if blank"
                      aria-label="Phone (optional)"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void addToList();
                        }
                      }}
                    />
                  </label>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="empty">Tap a color, then add it to the Line.</p>
              )}
            </aside>
          </div>
        )}

        <TintStation
          ticket={active}
          barcode={barcode}
          busy={busy}
          commerce={commerce}
          onBarcode={setBarcode}
          onUseSku={() => {
            if (active) {
              setBarcode(active.sku);
              setError(null);
            }
          }}
          onNext={() => void nextMix()}
          onWrongCan={() => void startOver()}
        />
      </div>

      <LineStrip
        tickets={openLine}
        activeId={active?.id ?? null}
        now={now}
        orders={inboundOrders}
        busy={busy}
        commerce={commerce}
        trayOpen={trayOpen}
        onToggleTray={() => setTrayOpen((open) => !open)}
        onOpen={openMix}
        onPullAll={() => {
          void (async () => {
            setBusy(true);
            setError(null);
            try {
              const { tickets } = await pullAllInbound();
              const last = tickets[tickets.length - 1];
              if (last) {
                setActiveId(last.id);
                setBarcode("");
              }
              setTrayOpen(false);
              setNote("Online orders are on the Line.");
              await refreshRail();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "No online orders in the tray.");
            } finally {
              setBusy(false);
            }
          })();
        }}
        onRailOrder={(id) => {
          void (async () => {
            setBusy(true);
            setError(null);
            try {
              const { ticket } = await railInbound(id);
              setActiveId(ticket.id);
              setBarcode("");
              setTrayOpen(false);
              setNote(`${ticket.token} is on the Line.`);
              await refreshRail();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Could not rail that order.");
            } finally {
              setBusy(false);
            }
          })();
        }}
      />
      {help ? (
        <Keymap
          pack={pack}
          station={station}
          stations={stations}
          offline={offline}
          staleReady={staleReady}
          busy={busy}
          onPack={(next) => void applyPack(next)}
          onStation={(id) => {
            void (async () => {
              try {
                const next = await setStation(id);
                setStationName(next.station);
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : "Could not change mixer.");
              }
            })();
          }}
          onToggleSync={() => void toggleSync()}
          onClearStale={() => {
            void (async () => {
              setBusy(true);
              setError(null);
              try {
                const { dumped } = await clearStaleRail();
                setNote(
                  dumped === 0
                    ? "Nothing leftover."
                    : `Cleared ${dumped} leftover can${dumped === 1 ? "" : "s"}.`,
                );
                await refreshRail();
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : "Could not clear leftovers.");
              } finally {
                setBusy(false);
              }
            })();
          }}
          onClose={() => setHelp(false)}
        />
      ) : null}
    </div>
  );
}

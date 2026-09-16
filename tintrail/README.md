# TintRail

Store-local paint-desk runtime. Phase 1: **Desk UI + Runtime + mock devices**. Cloud is Sync only.

Spec: [`docs/tintrail/`](../docs/tintrail/README.md) · Stack: [`10-build-and-stack.md`](../docs/tintrail/10-build-and-stack.md) · Line + online: [`13-retail-compare-online.md`](../docs/tintrail/13-retail-compare-online.md)

Inbound is a **synthetic adapter** (`kind: "synthetic"`). OrderUp / Walmart / HD APIs are not connected. Help can switch layout packs (HD pit, Walmart compact, Lowe’s KDS, Ace, Sherwin) without changing mix math.

## Commands

```bash
cd tintrail
pnpm install
pnpm test
pnpm dev          # browser Desk + local runtime
pnpm desktop      # Windows/Linux window (Tauri) + local runtime
```

- Web Desk: `http://127.0.0.1:5173`
- Runtime: `http://127.0.0.1:8787`

On a Windows paint PC, after Node 22 + pnpm: `scripts/start-store.ps1`. To build an installer on Windows with the WebView2 runtime:

```bash
pnpm --filter @tintrail/desk desktop:build
```

That writes NSIS/MSI under `apps/desk/src-tauri/target/release/bundle/`. The same Desk is the web app.

Unplug Sync with **Kill sync**. Search, rail, validate, dispense, and print still finish.

Catalog colors are **synthetic**. No OEM formula books.

If `better-sqlite3` fails to load after install:

```bash
pnpm rebuild:sqlite
```

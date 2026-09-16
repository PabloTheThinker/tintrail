# TintRail

Store-local paint desk for a Saturday retail pit. Associates tap **Find**, **Match**, or **Online**, then **Add to line**, then one yellow button: **Scan → Mix → Print → Done**.

Cloud is Sync only. Formula math never uses display −100…+100. A desk crash does not kill an in-flight dispense.

## Run it

```bash
cd tintrail
pnpm install
pnpm test
pnpm dev
```

- Desk: http://127.0.0.1:5173
- Runtime: http://127.0.0.1:8787

Catalog colors are synthetic. Inbound BOPIS is a synthetic adapter, not OrderUp.

## Everyday buttons

| Button | Job |
| --- | --- |
| Find | Search a color |
| Match | Read a sample |
| Online | Pull a BOPIS onto the Line |
| Add to line | Walk-in can |
| Scan → Mix → Print → Done | Mix the can |

Paint, finish, size, phone, recipe, pack, mixer, and leftover dump stay behind **More** or **Help → Technician tools**.

## Docs

Binding research and factory rules live in [`docs/tintrail/`](docs/tintrail/README.md).

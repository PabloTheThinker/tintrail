# Launch TintRail on a Windows paint PC (Node 22 + pnpm required).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error "Install Node 22 and pnpm, then run this script again."
}
pnpm install
if (-not (Test-Path "node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3/build/Release/better_sqlite3.node")) {
  pnpm rebuild:sqlite
}
pnpm desktop

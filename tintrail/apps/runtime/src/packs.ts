import type { PackId, PackPolicy } from "@tintrail/shared";

export const PACKS: Record<PackId, PackPolicy> = {
  hd: {
    pack: "hd",
    crossover: "allow-multi-brand",
    offlineCatalog: "full-last-good",
    layout: "hd-pit",
    notify: "off",
    commerce: false,
    inboundAdapter: "synthetic",
    stations: ["D1", "D2"],
    hideBrands: [],
  },
  walmart: {
    pack: "walmart",
    crossover: "allow-multi-brand",
    offlineCatalog: "full-last-good",
    layout: "walmart-compact",
    notify: "off",
    commerce: false,
    inboundAdapter: "synthetic",
    stations: ["D1"],
    hideBrands: [],
  },
  lowes: {
    pack: "lowes",
    crossover: "allow-multi-brand",
    offlineCatalog: "full-last-good",
    layout: "lowes-kds",
    notify: "outbox",
    commerce: true,
    inboundAdapter: "synthetic",
    stations: ["D1", "D2"],
    hideBrands: [],
  },
  ace: {
    pack: "ace",
    crossover: "allow-multi-brand",
    offlineCatalog: "full-last-good",
    layout: "ace-expert",
    notify: "off",
    commerce: false,
    inboundAdapter: "synthetic",
    stations: ["D1"],
    hideBrands: [],
  },
  sherwin: {
    pack: "sherwin",
    crossover: "single-brand",
    offlineCatalog: "full-last-good",
    layout: "sherwin-brand",
    notify: "off",
    commerce: true,
    inboundAdapter: "synthetic",
    stations: ["D1"],
    hideBrands: ["Behr", "Glidden", "PPG"],
  },
};

export function isPackId(value: string): value is PackId {
  return Object.prototype.hasOwnProperty.call(PACKS, value);
}

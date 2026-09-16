import type { InboundOrder } from "@tintrail/shared";

export type InboundAdapter = {
  kind: "synthetic";
  list(): InboundOrder[];
  take(id?: string): InboundOrder | null;
  takeAll(): InboundOrder[];
  seed(): void;
};

export function createSyntheticInbound(factory: () => InboundOrder[]): InboundAdapter {
  const orders: InboundOrder[] = factory();
  return {
    kind: "synthetic",
    list() {
      return orders.slice();
    },
    take(id) {
      if (orders.length === 0) {
        return null;
      }
      if (id === undefined) {
        return orders.shift() ?? null;
      }
      const index = orders.findIndex((row) => row.id === id);
      if (index < 0) {
        return null;
      }
      return orders.splice(index, 1)[0] ?? null;
    },
    takeAll() {
      return orders.splice(0, orders.length);
    },
    seed() {
      if (orders.length === 0) {
        orders.push(...factory());
      }
    },
  };
}

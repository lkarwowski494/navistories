import { buildRoute, type Checkpoint, type Route } from "@navistories/trigger";
import type { Pakiet } from "./schema";

/** Trasa pakietu w postaci, której używa logika wyzwalania. */
export function routeOf(p: Pakiet): Route {
  return buildRoute(p.route.map(([lat, lon]) => ({ lat, lon })));
}

/**
 * Punkty pakietu jako checkpointy logiki wyzwalania. Z filtrem motywów zostają
 * punkty, które mają co najmniej jeden z wybranych motywów; bez filtra wszystkie.
 */
export function checkpointsOf(p: Pakiet, themeFilter?: readonly string[]): Checkpoint[] {
  return p.points
    .filter((pt) => themeFilter === undefined || pt.themes.some((t) => themeFilter.includes(t)))
    .map((pt) => ({ id: pt.id, progressM: pt.progressM, priority: pt.priority }));
}

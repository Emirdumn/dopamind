import type { CarCompareResponse } from "./araba-iq-client";
import type { ArabaIqCompareMessages } from "./araba-iq-messages";
import {
  technicalBalancedLeader,
  performancePowerLeader,
  marketPriceLeader,
  equipmentRichLeader,
} from "./compare-tab-leaders";

export interface TopPickResult {
  leaderCarId: number;
  leaderShortName: string;
  /** How many of the measured dimensions this car wins outright. */
  wins: number;
  /** How many dimensions were measurable across all cars. */
  totalDimensions: number;
  /** Names of the dimensions this car leads, e.g. ["Teknik", "Piyasa"] */
  dimensionsWon: string[];
}

/**
 * ArabaIQ Top Pick — the algorithm's winner across four dimensions
 * (Technical · Performance · Market · Equipment). The lockup in the
 * Compare page is shown when exactly one car has the highest win count
 * and at least 2 measurable dimensions are present.
 *
 * Returns `null` when:
 *   - Fewer than 2 cars are compared.
 *   - Fewer than 2 dimensions produced a leader (signal too weak).
 *   - Two or more cars tie for the most wins (algorithm won't fake a
 *     decision; the lockup is a ceremony reserved for a clear winner).
 */
export function computeTopPick(
  r: CarCompareResponse,
  t: ArabaIqCompareMessages,
  locale: string,
): TopPickResult | null {
  if (r.cars.length < 2) return null;

  const leaders = [
    { name: t.tabTechnical,   leader: technicalBalancedLeader(r, t) },
    { name: t.tabPerformance, leader: performancePowerLeader(r, t, locale) },
    { name: t.tabMarket,      leader: marketPriceLeader(r, t, locale) },
    { name: t.tabEquipment,   leader: equipmentRichLeader(r, t, locale) },
  ].filter((x) => x.leader !== null) as Array<{
    name: string;
    leader: NonNullable<ReturnType<typeof technicalBalancedLeader>>;
  }>;

  if (leaders.length < 2) return null;

  const wins = new Map<number, { count: number; dimensions: string[] }>();
  for (const { name, leader } of leaders) {
    const cur = wins.get(leader.leaderCarId) ?? { count: 0, dimensions: [] };
    cur.count += 1;
    cur.dimensions.push(name);
    wins.set(leader.leaderCarId, cur);
  }

  let best: { carId: number; count: number; dimensions: string[] } | null = null;
  let tie = false;
  for (const [carId, entry] of Array.from(wins.entries())) {
    if (!best || entry.count > best.count) {
      best = { carId, count: entry.count, dimensions: entry.dimensions };
      tie = false;
    } else if (entry.count === best.count) {
      tie = true;
    }
  }

  if (!best || tie) return null;

  const leaderCar = r.cars.find((c) => c.car_variant_id === best!.carId);
  if (!leaderCar) return null;

  return {
    leaderCarId: best.carId,
    leaderShortName: `${leaderCar.brand} ${leaderCar.model}`.trim(),
    wins: best.count,
    totalDimensions: leaders.length,
    dimensionsWon: best.dimensions,
  };
}

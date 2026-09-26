import { Station, Journey, StationSuggestion } from "./types";
import {
  searchStationsHafas,
  searchJourneysHafas,
} from "./hafas-fallback";

const BASE = "https://v6.db.transport.rest";

const TIMEOUT_MS = 5_000;
const MAX_RETRIES = 1;

async function fetchJson<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "trainfinder/1.0" },
        signal: controller.signal,
      });

      if (res.ok) return res.json();

      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      throw new Error(`DB API returned ${res.status}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (attempt < MAX_RETRIES) continue;
        throw new Error("DB API request timed out");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("DB API: max retries exceeded");
}

export async function searchStations(
  query: string
): Promise<StationSuggestion[]> {
  try {
    return await searchStationsRest(query);
  } catch (err) {
    console.warn("REST API failed, falling back to hafas-client:", (err as Error).message);
    return searchStationsHafas(query);
  }
}

async function searchStationsRest(
  query: string
): Promise<StationSuggestion[]> {
  const params = new URLSearchParams({
    query,
    results: "6",
    stops: "true",
    addresses: "false",
    poi: "false",
  });

  const data = await fetchJson<Record<string, unknown>[]>(
    `${BASE}/locations?${params}`
  );

  return data
    .filter(
      (s) =>
        (s.type === "stop" || s.type === "station") &&
        typeof s.id === "string" &&
        typeof s.name === "string"
    )
    .map((s) => ({
      id: s.id as string,
      name: s.name as string,
      location: s.location as Station["location"],
    }));
}

interface JourneySearchOptions {
  departure?: string;
  deutschlandTicketOnly?: boolean;
  results?: number;
}

export async function searchJourneys(
  fromId: string,
  toId: string,
  options: JourneySearchOptions = {}
): Promise<Journey[]> {
  try {
    return await searchJourneysRest(fromId, toId, options);
  } catch (err) {
    console.warn("REST API failed, falling back to hafas-client:", (err as Error).message);
    return searchJourneysHafas(fromId, toId, {
      departure: options.departure,
      results: options.results,
    });
  }
}

async function searchJourneysRest(
  fromId: string,
  toId: string,
  options: JourneySearchOptions = {}
): Promise<Journey[]> {
  const params = new URLSearchParams({
    from: fromId,
    to: toId,
    results: String(options.results ?? 5),
    stopovers: "true",
    language: "de",
  });

  if (options.departure) params.set("departure", options.departure);
  if (options.deutschlandTicketOnly) {
    params.set("deutschlandTicketConnectionsOnly", "true");
  }

  const data = await fetchJson<{ journeys?: Record<string, unknown>[] }>(
    `${BASE}/journeys?${params}`
  );

  if (!data.journeys) return [];

  return data.journeys.map((j, i) => ({
    id: `journey-${i}-${Date.now()}`,
    legs: Array.isArray(j.legs)
      ? j.legs.map((leg: Record<string, unknown>) => ({
          origin: mapStation(leg.origin),
          destination: mapStation(leg.destination),
          departure: (leg.departure as string) ?? "",
          arrival: (leg.arrival as string) ?? "",
          line: leg.line ? mapLine(leg.line as Record<string, unknown>) : undefined,
          direction: (leg.direction as string) ?? undefined,
          walking: leg.walking === true,
        }))
      : [],
    price: j.price
      ? {
          amount: (j.price as Record<string, unknown>).amount as number,
          currency:
            ((j.price as Record<string, unknown>).currency as string) ?? "EUR",
        }
      : undefined,
  }));
}

function mapStation(raw: unknown): Station {
  const s = raw as Record<string, unknown>;
  return {
    id: (s.id as string) ?? "",
    name: (s.name as string) ?? (s.address as string) ?? "Unknown",
    location: s.location
      ? {
          latitude: (s.location as Record<string, number>).latitude,
          longitude: (s.location as Record<string, number>).longitude,
        }
      : undefined,
  };
}

function mapLine(raw: Record<string, unknown>) {
  return {
    name: (raw.name as string) ?? "",
    productName: (raw.productName as string) ?? "",
    product: (raw.product as string) ?? "",
    operator: raw.operator
      ? { name: ((raw.operator as Record<string, string>).name as string) ?? "" }
      : undefined,
  };
}

import { createClient } from "hafas-client";
import { profile as oebbProfile } from "hafas-client/p/oebb/index.js";
import { Station, Journey, StationSuggestion } from "./types";

const oebbClient = createClient(oebbProfile, "trainfinder/1.0");

export async function searchStations(
  query: string
): Promise<StationSuggestion[]> {
  try {
    const results = await oebbClient.locations(query, {
      results: 6,
      fuzzy: true,
      stops: true,
      poi: false,
      addresses: false,
    });

    console.log(`[hafas] oebb profile succeeded for stations`);

    return results
      .filter(
        (s) =>
          (s.type === "stop" || s.type === "station") &&
          typeof s.id === "string" &&
          typeof s.name === "string"
      )
      .map((s) => ({
        id: s.id!,
        name: s.name!,
        location: s.location
          ? { latitude: s.location.latitude!, longitude: s.location.longitude! }
          : undefined,
      }));
  } catch (err) {
    console.warn(`[hafas] oebb profile failed:`, (err as Error).message);
    throw new Error("OEBB HAFAS profile failed to fetch stations");
  }
}

export async function searchJourneys(
  fromId: string,
  toId: string,
  options: { departure?: string; results?: number; deutschlandTicketOnly?: boolean } = {}
): Promise<Journey[]> {
  const hafasOpts: Record<string, unknown> = {
    results: options.results ?? 5,
    stopovers: true,
    language: "de",
  };

  if (options.departure) {
    hafasOpts.departure = new Date(options.departure);
  }

  try {
    const data = await oebbClient.journeys(fromId, toId, hafasOpts);

    console.log(`[hafas] oebb profile succeeded for journeys`);
    if (!data.journeys) return [];

    return data.journeys.map((j, i) => ({
      id: `journey-${i}-${Date.now()}`,
      legs: Array.isArray(j.legs)
        ? j.legs.map((leg) => ({
            origin: mapStation(leg.origin),
            destination: mapStation(leg.destination),
            departure: (leg.departure as string) ?? "",
            arrival: (leg.arrival as string) ?? "",
            line: leg.line
              ? {
                  name: leg.line.name ?? "",
                  productName: leg.line.productName ?? "",
                  product: leg.line.product ?? "",
                  operator: leg.line.operator
                    ? { name: leg.line.operator.name ?? "" }
                    : undefined,
                }
              : undefined,
            direction: leg.direction ?? undefined,
            walking: leg.walking === true,
          }))
        : [],
      price: j.price
        ? {
            amount: j.price.amount as number,
            currency: (j.price.currency as string) ?? "EUR",
          }
        : undefined,
    }));
  } catch (err) {
    console.warn(`[hafas] oebb profile failed:`, (err as Error).message);
    throw new Error("OEBB HAFAS profile failed to fetch journeys");
  }
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

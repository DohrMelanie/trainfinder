import { Journey, AnalyzedJourney, AnalyzedLeg, TicketType } from "./types";
import {
  detectCountry,
  stationIdCountry,
  isInUpperAustria,
  isRegionalProduct,
  isNationalProduct,
  isDeutschlandticketIC,
} from "./geo";

/**
 * Infer the country for a leg using (in priority order):
 *  1. GPS location bounding-box (most accurate)
 *  2. HAFAS EVA station ID prefix (80… = DE, 81… = AT)
 */
function legCountry(
  leg: Journey["legs"][0]
): "DE" | "AT" | "unknown" {
  const byLocation = (() => {
    const o = detectCountry(leg.origin.location);
    const d = detectCountry(leg.destination.location);
    if (o !== "unknown" && o === d) return o;
    if (o !== "unknown") return o;
    if (d !== "unknown") return d;
    return "unknown";
  })();

  if (byLocation !== "unknown") return byLocation;

  // Fallback: infer from EVA station ID prefix
  const o = stationIdCountry(leg.origin.id);
  const d = stationIdCountry(leg.destination.id);
  if (o !== "unknown" && o === d) return o;
  if (o !== "unknown") return o;
  if (d !== "unknown") return d;
  return "unknown";
}

function analyzeLeg(leg: Journey["legs"][0]): AnalyzedLeg {
  if (leg.walking) {
    return {
      leg,
      country: detectCountry(leg.origin.location),
      isRegional: false,
      isInUpperAustria: false,
      ticketUsed: "walking",
    };
  }

  const country = legCountry(leg);
  const product = leg.line?.product;
  // National long-distance trains (ICE, IC, EC) do not accept Deutschlandticket
  const isNational = isNationalProduct(product);
  // A small set of IC trains fill a regional gap and are Deutschlandticket-valid
  const isDTIC = country === "DE" && isDeutschlandticketIC(leg.line?.name);
  const regional = isDTIC || (!isNational && isRegionalProduct(product));

  const originOOE = isInUpperAustria(leg.origin.location);
  const destOOE = isInUpperAustria(leg.destination.location);
  const bothInOOE = originOOE && destOOE;

  let ticketUsed: TicketType = "full-price";

  if (country === "DE" && regional) {
    ticketUsed = "deutschlandticket";
  } else if (country === "AT" && bothInOOE) {
    ticketUsed = "klimaticket-ooe";
  } else if (
    country === "AT" ||
    detectCountry(leg.origin.location) === "AT" ||
    detectCountry(leg.destination.location) === "AT" ||
    stationIdCountry(leg.origin.id) === "AT" ||
    stationIdCountry(leg.destination.id) === "AT"
  ) {
    ticketUsed = "vorteilscard";
  }

  return {
    leg,
    country,
    isRegional: regional,
    isInUpperAustria: bothInOOE,
    ticketUsed,
  };
}

function getDurationMinutes(journey: Journey): number {
  if (journey.legs.length === 0) return 0;
  const dep = new Date(journey.legs[0].departure).getTime();
  const arr = new Date(journey.legs[journey.legs.length - 1].arrival).getTime();
  return Math.round((arr - dep) / 60000);
}

export function analyzeJourney(journey: Journey): AnalyzedJourney {
  const analyzedLegs = journey.legs.map(analyzeLeg);

  return {
    journey,
    analyzedLegs,
    durationMinutes: getDurationMinutes(journey),
    transfers: journey.legs.filter((l) => !l.walking).length - 1,
  };
}

export function sortByDeparture(journeys: AnalyzedJourney[]): AnalyzedJourney[] {
  return [...journeys].sort((a, b) => {
    const depA = a.journey.legs[0]?.departure ? new Date(a.journey.legs[0].departure).getTime() : 0;
    const depB = b.journey.legs[0]?.departure ? new Date(b.journey.legs[0].departure).getTime() : 0;
    return depA - depB;
  });
}

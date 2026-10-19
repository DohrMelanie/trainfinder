import { Journey, AnalyzedJourney, AnalyzedLeg, TicketType } from "./types";
import {
  detectCountry,
  stationIdCountry,
  isInUpperAustria,
  isDeutschlandticketBorderStation,
  isRegionalProduct,
  isNationalProduct,
  isDeutschlandticketIC,
} from "./geo";

/**
 * Infer the country for a leg using (in priority order):
 *  1. HAFAS EVA station ID prefix (80… = DE, 81… = AT)
 *  2. Border station checks
 *  3. GPS location detection
 */
function legCountry(
  leg: Journey["legs"][0]
): "DE" | "AT" | "unknown" {
  const oId = stationIdCountry(leg.origin.id);
  const dId = stationIdCountry(leg.destination.id);

  if (oId !== "unknown" && oId === dId) return oId;

  // Cross-border to/from Deutschlandticket border station
  if (oId === "DE" && isDeutschlandticketBorderStation(leg.destination.id)) return "DE";
  if (dId === "DE" && isDeutschlandticketBorderStation(leg.origin.id)) return "DE";

  if (oId !== "unknown") return oId;
  if (dId !== "unknown") return dId;

  // Fallback to location coordinates
  const o = detectCountry(leg.origin.location);
  const d = detectCountry(leg.destination.location);
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

  const originOOE = isInUpperAustria(leg.origin.location, leg.origin.id);
  const destOOE = isInUpperAustria(leg.destination.location, leg.destination.id);
  const bothInOOE = originOOE && destOOE;

  const isDEBorder =
    (stationIdCountry(leg.origin.id) === "DE" && isDeutschlandticketBorderStation(leg.destination.id)) ||
    (stationIdCountry(leg.destination.id) === "DE" && isDeutschlandticketBorderStation(leg.origin.id));

  let ticketUsed: TicketType = "full-price";

  if ((country === "DE" || isDEBorder) && regional) {
    ticketUsed = "deutschlandticket";
  } else if (bothInOOE) {
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

/**
 * Checks whether a journey satisfies:
 * "Nur Deutschlandticket Verbindungen innerhalb Deutschlands (und in AT OÖ aber alles erlaubt)"
 */
export function isDeutschlandticketConnection(analyzedLegs: AnalyzedLeg[]): boolean {
  const transitLegs = analyzedLegs.filter((al) => !al.leg.walking);
  if (transitLegs.length === 0) return true;

  return transitLegs.every((al) => {
    // In Upper Austria, everything is allowed (Railjet, Westbahn, ICE, regional, etc.)
    if (al.isInUpperAustria || al.ticketUsed === "klimaticket-ooe") {
      return true;
    }

    // Inside Germany or German regional legs: must be valid with Deutschlandticket
    return al.ticketUsed === "deutschlandticket";
  });
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
    isDeutschlandticketValid: isDeutschlandticketConnection(analyzedLegs),
  };
}

export function sortByDeparture(journeys: AnalyzedJourney[]): AnalyzedJourney[] {
  return [...journeys].sort((a, b) => {
    const depA = a.journey.legs[0]?.departure ? new Date(a.journey.legs[0].departure).getTime() : 0;
    const depB = b.journey.legs[0]?.departure ? new Date(b.journey.legs[0].departure).getTime() : 0;
    return depA - depB;
  });
}

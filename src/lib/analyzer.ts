import { Journey, AnalyzedJourney, AnalyzedLeg, TicketType } from "./types";
import { detectCountry, isInUpperAustria, isRegionalProduct } from "./geo";

function analyzeLeg(leg: Journey["legs"][0]): AnalyzedLeg {
  if (leg.walking) {
    return {
      leg,
      country: detectCountry(leg.origin.location),
      isRegional: false,
      isInUpperAustria: false,
      ticketUsed: "walking",
      estimatedPrice: 0,
    };
  }

  const originCountry = detectCountry(leg.origin.location);
  const destCountry = detectCountry(leg.destination.location);
  const regional = isRegionalProduct(leg.line?.product);

  const originOOE = isInUpperAustria(leg.origin.location);
  const destOOE = isInUpperAustria(leg.destination.location);
  const bothInOOE = originOOE && destOOE;

  const country = originCountry === destCountry ? originCountry : "unknown";

  let ticketUsed: TicketType = "full-price";

  if (country === "DE" && regional) {
    ticketUsed = "deutschlandticket";
  } else if (country === "AT" && bothInOOE) {
    ticketUsed = "klimaticket-ooe";
  } else if (country === "AT" || originCountry === "AT" || destCountry === "AT") {
    ticketUsed = "vorteilscard";
  }

  return {
    leg,
    country,
    isRegional: regional,
    isInUpperAustria: bothInOOE,
    ticketUsed,
    estimatedPrice: 0,
  };
}

function estimateSegmentPrices(
  analyzedLegs: AnalyzedLeg[],
  journeyPrice?: Journey["price"]
): AnalyzedLeg[] {
  const paidLegs = analyzedLegs.filter(
    (al) => al.ticketUsed === "vorteilscard" || al.ticketUsed === "full-price"
  );

  if (!journeyPrice || paidLegs.length === 0) return analyzedLegs;

  const pricePerPaidLeg = journeyPrice.amount / paidLegs.length;

  return analyzedLegs.map((al) => {
    if (al.ticketUsed === "vorteilscard") {
      return { ...al, estimatedPrice: pricePerPaidLeg * 0.5 };
    }
    if (al.ticketUsed === "full-price") {
      return { ...al, estimatedPrice: pricePerPaidLeg };
    }
    return al;
  });
}

function getDurationMinutes(journey: Journey): number {
  if (journey.legs.length === 0) return 0;
  const dep = new Date(journey.legs[0].departure).getTime();
  const arr = new Date(journey.legs[journey.legs.length - 1].arrival).getTime();
  return Math.round((arr - dep) / 60000);
}

export function analyzeJourney(journey: Journey): AnalyzedJourney {
  const rawAnalyzed = journey.legs.map(analyzeLeg);
  const analyzedLegs = estimateSegmentPrices(rawAnalyzed, journey.price);

  const totalPrice = analyzedLegs.reduce((sum, al) => sum + al.estimatedPrice, 0);
  const savedAmount = (journey.price?.amount ?? 0) - totalPrice;

  return {
    journey,
    analyzedLegs,
    totalPrice: Math.round(totalPrice * 100) / 100,
    savedAmount: Math.max(0, Math.round(savedAmount * 100) / 100),
    durationMinutes: getDurationMinutes(journey),
    transfers: journey.legs.filter((l) => !l.walking).length - 1,
  };
}

export function sortByPrice(journeys: AnalyzedJourney[]): AnalyzedJourney[] {
  return [...journeys].sort((a, b) => a.totalPrice - b.totalPrice);
}

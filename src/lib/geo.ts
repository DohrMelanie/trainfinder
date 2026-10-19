import { Location } from "./types";

const AUSTRIA_BOUNDS = {
  minLat: 46.37,
  maxLat: 49.02,
  minLng: 9.53,
  maxLng: 17.16,
};

const UPPER_AUSTRIA_BOUNDS = {
  minLat: 47.46,
  maxLat: 48.77,
  minLng: 13.01,
  maxLng: 15.05,
};

export function detectCountry(location?: Location): "DE" | "AT" | "unknown" {
  if (!location) return "unknown";
  const { latitude: lat, longitude: lng } = location;

  if (
    lat >= AUSTRIA_BOUNDS.minLat &&
    lat <= AUSTRIA_BOUNDS.maxLat &&
    lng >= AUSTRIA_BOUNDS.minLng &&
    lng <= AUSTRIA_BOUNDS.maxLng
  ) {
    return "AT";
  }

  if (lat >= 47.0 && lat <= 55.1 && lng >= 5.87 && lng <= 15.04) {
    return "DE";
  }

  return "unknown";
}

export function isInUpperAustria(location?: Location): boolean {
  if (!location) return false;
  const { latitude: lat, longitude: lng } = location;
  return (
    lat >= UPPER_AUSTRIA_BOUNDS.minLat &&
    lat <= UPPER_AUSTRIA_BOUNDS.maxLat &&
    lng >= UPPER_AUSTRIA_BOUNDS.minLng &&
    lng <= UPPER_AUSTRIA_BOUNDS.maxLng
  );
}

/**
 * HAFAS EVA number prefixes:
 *   80xxxxxxx → Germany (DB)
 *   81xxxxxxx → Austria (ÖBB)
 */
export function stationIdCountry(id?: string): "DE" | "AT" | "unknown" {
  if (!id) return "unknown";
  const digits = id.replace(/\D/g, "");
  if (digits.startsWith("80")) return "DE";
  if (digits.startsWith("81")) return "AT";
  return "unknown";
}

/**
 * Products that are valid for the Deutschlandticket (regional transport in DE).
 * ICE / IC / EC ("nationalExpress" / "national") are explicitly excluded.
 */
const REGIONAL_PRODUCTS = new Set([
  "regional",    // RB, RE
  "regionalExp", // REX
  "suburban",    // S-Bahn
  "bus",
  "tram",
  "subway",
  "ferry",
]);

/**
 * Products that are always long-distance trains (ICE, IC, EC, etc.).
 * Exception: certain IC routes that fill a regional gap are Deutschlandticket-valid
 * and are handled separately via DEUTSCHLANDTICKET_IC_LINES.
 */
const NATIONAL_PRODUCTS = new Set([
  "nationalExpress", // ICE, Railjet Xpress
  "national",        // IC, EC, Nightjet (regular long-distance)
]);

/**
 * IC line numbers officially accepted with the Deutschlandticket (2nd class only).
 * Source: https://www.bahn.de/service/individuelle-reise/bahn_und_fahrrad/deutschlandticket
 *
 * These ICs fill a regional-rail gap on specific routes:
 *  IC 87  – Stuttgart–Singen–Konstanz (Gäubahn)
 *  IC 18  – Bremen–Oldenburg–Norddeich Mole
 *  IC 26  – Rostock–Ribnitz–Stralsund
 *  IC 27  – Rostock–Schwerin–Hamburg
 *  IC 35  – Westerland/Sylt–Niebüll (weekdays only – we accept it here broadly)
 *  IC 56  – Dortmund–Siegen–Dillenburg (Sauerland)
 *  IC 61  – Erfurt–Gera
 *  IC 62  – Freilassing–Berchtesgaden
 *  IC 68  – Dresden–Chemnitz
 *  RE 6   – Berlin–Prenzlau  (already product="regional", no special handling needed)
 *
 * HAFAS encodes these as e.g. "IC 87", "IC 18", etc. in line.name
 */
const DEUTSCHLANDTICKET_IC_LINE_NUMBERS = new Set([
  "87", "18", "26", "27", "35", "56", "61", "62", "68",
]);

/**
 * Returns true if a line is an IC that is valid for the Deutschlandticket.
 * Matches line names like "IC 87", "IC87", "IC 18", etc.
 */
export function isDeutschlandticketIC(lineName?: string): boolean {
  if (!lineName) return false;
  const m = lineName.trim().match(/^IC\s*(\d+)$/i);
  if (!m) return false;
  return DEUTSCHLANDTICKET_IC_LINE_NUMBERS.has(m[1]);
}

export function isRegionalProduct(product?: string): boolean {
  return product ? REGIONAL_PRODUCTS.has(product) : false;
}

export function isNationalProduct(product?: string): boolean {
  return product ? NATIONAL_PRODUCTS.has(product) : false;
}

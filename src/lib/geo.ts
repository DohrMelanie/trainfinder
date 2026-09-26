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

const REGIONAL_PRODUCTS = new Set([
  "regional",
  "regionalExp",
  "suburban",
  "bus",
  "tram",
  "subway",
  "ferry",
]);

export function isRegionalProduct(product?: string): boolean {
  return product ? REGIONAL_PRODUCTS.has(product) : false;
}

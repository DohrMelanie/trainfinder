export interface Location {
  latitude: number;
  longitude: number;
}

export interface Station {
  id: string;
  name: string;
  location?: Location;
}

export interface Line {
  name: string;
  productName: string;
  product: string;
  operator?: { name: string };
}

export interface Leg {
  origin: Station;
  destination: Station;
  departure: string;
  arrival: string;
  line?: Line;
  direction?: string;
  walking?: boolean;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Journey {
  id: string;
  legs: Leg[];
  price?: Price;
}

export type TicketType =
  | "deutschlandticket"
  | "klimaticket-ooe"
  | "vorteilscard"
  | "full-price"
  | "walking";

export interface AnalyzedLeg {
  leg: Leg;
  country: "DE" | "AT" | "unknown";
  isRegional: boolean;
  isInUpperAustria: boolean;
  ticketUsed: TicketType;
  estimatedPrice: number;
}

export interface AnalyzedJourney {
  journey: Journey;
  analyzedLegs: AnalyzedLeg[];
  totalPrice: number;
  savedAmount: number;
  durationMinutes: number;
  transfers: number;
}

export interface StationSuggestion {
  id: string;
  name: string;
  location?: Location;
}

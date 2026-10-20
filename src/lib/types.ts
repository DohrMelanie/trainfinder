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

export interface Journey {
  id: string;
  legs: Leg[];
}

export type TicketType =
  | "deutschlandticket"
  | "klimaticket-ooe"
  | "klimaticket-ooe-partial"
  | "vorteilscard"
  | "full-price"
  | "walking";

export interface AnalyzedLeg {
  leg: Leg;
  country: "DE" | "AT" | "unknown";
  isRegional: boolean;
  isInUpperAustria: boolean;
  ticketUsed: TicketType;
  ticketNote?: string;
}

export interface AnalyzedJourney {
  journey: Journey;
  analyzedLegs: AnalyzedLeg[];
  durationMinutes: number;
  transfers: number;
  isDeutschlandticketValid: boolean;
}

export interface StationSuggestion {
  id: string;
  name: string;
  location?: Location;
}

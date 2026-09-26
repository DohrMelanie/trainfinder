declare module "hafas-client" {
  interface HafasClient {
    locations(query: string, opts?: Record<string, unknown>): Promise<HafasLocation[]>;
    journeys(from: string, to: string, opts?: Record<string, unknown>): Promise<{ journeys?: HafasJourney[] }>;
  }

  interface HafasLocation {
    type?: string;
    id?: string;
    name?: string;
    location?: { latitude?: number; longitude?: number };
  }

  interface HafasOperator {
    name?: string;
  }

  interface HafasLine {
    name?: string;
    productName?: string;
    product?: string;
    operator?: HafasOperator;
  }

  interface HafasLeg {
    origin: unknown;
    destination: unknown;
    departure?: string;
    arrival?: string;
    line?: HafasLine;
    direction?: string;
    walking?: boolean;
  }

  interface HafasPrice {
    amount?: number;
    currency?: string;
  }

  interface HafasJourney {
    legs: HafasLeg[];
    price?: HafasPrice;
  }

  function createClient(profile: unknown, userAgent: string): HafasClient;
  export { createClient };
}

declare module "hafas-client/p/db/index.js" {
  const profile: unknown;
  export { profile };
}
declare module "hafas-client/p/oebb/index.js" {
  const profile: unknown;
  export { profile };
}

declare module "hafas-client/p/rmv/index.js" {
  const profile: unknown;
  export { profile };
}

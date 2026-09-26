import { NextResponse } from 'next/server';
import { searchJourneys } from '../../../lib/db-client';
import { analyzeJourney, sortByPrice } from '../../../lib/analyzer';
import { Journey } from '../../../lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromId = searchParams.get('from');
    const toId = searchParams.get('to');
    const departure = searchParams.get('departure') || undefined;

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    const [regularJourneys, dtJourneys] = await Promise.all([
      searchJourneys(fromId, toId, { departure }),
      searchJourneys(fromId, toId, { departure, deutschlandTicketOnly: true }),
    ]);

    const journeyMap = new Map<string, Journey>();

    const getJourneyKey = (journey: Journey) => {
      if (journey.legs.length === 0) return 'empty';
      const firstLeg = journey.legs[0];
      return `${firstLeg.departure}-${journey.legs.length}`;
    };

    [...regularJourneys, ...dtJourneys].forEach((journey) => {
      const key = getJourneyKey(journey);
      if (!journeyMap.has(key)) {
        journeyMap.set(key, journey);
      }
    });

    const uniqueJourneys = Array.from(journeyMap.values());
    const analyzedJourneys = uniqueJourneys.map(analyzeJourney);
    const sortedJourneys = sortByPrice(analyzedJourneys);

    return NextResponse.json(sortedJourneys);
  } catch (error) {
    console.error('Failed to search journeys:', error);
    return NextResponse.json(
      { error: 'Failed to search journeys' },
      { status: 500 }
    );
  }
}

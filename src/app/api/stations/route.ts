import { NextResponse } from 'next/server';
import { searchStations } from '../../../lib/db-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const stations = await searchStations(q);
    return NextResponse.json(stations);
  } catch (error) {
    console.error('Failed to search stations:', error);
    return NextResponse.json(
      { error: 'Failed to search stations' },
      { status: 500 }
    );
  }
}

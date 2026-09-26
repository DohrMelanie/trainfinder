import type { AnalyzedJourney } from '@/lib/types';
import JourneyCard from './JourneyCard';

export default function RouteResults({ journeys }: { journeys: AnalyzedJourney[] }) {
  if (!journeys || journeys.length === 0) {
    return (
      <div className="glass-card empty-state">
        <p>No routes found for the selected date and stations.</p>
      </div>
    );
  }

  // Calculate max savings
  const maxSavings = Math.max(...journeys.map(j => j.savedAmount));

  return (
    <div>
      <div className="results-header">
        <h2>{journeys.length} {journeys.length === 1 ? 'Route' : 'Routes'} Found</h2>
        {maxSavings > 0 && (
          <div className="savings-badge">
            Save up to €{maxSavings.toFixed(2)} with passes
          </div>
        )}
      </div>

      <div className="journeys-list">
        {journeys.map(journey => (
          <JourneyCard key={journey.journey.id} analyzed={journey} />
        ))}
      </div>
    </div>
  );
}

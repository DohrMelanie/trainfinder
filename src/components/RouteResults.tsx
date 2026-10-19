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

  // Count routes that have Deutschlandticket segments
  const dtEligibleCount = journeys.filter(j =>
    j.analyzedLegs.some(al => al.ticketUsed === 'deutschlandticket')
  ).length;

  return (
    <div>
      <div className="results-header">
        <h2>{journeys.length} {journeys.length === 1 ? 'Route' : 'Routes'} Found</h2>
        {dtEligibleCount > 0 && (
          <div className="badge badge-deutschlandticket" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
            {dtEligibleCount} of {journeys.length} {journeys.length === 1 ? 'route includes' : 'routes include'} D-Ticket
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

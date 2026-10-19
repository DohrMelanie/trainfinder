import type { AnalyzedJourney } from '@/lib/types';
import JourneyCard from './JourneyCard';

interface RouteResultsProps {
  journeys: AnalyzedJourney[];
  dtOnlyFilter?: boolean;
  onToggleDtFilter?: (enabled: boolean) => void;
}

export default function RouteResults({ 
  journeys,
  dtOnlyFilter = false,
  onToggleDtFilter,
}: RouteResultsProps) {
  if (!journeys || journeys.length === 0) {
    return (
      <div className="glass-card empty-state">
        <p>No routes found for the selected date, time and stations.</p>
      </div>
    );
  }

  // Count routes that satisfy Deutschlandticket in DE (and all allowed in OÖ)
  const dtEligibleCount = journeys.filter(j => j.isDeutschlandticketValid).length;
  const displayedJourneys = dtOnlyFilter
    ? journeys.filter(j => j.isDeutschlandticketValid)
    : journeys;

  return (
    <div>
      <div className="results-header">
        <div>
          <h2>
            {displayedJourneys.length} {displayedJourneys.length === 1 ? 'Route' : 'Routes'} Found
          </h2>
          {dtOnlyFilter && (
            <span className="results-subtitle">
              Filter: Nur Deutschlandticket in DE (in OÖ alles erlaubt)
            </span>
          )}
        </div>

        <div className="results-filter-toggle">
          <button
            type="button"
            className={`filter-chip ${!dtOnlyFilter ? 'active' : ''}`}
            onClick={() => onToggleDtFilter?.(false)}
          >
            Alle ({journeys.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${dtOnlyFilter ? 'active' : ''}`}
            onClick={() => onToggleDtFilter?.(true)}
            title="Nur Deutschlandticket Verbindungen innerhalb Deutschlands (und in AT OÖ alles erlaubt)"
          >
            ✓ Nur D-Ticket in DE ({dtEligibleCount})
          </button>
        </div>
      </div>

      {displayedJourneys.length === 0 ? (
        <div className="glass-card empty-state">
          <p style={{ marginBottom: '16px' }}>
            Keine Verbindungen gefunden, die in Deutschland ausschließlich das Deutschlandticket nutzen.
          </p>
          <button
            type="button"
            className="submit-btn"
            style={{ margin: '0 auto', padding: '10px 20px', fontSize: '0.9rem' }}
            onClick={() => onToggleDtFilter?.(false)}
          >
            Alle Verbindungen anzeigen ({journeys.length})
          </button>
        </div>
      ) : (
        <div className="journeys-list">
          {displayedJourneys.map((journey) => (
            <JourneyCard key={journey.journey.id} analyzed={journey} />
          ))}
        </div>
      )}
    </div>
  );
}

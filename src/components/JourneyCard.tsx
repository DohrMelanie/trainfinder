'use client';

import { useState } from 'react';
import type { AnalyzedJourney } from '@/lib/types';
import TicketBadge from './TicketBadge';

export default function JourneyCard({ analyzed }: { analyzed: AnalyzedJourney }) {
  const [expanded, setExpanded] = useState(false);
  const { journey, analyzedLegs, totalPrice, savedAmount, durationMinutes, transfers } = analyzed;

  const departure = new Date(journey.legs[0].departure);
  const arrival = new Date(journey.legs[journey.legs.length - 1].arrival);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const originalPrice = totalPrice + savedAmount;

  return (
    <div className="glass-card journey-card">
      <div className="journey-header">
        <div className="journey-times">
          <div className="time-row">
            <span>{formatTime(departure)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span>{formatTime(arrival)}</span>
          </div>
          <div className="duration-info">
            {formatDuration(durationMinutes)} • {transfers} {transfers === 1 ? 'transfer' : 'transfers'}
          </div>
        </div>

        <div className="journey-price">
          <div className="price-current">
            €{totalPrice.toFixed(2)}
          </div>
          {savedAmount > 0 && (
            <div className="price-original">
              €{originalPrice.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {!expanded && (
        <div className="legs-summary">
          {analyzedLegs.map((al, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              {idx > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 4px' }}>
                  <div className="leg-line"></div>
                  <div className="leg-arrow">›</div>
                </div>
              )}
              <TicketBadge type={al.ticketUsed} compact />
            </div>
          ))}
        </div>
      )}

      <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="legs-details">
          {analyzedLegs.map((al, idx) => {
            const legDep = new Date(al.leg.departure);
            const legArr = new Date(al.leg.arrival);
            
            return (
              <div key={idx} className="leg-item">
                <div className="leg-timeline">
                  <div className="timeline-dot"></div>
                  {idx < analyzedLegs.length - 1 && <div className="timeline-line"></div>}
                </div>
                
                <div className="leg-content">
                  <div className="leg-times">
                    {formatTime(legDep)} - {formatTime(legArr)}
                  </div>
                  
                  <div className="leg-stations">
                    {al.leg.origin.name} → {al.leg.destination.name}
                  </div>
                  
                  <div>
                    {al.leg.line && (
                      <span className="leg-train">
                        {al.leg.line.name}
                      </span>
                    )}
                    <TicketBadge type={al.ticketUsed} />
                  </div>
                  
                  {al.estimatedPrice > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Leg cost: €{al.estimatedPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

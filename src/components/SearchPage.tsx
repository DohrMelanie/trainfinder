'use client';

import { useState, useEffect } from 'react';
import StationInput from './StationInput';
import RouteResults from './RouteResults';
import type { AnalyzedJourney, StationSuggestion } from '@/lib/types';

export default function SearchPage() {
  const [from, setFrom] = useState<StationSuggestion | null>(null);
  const [to, setTo] = useState<StationSuggestion | null>(null);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [dtOnly, setDtOnly] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzedJourney[] | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${min}`);
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let departureParam = '';
      if (date) {
        const timeStr = time || '12:00';
        const depDate = new Date(`${date}T${timeStr}:00`);
        if (!isNaN(depDate.getTime())) {
          departureParam = `&departure=${encodeURIComponent(depDate.toISOString())}`;
        }
      }

      const res = await fetch(`/api/search?from=${from.id}&to=${to.id}${departureParam}`);
      if (!res.ok) {
        throw new Error('Failed to fetch routes');
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="search-form glass">
        <div className="inputs-row">
          <StationInput 
            label="From" 
            value={from} 
            onChange={setFrom} 
            placeholder="E.g. München Hbf"
          />
          
          <button 
            type="button" 
            onClick={handleSwap} 
            className="swap-btn"
            aria-label="Swap stations"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v12" />
              <path d="M11 18l-4 4-4-4" />
              <path d="M17 14V2" />
              <path d="M13 6l4-4 4 4" />
            </svg>
          </button>
          
          <StationInput 
            label="To" 
            value={to} 
            onChange={setTo} 
            placeholder="E.g. Linz Hbf"
          />
        </div>
        
        <div className="date-row">
          <div className="input-group">
            <label>Departure Date</label>
            <input 
              type="date" 
              className="date-input" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Departure Time</label>
            <input 
              type="time" 
              className="date-input time-input" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group btn-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={!mounted ? false : (loading || !from || !to || !date)}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Searching...
                </>
              ) : (
                'Find Routes'
              )}
            </button>
          </div>
        </div>

        <div className="filter-row">
          <label className="checkbox-label" title="Nur Verbindungen anzeigen, die in Deutschland ausschließlich das Deutschlandticket nutzen (in OÖ alle Züge erlaubt)">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={dtOnly}
              onChange={(e) => setDtOnly(e.target.checked)}
            />
            <span className="checkbox-custom">
              {dtOnly && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="checkbox-text">
              Nur <strong>Deutschlandticket</strong> in DE (in AT / OÖ alles erlaubt)
            </span>
          </label>
        </div>
      </form>

      {error && (
        <div className="glass-card mb-8 text-center error-text">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <RouteResults 
          journeys={results} 
          dtOnlyFilter={dtOnly}
          onToggleDtFilter={setDtOnly}
        />
      )}
    </div>
  );
}

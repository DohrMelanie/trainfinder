'use client';

import { useState, useEffect } from 'react';
import StationInput from './StationInput';
import RouteResults from './RouteResults';
import type { AnalyzedJourney, StationSuggestion } from '@/lib/types';

export default function SearchPage() {
  const [from, setFrom] = useState<StationSuggestion | null>(null);
  const [to, setTo] = useState<StationSuggestion | null>(null);
  const [date, setDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzedJourney[] | null>(null);

  useEffect(() => {
    setMounted(true);
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
      const res = await fetch(`/api/search?from=${from.id}&to=${to.id}&departure=${date}T10:00:00.000Z`); // appending generic time for demo
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
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
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
      </form>

      {error && (
        <div className="glass-card mb-8 text-center error-text">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <RouteResults journeys={results} />
      )}
    </div>
  );
}

import SearchPage from '@/components/SearchPage';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>Trainfinder</h1>
        <p>
          Find cross-border train connections between Germany and Austria.
          We automatically detect which segments are covered by your Deutschlandticket, Klimaticket OÖ, or ÖBB Vorteilscard.
        </p>
      </header>
      
      <SearchPage />
    </main>
  );
}

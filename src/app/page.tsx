import SearchPage from '@/components/SearchPage';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>Trainfinder</h1>
        <p>
          Find the cheapest cross-border connections from Germany to Austria.
          We automatically apply your Deutschlandticket, Klimaticket OÖ, and ÖBB Vorteilscard to calculate the best price.
        </p>
      </header>
      
      <SearchPage />
    </main>
  );
}

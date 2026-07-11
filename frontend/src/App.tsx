import { useWallet } from "./hooks/useWallet";
import { WalletBar } from "./components/WalletBar";
import { SellerPanel } from "./components/SellerPanel";
import { BuyerPanel } from "./components/BuyerPanel";
import { EventFeed } from "./components/EventFeed";
import { CONTRACT_ID } from "./lib/stellarClient";

function App() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-[1200px] mx-auto">
          <h1 className="text-[20px] font-bold text-on-surface">Stellar Marketplace</h1>
          <WalletBar wallet={wallet} />
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-[36px] leading-[1.2] tracking-[-0.02em] font-bold text-on-surface">Dashboard</h2>
          <p className="text-[14px] text-on-surface-variant mt-2">
            Hash tabanlı güvenli dijital içerik satışı · Stellar Soroban
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-[12px] font-mono text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
          >
            {CONTRACT_ID.slice(0, 6)}…{CONTRACT_ID.slice(-6)}
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
          {!wallet.address && (
            <p className="flex items-center gap-2 mt-4 text-[13px] text-on-surface-variant bg-surface-container-low border border-dashed border-outline-variant rounded-lg px-4 py-3 max-w-fit">
              <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
              Devam etmek için sağ üstten cüzdanınızı bağlayın.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section id="seller">
            <SellerPanel address={wallet.address} />
          </section>
          <section id="buyer">
            <BuyerPanel address={wallet.address} />
          </section>
        </div>

        <div id="events" className="mt-8">
          <EventFeed />
        </div>
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-6 w-full max-w-[1200px] mx-auto gap-4">
          <span className="text-[13px] text-on-surface-variant">Stellar Testnet Demo</span>
          <a
            className="text-[12px] font-medium text-tertiary hover:underline transition-all"
            href="https://stellarwalletskit.dev/"
            target="_blank"
            rel="noreferrer"
          >
            Powered by StellarWalletsKit
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

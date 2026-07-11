import { useWallet } from "./hooks/useWallet";
import { WalletBar } from "./components/WalletBar";
import { SellerPanel } from "./components/SellerPanel";
import { BuyerPanel } from "./components/BuyerPanel";
import { EventFeed } from "./components/EventFeed";
import { ShieldIcon, ExternalLinkIcon } from "./components/icons";
import { CONTRACT_ID } from "./lib/stellarClient";
import "./App.css";

function App() {
  const wallet = useWallet();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <ShieldIcon size={22} />
          </div>
          <div className="brand-text">
            <h1>Rise In Marketplace</h1>
            <p className="brand-sub">Hash tabanlı güvenli dijital içerik satışı · Stellar Soroban</p>
            <a
              className="contract-badge"
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
            >
              {CONTRACT_ID.slice(0, 6)}…{CONTRACT_ID.slice(-6)}
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
        <WalletBar wallet={wallet} />
      </header>

      {!wallet.address && (
        <p className="connect-hint">
          <ShieldIcon size={16} /> Devam etmek için önce sağ üstten cüzdanınızı bağlayın.
        </p>
      )}

      <main className="panels">
        <SellerPanel address={wallet.address} />
        <BuyerPanel address={wallet.address} />
      </main>

      <EventFeed />

      <footer className="app-footer">
        <span>Rise In · Stellar Testnet Demo</span>
        <a href="https://stellarwalletskit.dev/" target="_blank" rel="noreferrer">
          Powered by StellarWalletsKit
        </a>
      </footer>
    </div>
  );
}

export default App;

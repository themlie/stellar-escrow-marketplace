import { useWallet } from "./hooks/useWallet";
import { WalletBar } from "./components/WalletBar";
import { SellerPanel } from "./components/SellerPanel";
import { BuyerPanel } from "./components/BuyerPanel";
import { EventFeed } from "./components/EventFeed";
import { CONTRACT_ID } from "./lib/stellarClient";
import "./App.css";

function App() {
  const wallet = useWallet();

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Rise In — Secure Digital Content Marketplace</h1>
          <p className="contract-id">
            Contract:{" "}
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
            >
              {CONTRACT_ID}
            </a>
          </p>
        </div>
        <WalletBar wallet={wallet} />
      </header>

      {!wallet.address && <p className="connect-hint">Devam etmek için önce cüzdanınızı bağlayın.</p>}

      <main className="panels">
        <SellerPanel address={wallet.address} />
        <BuyerPanel address={wallet.address} />
      </main>

      <EventFeed />
    </div>
  );
}

export default App;

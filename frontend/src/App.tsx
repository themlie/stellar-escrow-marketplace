import { useEffect, useState } from "react";
import { useWallet } from "./hooks/useWallet";
import { WalletBar } from "./components/WalletBar";
import { SellerPanel, type DeliveryPrefill } from "./components/SellerPanel";
import { BuyerPanel } from "./components/BuyerPanel";
import { EventFeed } from "./components/EventFeed";
import { RoleGate, type Role } from "./components/RoleGate";
import { MaterialIcon } from "./components/MaterialIcon";
import { CONTRACT_ID } from "./lib/stellarClient";

const ROLE_STORAGE_KEY = "stellar-marketplace-role";

function App() {
  const wallet = useWallet();
  const [deliveryPrefill, setDeliveryPrefill] = useState<DeliveryPrefill | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === "seller" || saved === "buyer") setRole(saved);
  }, []);

  function selectRole(next: Role) {
    setRole(next);
    sessionStorage.setItem(ROLE_STORAGE_KEY, next);
  }

  function resetRole() {
    setRole(null);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
  }

  function handleUseForDelivery(contentHash: string, buyer: string) {
    setDeliveryPrefill({ contentHash, buyer });
    selectRole("seller");
    requestAnimationFrame(() => {
      document.getElementById("role-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[20px] font-semibold text-on-surface tracking-tight">Stellar Marketplace</h1>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-[11px] font-mono text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
            >
              Contract: {CONTRACT_ID.slice(0, 6)}…{CONTRACT_ID.slice(-6)}
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          </div>
          <WalletBar wallet={wallet} />
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-[34px] leading-[1.2] tracking-tight font-semibold text-on-surface">Dashboard</h2>
            <p className="text-[14px] text-on-surface-variant mt-2">
              Hash tabanlı güvenli dijital içerik satışı · Stellar Soroban
            </p>
            {!wallet.address && (
              <p className="flex items-center gap-2 mt-4 text-[13px] text-on-surface-variant bg-surface-container-low border border-dashed border-outline-variant rounded-lg px-4 py-3 max-w-fit">
                <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                Devam etmek için sağ üstten cüzdanınızı bağlayın.
              </p>
            )}
          </div>
          {wallet.address && role && (
            <button
              onClick={resetRole}
              className="flex items-center gap-1.5 text-[12px] font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-full px-3 py-1.5 transition-colors"
            >
              <MaterialIcon name={role === "seller" ? "store" : "shopping_cart"} className="text-[15px]" />
              {role === "seller" ? "Satıcı" : "Alıcı"} modundasınız · değiştir
            </button>
          )}
        </div>

        {wallet.address && !role && <RoleGate onSelect={selectRole} />}

        {wallet.address && role && (
          <div id="role-panel" className="max-w-2xl mx-auto">
            {role === "seller" ? (
              <SellerPanel address={wallet.address} prefill={deliveryPrefill} />
            ) : (
              <BuyerPanel address={wallet.address} />
            )}
          </div>
        )}

        <div id="events" className="mt-8">
          <EventFeed onUseForDelivery={handleUseForDelivery} />
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

import type { useWallet } from "../hooks/useWallet";
import { WalletIcon } from "./icons";

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletBar({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { address, connecting, error, connect, disconnect } = wallet;

  return (
    <div className="wallet-bar">
      {address ? (
        <div className="wallet-actions">
          <span className="wallet-chip" title={address}>
            <span className="dot" />
            {short(address)}
          </span>
          <button className="btn btn-secondary" onClick={disconnect}>
            Bağlantıyı Kes
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={connect} disabled={connecting}>
          <WalletIcon size={16} />
          {connecting ? "Bağlanıyor…" : "Cüzdan Bağla"}
        </button>
      )}
      {error && <p className="tx-banner error">{error.message}</p>}
    </div>
  );
}

import type { useWallet } from "../hooks/useWallet";

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletBar({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { address, connecting, error, connect, disconnect } = wallet;

  return (
    <div className="wallet-bar">
      {address ? (
        <>
          <span className="wallet-address" title={address}>
            🔗 {short(address)}
          </span>
          <button onClick={disconnect}>Bağlantıyı Kes</button>
        </>
      ) : (
        <button onClick={connect} disabled={connecting}>
          {connecting ? "Bağlanıyor…" : "Cüzdan Bağla"}
        </button>
      )}
      {error && <p className="tx-error">{error.message}</p>}
    </div>
  );
}

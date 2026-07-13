import type { useWallet } from "../hooks/useWallet";
import { MaterialIcon } from "./MaterialIcon";

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletBar({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { address, connecting, error, connect, disconnect } = wallet;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-4">
        {address ? (
          <>
            <div
              className="hidden sm:flex items-center bg-surface-container-high px-4 py-2 rounded-full gap-2 border border-outline-variant"
              title={address}
            >
              <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(63,107,82,0.5)]" />
              <span className="text-[12px] font-medium text-on-surface-variant font-mono">{short(address)}</span>
            </div>
            <button
              className="font-serif bg-primary-container text-on-primary-container border border-outline-variant px-6 py-2 rounded-lg font-semibold tracking-tight primary-glow transition-all active:scale-95"
              onClick={disconnect}
            >
              Bağlantıyı Kes
            </button>
          </>
        ) : (
          <button
            className="font-serif primary-gradient text-white px-6 py-2 rounded-lg font-semibold tracking-tight primary-glow transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            onClick={connect}
            disabled={connecting}
          >
            <MaterialIcon name="account_balance_wallet" className="text-[18px]" />
            {connecting ? "Bağlanıyor…" : "Cüzdan Bağla"}
          </button>
        )}
      </div>
      {error && <p className="text-[12px] text-error max-w-[260px] text-right">{error.message}</p>}
    </div>
  );
}

import type { TxStage } from "../hooks/useTxRunner";
import { MaterialIcon } from "./MaterialIcon";

const LABELS: Record<TxStage, string> = {
  idle: "Hazır",
  building: "Hazırlanıyor…",
  signing: "Cüzdanda imza bekleniyor…",
  pending: "Ağa gönderildi, onay bekleniyor…",
  success: "Başarılı",
  error: "Hata",
};

const COLORS: Record<Exclude<TxStage, "idle">, string> = {
  building: "text-secondary bg-secondary/10",
  signing: "text-secondary bg-secondary/10",
  pending: "text-secondary bg-secondary/10",
  success: "text-tertiary bg-tertiary/10",
  error: "text-error bg-error/10",
};

const BUSY: TxStage[] = ["building", "signing", "pending"];

export function StatusPill({ stage }: { stage: TxStage }) {
  if (stage === "idle") return null;
  const colorClass = COLORS[stage as Exclude<TxStage, "idle">];
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-full mt-2 ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${BUSY.includes(stage) ? "status-dot-pulse" : ""}`} />
      {LABELS[stage]}
    </span>
  );
}

export function TxResult({
  txHash,
  errorMessage,
}: {
  txHash: string | null;
  errorMessage: string | null;
}) {
  if (errorMessage) {
    return (
      <p className="flex items-start gap-2 text-[12.5px] bg-error/10 border border-error/30 text-on-surface rounded-lg px-3 py-2 mt-2">
        <MaterialIcon name="error" className="text-error text-[16px]" />
        {errorMessage}
      </p>
    );
  }
  if (txHash) {
    return (
      <p className="flex items-center gap-2 text-[12.5px] bg-tertiary/10 border border-tertiary/30 text-on-surface rounded-lg px-3 py-2 mt-2">
        <MaterialIcon name="check_circle" className="text-tertiary text-[16px]" />
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-primary hover:underline flex items-center gap-1"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-6)}
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </p>
    );
  }
  return null;
}

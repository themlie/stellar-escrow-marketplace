import type { TxStage } from "../hooks/useTxRunner";

const LABELS: Record<TxStage, string> = {
  idle: "Hazır",
  building: "Hazırlanıyor…",
  signing: "Cüzdanda imza bekleniyor…",
  pending: "Ağa gönderildi, onay bekleniyor…",
  success: "Başarılı",
  error: "Hata",
};

export function StatusPill({ stage }: { stage: TxStage }) {
  if (stage === "idle") return null;
  return <span className={`status-pill status-${stage}`}>{LABELS[stage]}</span>;
}

export function TxResult({
  txHash,
  errorMessage,
}: {
  txHash: string | null;
  errorMessage: string | null;
}) {
  if (errorMessage) {
    return <p className="tx-error">{errorMessage}</p>;
  }
  if (txHash) {
    return (
      <p className="tx-success">
        İşlem hash:{" "}
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-6)}
        </a>
      </p>
    );
  }
  return null;
}

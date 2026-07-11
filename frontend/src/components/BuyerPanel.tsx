import { useState } from "react";
import { getContractClient, NATIVE_TOKEN_ID, stroopsToXlm } from "../lib/stellarClient";
import { sha256OfFile, bufferToHex, hexToBuffer } from "../lib/hash";
import { useTxRunner } from "../hooks/useTxRunner";
import { StatusPill, TxResult } from "./StatusPill";

export function BuyerPanel({ address }: { address: string | null }) {
  const [contentHash, setContentHash] = useState("");
  const [lookupPrice, setLookupPrice] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [verifyResult, setVerifyResult] = useState<"match" | "mismatch" | null>(null);

  const escrowTx = useTxRunner<void>();
  const releaseTx = useTxRunner<void>();
  const refundTx = useTxRunner<void>();

  async function handleLookup() {
    if (!address) return;
    setLookupError(null);
    setLookupPrice(null);
    const client = getContractClient(address);
    try {
      const assembled = await client.get_content({ content_hash: hexToBuffer(contentHash) });
      const result = assembled.result as { isErr(): boolean; unwrapErr(): { message: string }; unwrap(): { price: bigint } };
      if (result.isErr()) {
        setLookupError(result.unwrapErr().message);
        return;
      }
      setLookupPrice(stroopsToXlm(result.unwrap().price));
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleCreateEscrow() {
    if (!address || !lookupPrice) return;
    await escrowTx.run(async () => {
      const client = getContractClient(address);
      return client.create_escrow({
        buyer: address,
        content_hash: hexToBuffer(contentHash),
        token: NATIVE_TOKEN_ID,
        amount: BigInt(Math.round(parseFloat(lookupPrice) * 10_000_000)),
      });
    });
  }

  async function handleVerifyAndRelease() {
    if (!address || !receivedFile) return;
    setVerifyResult(null);
    const actualHash = bufferToHex(await sha256OfFile(receivedFile));
    if (actualHash !== contentHash.trim().toLowerCase()) {
      setVerifyResult("mismatch");
      return;
    }
    setVerifyResult("match");

    await releaseTx.run(async () => {
      const client = getContractClient(address);
      return client.release_payment({
        buyer: address,
        content_hash: hexToBuffer(contentHash),
        token: NATIVE_TOKEN_ID,
      });
    });
  }

  async function handleRefund() {
    if (!address) return;
    await refundTx.run(async () => {
      const client = getContractClient(address);
      return client.refund_timeout({
        buyer: address,
        content_hash: hexToBuffer(contentHash),
        token: NATIVE_TOKEN_ID,
      });
    });
  }

  return (
    <section className="panel">
      <h2>Alıcı Paneli</h2>

      <div className="field-group">
        <h3>1. İçerik Ara &amp; Satın Al</h3>
        <label>
          Content Hash
          <input value={contentHash} onChange={(e) => setContentHash(e.target.value)} placeholder="64 karakter hex" />
        </label>
        <button onClick={handleLookup} disabled={!address}>
          İçeriği Görüntüle
        </button>
        {lookupError && <p className="tx-error">{lookupError}</p>}
        {lookupPrice && (
          <>
            <p>
              Fiyat: <strong>{lookupPrice} XLM</strong>
            </p>
            <button onClick={handleCreateEscrow} disabled={!address || escrowTx.stage === "signing" || escrowTx.stage === "pending"}>
              Satın Al (Escrow Oluştur)
            </button>
          </>
        )}
        <StatusPill stage={escrowTx.stage} />
        <TxResult txHash={escrowTx.txHash} errorMessage={escrowTx.error?.message ?? null} />
      </div>

      <div className="field-group">
        <h3>2. Teslimatı Doğrula &amp; Ödemeyi Onayla</h3>
        <label>
          Teslim Alınan Dosya
          <input type="file" onChange={(e) => setReceivedFile(e.target.files?.[0] ?? null)} />
        </label>
        <button onClick={handleVerifyAndRelease} disabled={!address || !receivedFile}>
          Hash Doğrula ve Ödemeyi Onayla
        </button>
        {verifyResult === "mismatch" && <p className="tx-error">Hash eşleşmedi! İçerik değişmiş olabilir.</p>}
        {verifyResult === "match" && <p className="tx-success">Hash doğrulandı.</p>}
        <StatusPill stage={releaseTx.stage} />
        <TxResult txHash={releaseTx.txHash} errorMessage={releaseTx.error?.message ?? null} />
      </div>

      <div className="field-group">
        <h3>3. Zaman Aşımı İadesi (24 saat sonra)</h3>
        <button onClick={handleRefund} disabled={!address || refundTx.stage === "signing" || refundTx.stage === "pending"}>
          İade Talep Et
        </button>
        <StatusPill stage={refundTx.stage} />
        <TxResult txHash={refundTx.txHash} errorMessage={refundTx.error?.message ?? null} />
      </div>
    </section>
  );
}

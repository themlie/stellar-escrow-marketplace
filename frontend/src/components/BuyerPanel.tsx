import { useState } from "react";
import { getContractClient, NATIVE_TOKEN_ID, stroopsToXlm } from "../lib/stellarClient";
import { sha256OfFile, bufferToHex, hexToBuffer } from "../lib/hash";
import { useTxRunner } from "../hooks/useTxRunner";
import { StatusPill, TxResult } from "./StatusPill";
import { MaterialIcon } from "./MaterialIcon";

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

  const escrowBusy = escrowTx.stage === "signing" || escrowTx.stage === "pending";
  const refundBusy = refundTx.stage === "signing" || refundTx.stage === "pending";

  return (
    <section className="glass-panel rounded-xl p-6 md:p-8 flex flex-col gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="bg-secondary/20 p-2 rounded-lg">
          <MaterialIcon name="shopping_cart" className="text-secondary" />
        </div>
        <h3 className="text-[20px] font-semibold text-on-surface">Alıcı Paneli</h3>
      </div>

      {/* Step 1: search & buy */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="step-circle">1</div>
          <h4 className="font-semibold text-[15px]">İçerik Ara &amp; Satın Al</h4>
        </div>
        <div className="space-y-4 pl-10">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-on-surface-variant">Content Hash</label>
            <input
              className="input-dark w-full rounded-lg px-4 py-3 focus:outline-none"
              placeholder="64 karakter hex"
              value={contentHash}
              onChange={(e) => setContentHash(e.target.value)}
            />
          </div>
          <button
            className="w-full border border-outline-variant text-on-surface py-3 rounded-xl font-bold hover:border-on-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLookup}
            disabled={!address}
          >
            İçeriği Görüntüle
          </button>
          {lookupError && (
            <p className="flex items-center gap-2 text-[12.5px] bg-error/10 border border-error/30 rounded-lg px-3 py-2">
              <MaterialIcon name="error" className="text-error text-[16px]" />
              {lookupError}
            </p>
          )}
          {lookupPrice && (
            <>
              <p className="text-[14px] text-on-surface">
                Fiyat: <strong className="text-primary">{lookupPrice} XLM</strong>
              </p>
              <button
                className="w-full primary-gradient text-white py-3 rounded-xl font-bold primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                onClick={handleCreateEscrow}
                disabled={!address || escrowBusy}
              >
                Satın Al (Escrow Oluştur)
              </button>
            </>
          )}
          <StatusPill stage={escrowTx.stage} />
          <TxResult txHash={escrowTx.txHash} errorMessage={escrowTx.error?.message ?? null} />
        </div>
      </div>

      {/* Step 2: verify & release */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="step-circle">2</div>
          <h4 className="font-semibold text-[15px]">Teslimatı Doğrula &amp; Ödemeyi Onayla</h4>
        </div>
        <div className="space-y-4 pl-10">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-on-surface-variant">Teslim Alınan Dosya</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-surface-container-highest border border-outline-variant px-4 py-2 rounded-lg text-[12px] text-on-surface hover:bg-surface-bright transition-colors">
                Dosya Seç
                <input className="hidden" type="file" onChange={(e) => setReceivedFile(e.target.files?.[0] ?? null)} />
              </label>
              <span className="text-[13px] text-on-surface-variant truncate">{receivedFile?.name ?? "Dosya seçilmedi"}</span>
            </div>
          </div>
          <button
            className="w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleVerifyAndRelease}
            disabled={!address || !receivedFile}
          >
            Hash Doğrula ve Ödemeyi Onayla
          </button>
          {verifyResult === "mismatch" && (
            <p className="flex items-center gap-2 text-[12.5px] text-error">
              <MaterialIcon name="cancel" className="text-[16px]" /> Hash eşleşmedi! İçerik değişmiş olabilir.
            </p>
          )}
          {verifyResult === "match" && (
            <p className="flex items-center gap-2 text-[12.5px] text-tertiary">
              <MaterialIcon name="check_circle" className="text-[16px]" /> Hash doğrulandı.
            </p>
          )}
          <StatusPill stage={releaseTx.stage} />
          <TxResult txHash={releaseTx.txHash} errorMessage={releaseTx.error?.message ?? null} />
        </div>
      </div>

      {/* Step 3: refund */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="step-circle">3</div>
          <h4 className="font-semibold text-[15px]">Zaman Aşımı İadesi (24 saat sonra)</h4>
        </div>
        <div className="pl-10">
          <button
            className="w-full border border-error/50 text-error py-3 rounded-xl font-bold hover:bg-error/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            onClick={handleRefund}
            disabled={!address || refundBusy}
          >
            İade Talep Et
          </button>
          <StatusPill stage={refundTx.stage} />
          <TxResult txHash={refundTx.txHash} errorMessage={refundTx.error?.message ?? null} />
        </div>
      </div>
    </section>
  );
}

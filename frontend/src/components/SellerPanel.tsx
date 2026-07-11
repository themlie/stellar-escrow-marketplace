import { useEffect, useState } from "react";
import { getContractClient, xlmToStroops } from "../lib/stellarClient";
import { sha256OfFile, sha256OfText, bufferToHex, hexToBuffer } from "../lib/hash";
import { useTxRunner } from "../hooks/useTxRunner";
import { StatusPill, TxResult } from "./StatusPill";
import { MaterialIcon } from "./MaterialIcon";

export interface DeliveryPrefill {
  contentHash: string;
  buyer: string;
}

export function SellerPanel({ address, prefill }: { address: string | null; prefill?: DeliveryPrefill | null }) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10");
  const [file, setFile] = useState<File | null>(null);
  const [contentHashHex, setContentHashHex] = useState<string | null>(null);

  const [buyerForDelivery, setBuyerForDelivery] = useState("");
  const [contentHashForDelivery, setContentHashForDelivery] = useState("");

  useEffect(() => {
    if (!prefill) return;
    setContentHashForDelivery(prefill.contentHash);
    setBuyerForDelivery(prefill.buyer);
  }, [prefill]);

  const registerTx = useTxRunner<void>();
  const deliverTx = useTxRunner<void>();

  async function handleRegister() {
    if (!address) return;
    const hash = file ? await sha256OfFile(file) : await sha256OfText(description || "empty");
    setContentHashHex(bufferToHex(hash));

    await registerTx.run(async () => {
      const client = getContractClient(address);
      return client.register_content({
        seller: address,
        content_hash: hash,
        price: xlmToStroops(price),
        description,
      });
    });
  }

  async function handleMarkDelivered() {
    if (!address) return;
    await deliverTx.run(async () => {
      const client = getContractClient(address);
      return client.mark_delivered({
        seller: address,
        content_hash: hexToBuffer(contentHashForDelivery),
        buyer: buyerForDelivery,
      });
    });
  }

  const registerBusy = registerTx.stage === "signing" || registerTx.stage === "pending";
  const deliverBusy = deliverTx.stage === "signing" || deliverTx.stage === "pending";
  const showDeliverStep = !!contentHashHex || !!prefill;

  return (
    <section className="glass-panel rounded-xl p-6 md:p-8 flex flex-col gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <MaterialIcon name="store" className="text-primary" />
        </div>
        <h3 className="text-[20px] font-semibold text-on-surface">Satıcı Paneli</h3>
      </div>

      {/* Step 1: register content */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="step-circle">1</div>
          <h4 className="font-semibold text-[15px]">İçerik Kaydet</h4>
        </div>
        <div className="space-y-4 pl-10">
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-on-surface-variant">Açıklama</label>
            <input
              className="input-dark w-full rounded-lg px-4 py-3 focus:outline-none"
              placeholder="Örn: Premium Kod Paketi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-on-surface-variant">Fiyat (XLM)</label>
            <input
              className="input-dark w-full rounded-lg px-4 py-3 focus:outline-none"
              type="number"
              min="0"
              step="0.0000001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-on-surface-variant">
              Dosya (opsiyonel — verilmezse açıklama metni hash&apos;lenir)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-surface-container-highest border border-outline-variant px-4 py-2 rounded-lg text-[12px] text-on-surface hover:bg-surface-bright transition-colors">
                Dosya Seç
                <input className="hidden" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <span className="text-[13px] text-on-surface-variant truncate">{file?.name ?? "Dosya seçilmedi"}</span>
            </div>
          </div>

          <button
            className="w-full primary-gradient text-white py-3 rounded-xl font-bold primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={handleRegister}
            disabled={!address || registerBusy}
          >
            İçeriği Kaydet
          </button>
          <StatusPill stage={registerTx.stage} />
          <TxResult txHash={registerTx.txHash} errorMessage={registerTx.error?.message ?? null} />
          {contentHashHex && (
            <p className="text-[11px] text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 break-all">
              content_hash: <code className="text-on-surface">{contentHashHex}</code>
            </p>
          )}
        </div>
      </div>

      {/* Step 2: mark delivered — only relevant once there's something registered or a pending delivery */}
      {showDeliverStep ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="step-circle">2</div>
            <h4 className="font-semibold text-[15px]">Teslimat İşaretle</h4>
          </div>
          <div className="space-y-4 pl-10">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-on-surface-variant">Content Hash</label>
              <input
                className="input-dark w-full rounded-lg px-4 py-3 focus:outline-none"
                placeholder="64 karakter hex"
                value={contentHashForDelivery}
                onChange={(e) => setContentHashForDelivery(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-on-surface-variant">Alıcı Adresi</label>
              <input
                className="input-dark w-full rounded-lg px-4 py-3 focus:outline-none"
                placeholder="G..."
                value={buyerForDelivery}
                onChange={(e) => setBuyerForDelivery(e.target.value)}
              />
            </div>

            <button
              className="w-full border border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              onClick={handleMarkDelivered}
              disabled={!address || deliverBusy}
            >
              Teslim Edildi Olarak İşaretle
            </button>
            <StatusPill stage={deliverTx.stage} />
            <TxResult txHash={deliverTx.txHash} errorMessage={deliverTx.error?.message ?? null} />
          </div>
        </div>
      ) : (
        <p className="text-[12.5px] text-on-surface-variant pl-10">
          İçerik kaydettikten sonra (ya da olaylar akışından bir alıcı geldiğinde) burada teslimat işaretleme seçeneği görünecek.
        </p>
      )}
    </section>
  );
}

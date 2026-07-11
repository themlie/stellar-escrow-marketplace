import { useState } from "react";
import { getContractClient, xlmToStroops } from "../lib/stellarClient";
import { sha256OfFile, sha256OfText, bufferToHex, hexToBuffer } from "../lib/hash";
import { useTxRunner } from "../hooks/useTxRunner";
import { StatusPill, TxResult } from "./StatusPill";
import { TagIcon } from "./icons";

export function SellerPanel({ address }: { address: string | null }) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10");
  const [file, setFile] = useState<File | null>(null);
  const [contentHashHex, setContentHashHex] = useState<string | null>(null);

  const [buyerForDelivery, setBuyerForDelivery] = useState("");
  const [contentHashForDelivery, setContentHashForDelivery] = useState("");

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

  return (
    <section className="panel">
      <div className="panel-head seller">
        <div className="icon-badge">
          <TagIcon size={18} />
        </div>
        <h2>Satıcı Paneli</h2>
      </div>

      <div className="panel-body">
        <div className="step">
          <span className="step-index">1</span>
          <div className="step-content">
            <div className="step-title">İçerik Kaydet</div>

            <div className="field">
              <label>Açıklama</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn: Premium Kod Paketi" />
            </div>
            <div className="field">
              <label>Fiyat (XLM)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.0000001" />
            </div>
            <div className="field">
              <label>Dosya (opsiyonel — verilmezse açıklama metni hash&apos;lenir)</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <button className="btn btn-primary btn-block" onClick={handleRegister} disabled={!address || registerBusy}>
              İçeriği Kaydet
            </button>
            <StatusPill stage={registerTx.stage} />
            <TxResult txHash={registerTx.txHash} errorMessage={registerTx.error?.message ?? null} />
            {contentHashHex && (
              <p className="hash-display">
                content_hash: <code>{contentHashHex}</code>
              </p>
            )}
          </div>
        </div>

        <div className="step">
          <span className="step-index">2</span>
          <div className="step-content">
            <div className="step-title">Teslimat İşaretle</div>

            <div className="field">
              <label>Content Hash</label>
              <input value={contentHashForDelivery} onChange={(e) => setContentHashForDelivery(e.target.value)} placeholder="64 karakter hex" />
            </div>
            <div className="field">
              <label>Alıcı Adresi</label>
              <input value={buyerForDelivery} onChange={(e) => setBuyerForDelivery(e.target.value)} placeholder="G..." />
            </div>

            <button className="btn btn-secondary btn-block" onClick={handleMarkDelivered} disabled={!address || deliverBusy}>
              Teslim Edildi Olarak İşaretle
            </button>
            <StatusPill stage={deliverTx.stage} />
            <TxResult txHash={deliverTx.txHash} errorMessage={deliverTx.error?.message ?? null} />
          </div>
        </div>
      </div>
    </section>
  );
}

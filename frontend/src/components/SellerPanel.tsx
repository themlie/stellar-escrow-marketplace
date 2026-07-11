import { useState } from "react";
import { getContractClient, xlmToStroops } from "../lib/stellarClient";
import { sha256OfFile, sha256OfText, bufferToHex, hexToBuffer } from "../lib/hash";
import { useTxRunner } from "../hooks/useTxRunner";
import { StatusPill, TxResult } from "./StatusPill";

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

  return (
    <section className="panel">
      <h2>Satıcı Paneli</h2>

      <div className="field-group">
        <h3>1. İçerik Kaydet</h3>
        <label>
          Açıklama
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn: Premium Kod Paketi" />
        </label>
        <label>
          Fiyat (XLM)
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.0000001" />
        </label>
        <label>
          Dosya (opsiyonel — verilmezse açıklama metni hash'lenir)
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button onClick={handleRegister} disabled={!address || registerTx.stage === "signing" || registerTx.stage === "pending"}>
          İçeriği Kaydet
        </button>
        <StatusPill stage={registerTx.stage} />
        <TxResult txHash={registerTx.txHash} errorMessage={registerTx.error?.message ?? null} />
        {contentHashHex && (
          <p className="hash-display">
            Content hash: <code>{contentHashHex}</code>
          </p>
        )}
      </div>

      <div className="field-group">
        <h3>2. Teslimat İşaretle</h3>
        <label>
          Content Hash
          <input value={contentHashForDelivery} onChange={(e) => setContentHashForDelivery(e.target.value)} placeholder="64 karakter hex" />
        </label>
        <label>
          Alıcı Adresi
          <input value={buyerForDelivery} onChange={(e) => setBuyerForDelivery(e.target.value)} placeholder="G..." />
        </label>
        <button onClick={handleMarkDelivered} disabled={!address || deliverTx.stage === "signing" || deliverTx.stage === "pending"}>
          Teslim Edildi Olarak İşaretle
        </button>
        <StatusPill stage={deliverTx.stage} />
        <TxResult txHash={deliverTx.txHash} errorMessage={deliverTx.error?.message ?? null} />
      </div>
    </section>
  );
}

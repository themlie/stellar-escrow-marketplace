import { useEffect, useRef, useState } from "react";
import { fetchContractEvents, getLatestLedgerSequence, type ContractEvent } from "../lib/events";
import { MaterialIcon } from "./MaterialIcon";

const POLL_MS = 6000;
const MAX_EVENTS = 25;

const EVENT_COLOR: Record<string, string> = {
  escrow_created: "bg-secondary",
  content_delivered: "bg-secondary",
  payment_released: "bg-tertiary",
  refund_issued: "bg-error",
};

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function EventFeed({
  onUseForDelivery,
}: {
  onUseForDelivery?: (contentHash: string, buyer: string) => void;
}) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [live, setLive] = useState(false);
  const cursorRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        if (cursorRef.current === null) {
          const latest = await getLatestLedgerSequence();
          cursorRef.current = Math.max(latest - 100, 1);
        }
        const { events: fresh, latestLedger } = await fetchContractEvents(cursorRef.current);
        if (!cancelled) {
          if (fresh.length > 0) {
            setEvents((prev) => [...fresh].reverse().concat(prev).slice(0, MAX_EVENTS));
          }
          cursorRef.current = latestLedger + 1;
          setLive(true);
        }
      } catch {
        if (!cancelled) setLive(false);
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="glass-panel rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-3">
          <MaterialIcon name={live ? "podcasts" : "pause"} className="text-tertiary" />
          <h3 className="font-serif text-[21px] font-semibold text-on-surface tracking-tight">Canlı Event Akışı</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-tertiary-container/30 border border-tertiary/20 rounded-full">
          <div className={`w-2 h-2 bg-tertiary rounded-full ${live ? "animate-pulse" : ""}`} />
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">{live ? "Canlı" : "Bağlanıyor"}</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center opacity-40">
            <MaterialIcon name="history" className="text-[32px]" />
          </div>
          <p className="text-[14px] text-on-surface-variant max-w-sm">
            Henüz event yok. Bir işlem yapıldığında burada anında görünecek.
          </p>
          <div className="w-full max-w-md h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full w-1/3 primary-gradient shimmer" />
          </div>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-outline-variant/60">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center gap-3 px-6 py-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 self-start ${EVENT_COLOR[ev.name] ?? "bg-primary"}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-on-surface">{ev.name}</div>
                <div className="text-[11px] font-mono text-on-surface-variant">ledger #{ev.ledger}</div>
                {ev.name === "escrow_created" && ev.actor && ev.contentHashHex && (
                  <div className="mt-1 text-[11px] font-mono text-on-surface-variant">
                    Alıcı: <span className="text-on-surface">{short(ev.actor)}</span>
                  </div>
                )}
              </div>
              {ev.name === "escrow_created" && ev.actor && ev.contentHashHex && onUseForDelivery && (
                <button
                  onClick={() => onUseForDelivery(ev.contentHashHex!, ev.actor!)}
                  className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Teslim İşaretle
                </button>
              )}
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[12px] text-primary hover:underline flex-shrink-0"
              >
                tx <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

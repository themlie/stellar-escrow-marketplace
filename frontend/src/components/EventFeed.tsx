import { useEffect, useRef, useState } from "react";
import { fetchContractEvents, getLatestLedgerSequence, type ContractEvent } from "../lib/events";
import { PulseIcon, ExternalLinkIcon } from "./icons";

const POLL_MS = 6000;
const MAX_EVENTS = 25;

const EVENT_KIND: Record<string, string> = {
  escrow_created: "escrow",
  content_delivered: "escrow",
  payment_released: "success",
  refund_issued: "refund",
};

export function EventFeed() {
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
    <section className="panel event-feed">
      <div className="panel-head">
        <div className="panel-head-title">
          <div className="icon-badge">
            <PulseIcon size={17} />
          </div>
          <h2>Canlı Event Akışı</h2>
        </div>
        <span className={`live-badge ${live ? "live" : ""}`}>
          <span className="dot" />
          {live ? "CANLI" : "BAĞLANIYOR"}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="event-empty">Henüz event yok. Bir işlem yapıldığında burada anında görünecek.</p>
      ) : (
        <ul className="event-list">
          {events.map((ev) => (
            <li key={ev.id} className="event-item" data-kind={EVENT_KIND[ev.name] ?? "default"}>
              <div>
                <div className="event-name">{ev.name}</div>
                <div className="event-meta">ledger #{ev.ledger}</div>
              </div>
              <a
                className="event-tx"
                href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                tx <ExternalLinkIcon />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { fetchContractEvents, getLatestLedgerSequence, type ContractEvent } from "../lib/events";

const POLL_MS = 6000;
const MAX_EVENTS = 25;

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
      <h2>
        Canlı Event Akışı <span className={`live-dot ${live ? "live" : ""}`} />
      </h2>
      {events.length === 0 && <p className="muted">Henüz event yok. Bir işlem yapıldığında burada görünecek.</p>}
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            <span className="event-name">{ev.name}</span>
            <span className="event-ledger">ledger #{ev.ledger}</span>
            <a
              className="event-tx"
              href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              tx
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

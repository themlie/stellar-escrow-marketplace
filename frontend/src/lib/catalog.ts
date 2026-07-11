import { Buffer } from "buffer";
import { scValToNative } from "rise-in-contract-client";
import { server, CONTRACT_ID, getContractClient, stroopsToXlm } from "./stellarClient";

export interface CatalogItem {
  contentHash: string;
  seller: string;
  price: string;
  description: string;
}

interface RegistrationInfo {
  seller: string;
  registeredLedger: number;
  deletedLedger?: number;
}

function isBytes32(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array && value.length === 32;
}

/**
 * Soroban RPC only scans a bounded ledger window per `getEvents` call (far
 * less than its retention window) and hands back a cursor to continue from,
 * even when it found zero matching events in that window. A single call is
 * therefore not enough to cover a lookback of any real size — we have to
 * keep following the cursor until we've caught up to the reported tip.
 */
function cursorLedger(cursor: string): number {
  const [idPart] = cursor.split("-");
  return Number(BigInt(idPart) >> 32n);
}

const MAX_PAGES = 15;

/** Scans recent contract events for content_registered/content_deleted to discover known content hashes. */
async function fetchRegistrations(): Promise<Map<string, RegistrationInfo>> {
  const latest = await server.getLatestLedger();
  const map = new Map<string, RegistrationInfo>();
  const startLedger = Math.max(latest.sequence - 17280, 2);

  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    let resp;
    try {
      resp = await server.getEvents(
        cursor
          ? { filters: [{ type: "contract", contractIds: [CONTRACT_ID] }], cursor, limit: 100 }
          : { filters: [{ type: "contract", contractIds: [CONTRACT_ID] }], startLedger, limit: 100 }
      );
    } catch {
      break;
    }

    for (const ev of resp.events) {
      let name: unknown;
      try {
        name = scValToNative(ev.topic[0]);
      } catch {
        continue;
      }
      if (name !== "content_registered" && name !== "content_deleted") continue;

      let hashHex: string | null = null;
      try {
        const value = scValToNative(ev.value);
        if (isBytes32(value)) hashHex = Buffer.from(value).toString("hex");
      } catch {
        continue;
      }
      if (!hashHex) continue;

      let seller = "";
      try {
        const decodedActor = scValToNative(ev.topic[1]);
        if (typeof decodedActor === "string") seller = decodedActor;
      } catch {
        // leave seller blank if undecodable
      }

      const entry = map.get(hashHex) ?? { seller, registeredLedger: 0 };
      if (name === "content_registered") {
        entry.registeredLedger = ev.ledger;
        entry.seller = seller;
      } else {
        entry.deletedLedger = ev.ledger;
      }
      map.set(hashHex, entry);
    }

    if (!resp.cursor) break;
    if (cursorLedger(resp.cursor) >= resp.latestLedger) break;
    cursor = resp.cursor;
  }

  return map;
}

/** Builds a buyer-facing catalog by cross-referencing registration events with live get_content reads. */
export async function fetchContentCatalog(readerAddress: string): Promise<CatalogItem[]> {
  const registrations = await fetchRegistrations();
  const client = getContractClient(readerAddress);
  const items: CatalogItem[] = [];

  for (const [hash, info] of registrations) {
    if (info.deletedLedger && info.deletedLedger > info.registeredLedger) continue;
    try {
      const assembled = await client.get_content({ content_hash: Buffer.from(hash, "hex") });
      const result = assembled.result as {
        isErr(): boolean;
        unwrap(): { price: bigint; description: string; seller: string };
      };
      if (result.isErr()) continue;
      const value = result.unwrap();
      items.push({
        contentHash: hash,
        seller: value.seller,
        price: stroopsToXlm(value.price),
        description: value.description,
      });
    } catch {
      // skip entries we can't read right now (e.g. RPC hiccup)
    }
  }

  return items.sort((a, b) => a.description.localeCompare(b.description));
}

import { Buffer } from "buffer";
import { scValToNative } from "rise-in-contract-client";
import { server, CONTRACT_ID } from "./stellarClient";

export interface ContractEvent {
  id: string;
  ledger: number;
  closedAt: string;
  txHash: string;
  name: string;
  data: unknown;
  /** The second topic, when present — usually the buyer/seller address tied to this event. */
  actor?: string;
  /** A 32-byte content hash found in the topics/data, hex-encoded, when this event carries one. */
  contentHashHex?: string;
}

interface RawEvent {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
  topic: unknown[];
  value: unknown;
}

function isBytes32(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array && value.length === 32;
}

function findContentHash(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (isBytes32(candidate)) {
      return Buffer.from(candidate).toString("hex");
    }
    if (Array.isArray(candidate)) {
      const found = candidate.find(isBytes32);
      if (found) return Buffer.from(found).toString("hex");
    }
  }
  return undefined;
}

function decodeScVal(value: unknown): unknown {
  try {
    return scValToNative(value as Parameters<typeof scValToNative>[0]);
  } catch {
    return null;
  }
}

function decodeEvent(raw: RawEvent): ContractEvent {
  const decodedName = decodeScVal(raw.topic[0]);
  const name = typeof decodedName === "string" ? decodedName : String(decodedName ?? "unknown");

  const decodedActor = raw.topic[1] !== undefined ? decodeScVal(raw.topic[1]) : undefined;
  const actor = typeof decodedActor === "string" ? decodedActor : undefined;

  const data = decodeScVal(raw.value);
  const contentHashHex = findContentHash(data);

  return {
    id: raw.id,
    ledger: raw.ledger,
    closedAt: raw.ledgerClosedAt,
    txHash: raw.txHash,
    name,
    data,
    actor,
    contentHashHex,
  };
}

/** Fetches events for this contract starting at `fromLedger` (inclusive). */
export async function fetchContractEvents(fromLedger: number): Promise<{
  events: ContractEvent[];
  latestLedger: number;
}> {
  const resp = await server.getEvents({
    startLedger: fromLedger,
    filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
    limit: 100,
  });
  return {
    events: resp.events.map((e) => decodeEvent(e as unknown as RawEvent)),
    latestLedger: resp.latestLedger,
  };
}

export async function getLatestLedgerSequence(): Promise<number> {
  const latest = await server.getLatestLedger();
  return latest.sequence;
}

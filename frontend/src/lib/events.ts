import { scValToNative } from "rise-in-contract-client";
import { server, CONTRACT_ID } from "./stellarClient";

export interface ContractEvent {
  id: string;
  ledger: number;
  closedAt: string;
  txHash: string;
  name: string;
  data: unknown;
}

interface RawEvent {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
  topic: unknown[];
  value: unknown;
}

function decodeEvent(raw: RawEvent): ContractEvent {
  let name = "unknown";
  try {
    const decodedTopic = scValToNative(raw.topic[0] as Parameters<typeof scValToNative>[0]);
    name = typeof decodedTopic === "string" ? decodedTopic : String(decodedTopic);
  } catch {
    // leave name as "unknown" if topic decoding fails
  }
  let data: unknown = null;
  try {
    data = scValToNative(raw.value as Parameters<typeof scValToNative>[0]);
  } catch {
    data = null;
  }
  return {
    id: raw.id,
    ledger: raw.ledger,
    closedAt: raw.ledgerClosedAt,
    txHash: raw.txHash,
    name,
    data,
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

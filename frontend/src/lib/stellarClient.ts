import { Client, networks, rpc, Asset } from "rise-in-contract-client";
import { signTransaction } from "./wallet";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
export const CONTRACT_ID = networks.testnet.contractId;

export const server = new rpc.Server(RPC_URL);

/** Native XLM's Stellar Asset Contract id, derived for the active network. */
export const NATIVE_TOKEN_ID = Asset.native().contractId(NETWORK_PASSPHRASE);

export function getContractClient(publicKey: string) {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction,
  });
}

export function stroopsToXlm(stroops: bigint): string {
  return (Number(stroops) / 10_000_000).toString();
}

export function xlmToStroops(xlm: string): bigint {
  return BigInt(Math.round(parseFloat(xlm) * 10_000_000));
}

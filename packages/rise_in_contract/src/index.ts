import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBBVCK6MLR7HPWWIJOC6IUBPHE337BOEVT2P7PSE2TEVRJHGOWESOPWU",
  }
} as const

export type StorageKey = {tag: "Content", values: readonly [Buffer]} | {tag: "Escrow", values: readonly [Buffer, string]} | {tag: "Stats", values: void};

/**
 * Escrow state machine
 */
export type EscrowState = {tag: "Locked", values: void} | {tag: "Delivered", values: void} | {tag: "Completed", values: void} | {tag: "Refunded", values: void};


/**
 * Content registration data — Persistent storage
 */
export interface ContentInfo {
  content_hash: Buffer;
  description: string;
  price: i128;
  registered_at: u64;
  seller: string;
}


/**
 * Escrow agreement — Persistent storage
 */
export interface EscrowAgreement {
  amount: i128;
  buyer: string;
  content_hash: Buffer;
  created_at: u64;
  delivered_at: Option<u64>;
  seller: string;
  state: EscrowState;
  timeout_at: u64;
}


/**
 * Contract statistics — Instance storage
 */
export interface ContractStats {
  total_completed: u64;
  total_contents: u64;
  total_escrows: u64;
  total_volume: i128;
}

/**
 * Rise In Contract Error Codes
 */
export const Errors = {
  /**
   * Content already registered with this hash
   */
  1: {message:"AlreadyRegistered"},
  /**
   * Content not found in registry
   */
  2: {message:"ContentNotFound"},
  /**
   * Escrow agreement not found
   */
  3: {message:"EscrowNotFound"},
  /**
   * Caller is not authorized for this operation
   */
  4: {message:"Unauthorized"},
  /**
   * Escrow already exists for this content and buyer
   */
  5: {message:"EscrowAlreadyExists"},
  /**
   * Escrow is not in the expected state
   */
  6: {message:"InvalidEscrowState"},
  /**
   * Payment amount doesn't match the content price
   */
  7: {message:"InvalidPaymentAmount"},
  /**
   * Timeout period has not elapsed yet
   */
  8: {message:"TimeoutNotReached"},
  /**
   * Hash verification failed
   */
  9: {message:"HashMismatch"},
  /**
   * Invalid price (must be greater than 0)
   */
  10: {message:"InvalidPrice"},
  /**
   * Content has active escrows and cannot be deleted
   */
  11: {message:"ContentHasActiveEscrows"}
}

export interface Client {
  /**
   * Construct and simulate a register_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_content: ({seller, content_hash, price, description}: {seller: string, content_hash: Buffer, price: i128, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_content: ({content_hash}: {content_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ContentInfo>>>

  /**
   * Construct and simulate a delete_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  delete_content: ({seller, content_hash}: {seller: string, content_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_escrow: ({buyer, content_hash, token, amount}: {buyer: string, content_hash: Buffer, token: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a mark_delivered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mark_delivered: ({seller, content_hash, buyer}: {seller: string, content_hash: Buffer, buyer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a release_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  release_payment: ({buyer, content_hash, token}: {buyer: string, content_hash: Buffer, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a refund_timeout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_timeout: ({buyer, content_hash, token}: {buyer: string, content_hash: Buffer, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_escrow: ({content_hash, buyer}: {content_hash: Buffer, buyer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<EscrowAgreement>>>

  /**
   * Construct and simulate a get_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_stats: (options?: MethodOptions) => Promise<AssembledTransaction<ContractStats>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAQcmVnaXN0ZXJfY29udGVudAAAAAQAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAALZ2V0X2NvbnRlbnQAAAAAAQAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAABAAAD6QAAB9AAAAALQ29udGVudEluZm8AAAAAAw==",
        "AAAAAAAAAAAAAAAOZGVsZXRlX2NvbnRlbnQAAAAAAAIAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAANY3JlYXRlX2VzY3JvdwAAAAAAAAQAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAObWFya19kZWxpdmVyZWQAAAAAAAMAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAPcmVsZWFzZV9wYXltZW50AAAAAAMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABXRva2VuAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAOcmVmdW5kX3RpbWVvdXQAAAAAAAMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABXRva2VuAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAKZ2V0X2VzY3JvdwAAAAAAAgAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAEAAAPpAAAH0AAAAA9Fc2Nyb3dBZ3JlZW1lbnQAAAAAAw==",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRzAAAAAAAAAAAAAAEAAAfQAAAADUNvbnRyYWN0U3RhdHMAAAA=",
        "AAAAAgAAAAAAAAAAAAAAClN0b3JhZ2VLZXkAAAAAAAMAAAABAAAAAAAAAAdDb250ZW50AAAAAAEAAAPuAAAAIAAAAAEAAAAAAAAABkVzY3JvdwAAAAAAAgAAA+4AAAAgAAAAEwAAAAAAAAAAAAAABVN0YXRzAAAA",
        "AAAAAgAAABRFc2Nyb3cgc3RhdGUgbWFjaGluZQAAAAAAAAALRXNjcm93U3RhdGUAAAAABAAAAAAAAAAAAAAABkxvY2tlZAAAAAAAAAAAAAAAAAAJRGVsaXZlcmVkAAAAAAAAAAAAAAAAAAAJQ29tcGxldGVkAAAAAAAAAAAAAAAAAAAIUmVmdW5kZWQ=",
        "AAAAAQAAADBDb250ZW50IHJlZ2lzdHJhdGlvbiBkYXRhIOKAlCBQZXJzaXN0ZW50IHN0b3JhZ2UAAAAAAAAAC0NvbnRlbnRJbmZvAAAAAAUAAAAAAAAADGNvbnRlbnRfaGFzaAAAA+4AAAAgAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAADXJlZ2lzdGVyZWRfYXQAAAAAAAAGAAAAAAAAAAZzZWxsZXIAAAAAABM=",
        "AAAAAQAAACdFc2Nyb3cgYWdyZWVtZW50IOKAlCBQZXJzaXN0ZW50IHN0b3JhZ2UAAAAAAAAAAA9Fc2Nyb3dBZ3JlZW1lbnQAAAAACAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAADGNvbnRlbnRfaGFzaAAAA+4AAAAgAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAxkZWxpdmVyZWRfYXQAAAPoAAAABgAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAVzdGF0ZQAAAAAAB9AAAAALRXNjcm93U3RhdGUAAAAAAAAAAAp0aW1lb3V0X2F0AAAAAAAG",
        "AAAAAQAAAChDb250cmFjdCBzdGF0aXN0aWNzIOKAlCBJbnN0YW5jZSBzdG9yYWdlAAAAAAAAAA1Db250cmFjdFN0YXRzAAAAAAAABAAAAAAAAAAPdG90YWxfY29tcGxldGVkAAAAAAYAAAAAAAAADnRvdGFsX2NvbnRlbnRzAAAAAAAGAAAAAAAAAA10b3RhbF9lc2Nyb3dzAAAAAAAABgAAAAAAAAAMdG90YWxfdm9sdW1lAAAACw==",
        "AAAABAAAABxSaXNlIEluIENvbnRyYWN0IEVycm9yIENvZGVzAAAAAAAAAAVFcnJvcgAAAAAAAAsAAAApQ29udGVudCBhbHJlYWR5IHJlZ2lzdGVyZWQgd2l0aCB0aGlzIGhhc2gAAAAAAAARQWxyZWFkeVJlZ2lzdGVyZWQAAAAAAAABAAAAHUNvbnRlbnQgbm90IGZvdW5kIGluIHJlZ2lzdHJ5AAAAAAAAD0NvbnRlbnROb3RGb3VuZAAAAAACAAAAGkVzY3JvdyBhZ3JlZW1lbnQgbm90IGZvdW5kAAAAAAAORXNjcm93Tm90Rm91bmQAAAAAAAMAAAArQ2FsbGVyIGlzIG5vdCBhdXRob3JpemVkIGZvciB0aGlzIG9wZXJhdGlvbgAAAAAMVW5hdXRob3JpemVkAAAABAAAADBFc2Nyb3cgYWxyZWFkeSBleGlzdHMgZm9yIHRoaXMgY29udGVudCBhbmQgYnV5ZXIAAAATRXNjcm93QWxyZWFkeUV4aXN0cwAAAAAFAAAAI0VzY3JvdyBpcyBub3QgaW4gdGhlIGV4cGVjdGVkIHN0YXRlAAAAABJJbnZhbGlkRXNjcm93U3RhdGUAAAAAAAYAAAAuUGF5bWVudCBhbW91bnQgZG9lc24ndCBtYXRjaCB0aGUgY29udGVudCBwcmljZQAAAAAAFEludmFsaWRQYXltZW50QW1vdW50AAAABwAAACJUaW1lb3V0IHBlcmlvZCBoYXMgbm90IGVsYXBzZWQgeWV0AAAAAAARVGltZW91dE5vdFJlYWNoZWQAAAAAAAAIAAAAGEhhc2ggdmVyaWZpY2F0aW9uIGZhaWxlZAAAAAxIYXNoTWlzbWF0Y2gAAAAJAAAAJkludmFsaWQgcHJpY2UgKG11c3QgYmUgZ3JlYXRlciB0aGFuIDApAAAAAAAMSW52YWxpZFByaWNlAAAACgAAADBDb250ZW50IGhhcyBhY3RpdmUgZXNjcm93cyBhbmQgY2Fubm90IGJlIGRlbGV0ZWQAAAAXQ29udGVudEhhc0FjdGl2ZUVzY3Jvd3MAAAAACw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    register_content: this.txFromJSON<Result<void>>,
        get_content: this.txFromJSON<Result<ContentInfo>>,
        delete_content: this.txFromJSON<Result<void>>,
        create_escrow: this.txFromJSON<Result<void>>,
        mark_delivered: this.txFromJSON<Result<void>>,
        release_payment: this.txFromJSON<Result<void>>,
        refund_timeout: this.txFromJSON<Result<void>>,
        get_escrow: this.txFromJSON<Result<EscrowAgreement>>,
        get_stats: this.txFromJSON<ContractStats>
  }
}
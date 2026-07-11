import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBBVCK6MLR7HPWWIJOC6IUBPHE337BOEVT2P7PSE2TEVRJHGOWESOPWU";
    };
};
export type StorageKey = {
    tag: "Content";
    values: readonly [Buffer];
} | {
    tag: "Escrow";
    values: readonly [Buffer, string];
} | {
    tag: "Stats";
    values: void;
};
/**
 * Escrow state machine
 */
export type EscrowState = {
    tag: "Locked";
    values: void;
} | {
    tag: "Delivered";
    values: void;
} | {
    tag: "Completed";
    values: void;
} | {
    tag: "Refunded";
    values: void;
};
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
export declare const Errors: {
    /**
     * Content already registered with this hash
     */
    1: {
        message: string;
    };
    /**
     * Content not found in registry
     */
    2: {
        message: string;
    };
    /**
     * Escrow agreement not found
     */
    3: {
        message: string;
    };
    /**
     * Caller is not authorized for this operation
     */
    4: {
        message: string;
    };
    /**
     * Escrow already exists for this content and buyer
     */
    5: {
        message: string;
    };
    /**
     * Escrow is not in the expected state
     */
    6: {
        message: string;
    };
    /**
     * Payment amount doesn't match the content price
     */
    7: {
        message: string;
    };
    /**
     * Timeout period has not elapsed yet
     */
    8: {
        message: string;
    };
    /**
     * Hash verification failed
     */
    9: {
        message: string;
    };
    /**
     * Invalid price (must be greater than 0)
     */
    10: {
        message: string;
    };
    /**
     * Content has active escrows and cannot be deleted
     */
    11: {
        message: string;
    };
};
export interface Client {
    /**
     * Construct and simulate a register_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    register_content: ({ seller, content_hash, price, description }: {
        seller: string;
        content_hash: Buffer;
        price: i128;
        description: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_content: ({ content_hash }: {
        content_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<ContentInfo>>>;
    /**
     * Construct and simulate a delete_content transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    delete_content: ({ seller, content_hash }: {
        seller: string;
        content_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_escrow: ({ buyer, content_hash, token, amount }: {
        buyer: string;
        content_hash: Buffer;
        token: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a mark_delivered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    mark_delivered: ({ seller, content_hash, buyer }: {
        seller: string;
        content_hash: Buffer;
        buyer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a release_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    release_payment: ({ buyer, content_hash, token }: {
        buyer: string;
        content_hash: Buffer;
        token: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a refund_timeout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    refund_timeout: ({ buyer, content_hash, token }: {
        buyer: string;
        content_hash: Buffer;
        token: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_escrow: ({ content_hash, buyer }: {
        content_hash: Buffer;
        buyer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<EscrowAgreement>>>;
    /**
     * Construct and simulate a get_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_stats: (options?: MethodOptions) => Promise<AssembledTransaction<ContractStats>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        register_content: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_content: (json: string) => AssembledTransaction<Result<ContentInfo, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        delete_content: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_escrow: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        mark_delivered: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        release_payment: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        refund_timeout: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_escrow: (json: string) => AssembledTransaction<Result<EscrowAgreement, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_stats: (json: string) => AssembledTransaction<ContractStats>;
    };
}

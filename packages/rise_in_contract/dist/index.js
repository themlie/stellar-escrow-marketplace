import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
/**
 * Rise In Contract Error Codes
 */
export const Errors = {
    /**
     * Content already registered with this hash
     */
    1: { message: "AlreadyRegistered" },
    /**
     * Content not found in registry
     */
    2: { message: "ContentNotFound" },
    /**
     * Escrow agreement not found
     */
    3: { message: "EscrowNotFound" },
    /**
     * Caller is not authorized for this operation
     */
    4: { message: "Unauthorized" },
    /**
     * Escrow already exists for this content and buyer
     */
    5: { message: "EscrowAlreadyExists" },
    /**
     * Escrow is not in the expected state
     */
    6: { message: "InvalidEscrowState" },
    /**
     * Payment amount doesn't match the content price
     */
    7: { message: "InvalidPaymentAmount" },
    /**
     * Timeout period has not elapsed yet
     */
    8: { message: "TimeoutNotReached" },
    /**
     * Hash verification failed
     */
    9: { message: "HashMismatch" },
    /**
     * Invalid price (must be greater than 0)
     */
    10: { message: "InvalidPrice" },
    /**
     * Content has active escrows and cannot be deleted
     */
    11: { message: "ContentHasActiveEscrows" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAQcmVnaXN0ZXJfY29udGVudAAAAAQAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAMY29udGVudF9oYXNoAAAD7gAAACAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAEAAAPpAAAD7QAAAAAAAAAD",
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
            "AAAABAAAABxSaXNlIEluIENvbnRyYWN0IEVycm9yIENvZGVzAAAAAAAAAAVFcnJvcgAAAAAAAAsAAAApQ29udGVudCBhbHJlYWR5IHJlZ2lzdGVyZWQgd2l0aCB0aGlzIGhhc2gAAAAAAAARQWxyZWFkeVJlZ2lzdGVyZWQAAAAAAAABAAAAHUNvbnRlbnQgbm90IGZvdW5kIGluIHJlZ2lzdHJ5AAAAAAAAD0NvbnRlbnROb3RGb3VuZAAAAAACAAAAGkVzY3JvdyBhZ3JlZW1lbnQgbm90IGZvdW5kAAAAAAAORXNjcm93Tm90Rm91bmQAAAAAAAMAAAArQ2FsbGVyIGlzIG5vdCBhdXRob3JpemVkIGZvciB0aGlzIG9wZXJhdGlvbgAAAAAMVW5hdXRob3JpemVkAAAABAAAADBFc2Nyb3cgYWxyZWFkeSBleGlzdHMgZm9yIHRoaXMgY29udGVudCBhbmQgYnV5ZXIAAAATRXNjcm93QWxyZWFkeUV4aXN0cwAAAAAFAAAAI0VzY3JvdyBpcyBub3QgaW4gdGhlIGV4cGVjdGVkIHN0YXRlAAAAABJJbnZhbGlkRXNjcm93U3RhdGUAAAAAAAYAAAAuUGF5bWVudCBhbW91bnQgZG9lc24ndCBtYXRjaCB0aGUgY29udGVudCBwcmljZQAAAAAAFEludmFsaWRQYXltZW50QW1vdW50AAAABwAAACJUaW1lb3V0IHBlcmlvZCBoYXMgbm90IGVsYXBzZWQgeWV0AAAAAAARVGltZW91dE5vdFJlYWNoZWQAAAAAAAAIAAAAGEhhc2ggdmVyaWZpY2F0aW9uIGZhaWxlZAAAAAxIYXNoTWlzbWF0Y2gAAAAJAAAAJkludmFsaWQgcHJpY2UgKG11c3QgYmUgZ3JlYXRlciB0aGFuIDApAAAAAAAMSW52YWxpZFByaWNlAAAACgAAADBDb250ZW50IGhhcyBhY3RpdmUgZXNjcm93cyBhbmQgY2Fubm90IGJlIGRlbGV0ZWQAAAAXQ29udGVudEhhc0FjdGl2ZUVzY3Jvd3MAAAAACw=="]), options);
        this.options = options;
    }
    fromJSON = {
        register_content: (this.txFromJSON),
        get_content: (this.txFromJSON),
        delete_content: (this.txFromJSON),
        create_escrow: (this.txFromJSON),
        mark_delivered: (this.txFromJSON),
        release_payment: (this.txFromJSON),
        refund_timeout: (this.txFromJSON),
        get_escrow: (this.txFromJSON),
        get_stats: (this.txFromJSON)
    };
}

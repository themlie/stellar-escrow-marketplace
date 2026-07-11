import { useCallback, useState } from "react";
import { classifyError, classifyContractResultError, type AppError } from "../lib/errors";

export type TxStage = "idle" | "building" | "signing" | "pending" | "success" | "error";

interface ResultLike<T> {
  isErr(): boolean;
  isOk(): boolean;
  unwrapErr(): { message: string };
  unwrap(): T;
}

interface SentTransactionLike<T> {
  result: ResultLike<T> | T;
  sendTransactionResponse?: { hash?: string };
}

interface AssembledLike<T> {
  signAndSend(): Promise<SentTransactionLike<T>>;
}

function isResultLike<T>(value: unknown): value is ResultLike<T> {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as ResultLike<T>).isErr === "function" &&
    typeof (value as ResultLike<T>).unwrap === "function"
  );
}

/** Drives a single contract write call through build -> sign -> send -> confirm, tracking status for the UI. */
export function useTxRunner<T = void>() {
  const [stage, setStage] = useState<TxStage>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [value, setValue] = useState<T | undefined>(undefined);

  const run = useCallback(async (build: () => Promise<AssembledLike<T>>): Promise<T | undefined> => {
    setStage("building");
    setError(null);
    setTxHash(null);
    setValue(undefined);
    try {
      const assembled = await build();
      setStage("signing");
      const sent = await assembled.signAndSend();
      setStage("pending");

      if (isResultLike<T>(sent.result)) {
        if (sent.result.isErr()) {
          setError(classifyContractResultError(sent.result.unwrapErr().message));
          setStage("error");
          return undefined;
        }
        const hash = sent.sendTransactionResponse?.hash ?? null;
        const unwrapped = sent.result.unwrap();
        setTxHash(hash);
        setValue(unwrapped);
        setStage("success");
        return unwrapped;
      }

      const hash = sent.sendTransactionResponse?.hash ?? null;
      setTxHash(hash);
      setValue(sent.result);
      setStage("success");
      return sent.result;
    } catch (e) {
      setError(classifyError(e));
      setStage("error");
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setTxHash(null);
    setError(null);
    setValue(undefined);
  }, []);

  return { stage, txHash, error, value, run, reset };
}

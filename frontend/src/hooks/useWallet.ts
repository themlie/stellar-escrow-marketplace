import { useCallback, useState } from "react";
import { connectWallet, disconnectWallet } from "../lib/wallet";
import { classifyError, type AppError } from "../lib/errors";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const pk = await connectWallet();
      setAddress(pk);
      return pk;
    } catch (e) {
      setError(classifyError(e));
      return undefined;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress(null);
  }, []);

  return { address, connecting, error, connect, disconnect };
}

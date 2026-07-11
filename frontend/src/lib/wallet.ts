import { StellarWalletsKit, Networks as KitNetworks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { HanaModule } from "@creit.tech/stellar-wallets-kit/modules/hana";

StellarWalletsKit.init({
  network: KitNetworks.TESTNET,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new LobstrModule(),
    new RabetModule(),
    new HanaModule(),
  ],
});

export { StellarWalletsKit };

/** Opens the multi-wallet selection modal and returns the connected public key. */
export async function connectWallet(): Promise<string> {
  const { address } = await StellarWalletsKit.authModal();
  return address;
}

export async function disconnectWallet(): Promise<void> {
  await StellarWalletsKit.disconnect();
}

/** SEP-43 compatible signing function, passed straight into the contract Client. */
export const signTransaction: (
  xdr: string,
  opts?: { networkPassphrase?: string; address?: string }
) => Promise<{ signedTxXdr: string; signerAddress?: string }> = (xdr, opts) =>
  StellarWalletsKit.signTransaction(xdr, opts);

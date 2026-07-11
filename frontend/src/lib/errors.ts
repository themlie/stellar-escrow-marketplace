import { contract as sdkContract, Errors as ContractErrors } from "rise-in-contract-client";

export type AppErrorKind =
  | "wallet_not_found"
  | "user_rejected"
  | "insufficient_balance"
  | "contract_error"
  | "simulation_failed"
  | "unknown";

export interface AppError {
  kind: AppErrorKind;
  message: string;
}

const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  AlreadyRegistered: "Bu içerik hash'i zaten kayıtlı.",
  ContentNotFound: "İçerik bulunamadı. Hash'i kontrol edin.",
  EscrowNotFound: "Escrow kaydı bulunamadı.",
  Unauthorized: "Bu işlem için yetkiniz yok.",
  EscrowAlreadyExists: "Bu alıcı için zaten bir escrow var.",
  InvalidEscrowState: "Escrow bu işlem için uygun durumda değil.",
  InvalidPaymentAmount: "Ödeme tutarı içerik fiyatıyla uyuşmuyor.",
  TimeoutNotReached: "24 saatlik zaman aşımı henüz dolmadı.",
  HashMismatch: "Hash eşleşmedi, içerik doğrulanamadı.",
  InvalidPrice: "Fiyat 0'dan büyük olmalı.",
  ContentHasActiveEscrows: "İçeriğin aktif escrow'ları var, silinemez.",
};

function messageFromContractErrorCode(message: string): string | undefined {
  for (const info of Object.values(ContractErrors)) {
    if (info.message === message) {
      return CONTRACT_ERROR_MESSAGES[info.message] ?? info.message;
    }
  }
  return undefined;
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export function classifyError(err: unknown): AppError {
  if (err instanceof sdkContract.AssembledTransaction.Errors.UserRejected) {
    return { kind: "user_rejected", message: "İşlem cüzdan tarafından reddedildi." };
  }

  if (err instanceof sdkContract.AssembledTransaction.Errors.SimulationFailed) {
    const msg = err.message || "";
    if (/insufficient|underflow|underfunded|balance/i.test(msg)) {
      return {
        kind: "insufficient_balance",
        message: "Bakiye yetersiz. Testnet XLM için Friendbot'tan fonlayın.",
      };
    }
    return { kind: "simulation_failed", message: `İşlem simülasyonu başarısız oldu: ${msg}` };
  }

  const raw = extractMessage(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes("closed the modal") ||
    lower.includes("no wallet") ||
    lower.includes("not installed") ||
    lower.includes("not available") ||
    lower.includes("wallet not found")
  ) {
    return {
      kind: "wallet_not_found",
      message: "Cüzdan bulunamadı ya da seçilmedi. Lütfen bir Stellar cüzdanı kurup tekrar deneyin.",
    };
  }

  if (lower.includes("reject") || lower.includes("declin") || lower.includes("cancel")) {
    return { kind: "user_rejected", message: "İşlem kullanıcı tarafından reddedildi." };
  }

  if (lower.includes("insufficient") || lower.includes("underfunded") || lower.includes("underflow")) {
    return {
      kind: "insufficient_balance",
      message: "Bakiye yetersiz. Testnet XLM için Friendbot'tan fonlayın.",
    };
  }

  for (const errName of Object.keys(CONTRACT_ERROR_MESSAGES)) {
    if (raw.includes(errName)) {
      return { kind: "contract_error", message: messageFromContractErrorCode(errName) ?? raw };
    }
  }

  return { kind: "unknown", message: raw };
}

export function classifyContractResultError(message: string): AppError {
  return { kind: "contract_error", message: CONTRACT_ERROR_MESSAGES[message] ?? message };
}

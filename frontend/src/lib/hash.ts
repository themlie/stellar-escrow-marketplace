import { Buffer } from "buffer";

export async function sha256OfText(text: string): Promise<Buffer> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(new Uint8Array(digest));
}

export async function sha256OfFile(file: File): Promise<Buffer> {
  const data = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(new Uint8Array(digest));
}

export function bufferToHex(buf: Buffer): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBuffer(hex: string): Buffer {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(clean)) {
    throw new Error("Content hash must be a 64-character hex SHA-256 string.");
  }
  return Buffer.from(clean, "hex");
}

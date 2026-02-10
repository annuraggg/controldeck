const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compute a SHA-256 hash for the provided string and return a hex-encoded result.
 */
export async function sha256Hex(input: string) {
  const data = encoder.encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/**
 * Generate cryptographically secure random bytes and return them as a hex string.
 */
export function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return toHex(bytes);
}

import crypto from 'crypto';

/**
 * URL-encode a value matching PHP's urlencode() behaviour:
 * spaces become '+', other characters are percent-encoded.
 */
function pfEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Build the ordered parameter string PayFast uses for signature verification.
 * Order must match the order fields appear in the HTML form.
 */
function buildParamString(
  params: Array<[string, string]>,
  passPhrase: string
): string {
  const parts = params
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${pfEncode(v)}`);

  if (passPhrase) {
    parts.push(`passphrase=${pfEncode(passPhrase)}`);
  }

  return parts.join('&');
}

/** Generate an MD5 signature for a PayFast payment form. */
export function generatePayFastSignature(
  params: Array<[string, string]>,
  passPhrase: string
): string {
  const str = buildParamString(params, passPhrase);
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Verify a PayFast ITN (Instant Transaction Notification) signature.
 * `params` should contain all POST fields including 'signature'.
 */
export function verifyPayFastSignature(
  params: Record<string, string>,
  passPhrase: string
): boolean {
  const { signature, ...rest } = params;
  // PayFast sends fields in a consistent order; reconstruct as ordered pairs
  const ordered = Object.entries(rest) as Array<[string, string]>;
  const expected = generatePayFastSignature(ordered, passPhrase);
  return expected === signature;
}

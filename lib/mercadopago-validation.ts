import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Validates an incoming webhook request from MercadoPago.
 * @param req The NextRequest object.
 * @param body The raw request body as a string.
 * @returns True if the signature is valid, false otherwise.
 */
export function isValidMercadoPagoRequest(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = req.headers.get('x-signature');

  if (!secret || !signature) {
    console.error('Webhook secret or signature is missing.');
    return false;
  }

  // The signature header is a comma-separated list of key-value pairs.
  // Example: ts=1612345678,v1=...
  const parts = signature.split(',');
  const signatureData: { [key: string]: string } = {};
  parts.forEach((part: string) => {
    const [key, value] = part.split('=');
    signatureData[key] = value;
  });

  const timestamp = signatureData['ts'];
  const receivedHash = signatureData['v1'];

  if (!timestamp || !receivedHash) {
    console.error('Timestamp or hash is missing from the signature header.');
    return false;
  }

  // Prevent replay attacks by checking if the timestamp is too old
  const fiveMinutesInMillis = 5 * 60 * 1000;
  const requestTimestamp = parseInt(timestamp, 10) * 1000; // MP sends it in seconds
  const now = Date.now();

  if (now - requestTimestamp > fiveMinutesInMillis) {
    console.error('Webhook timestamp is too old. Possible replay attack.');
    return false;
  }

  // Create the signed payload string
  const signedPayload = `ts:${timestamp}.${body}`;

  // Create the HMAC
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signedPayload);
  const calculatedHash = hmac.digest('hex');

  // Compare the calculated hash with the one from the header
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, 'hex'),
    Buffer.from(receivedHash, 'hex')
  );
}

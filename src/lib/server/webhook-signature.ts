import { createHmac, timingSafeEqual } from 'crypto';

const toBuffer = (value: string): Buffer => Buffer.from(value, 'utf8');

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = toBuffer(left);
  const rightBuffer = toBuffer(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

const parseMetaSignature = (header: string): string | null => {
  const trimmed = header.trim();
  if (!trimmed.startsWith('sha256=')) return null;
  return trimmed.slice('sha256='.length);
};

export const verifyWebhookSignature = (input: {
  body: string;
  signatureHeader: string | null;
  secret: string;
  mode: 'meta_sha256' | 'hex_sha256' | 'base64_sha256';
}): boolean => {
  const { body, signatureHeader, secret, mode } = input;
  if (!signatureHeader || !secret) return false;
  const digest = createHmac('sha256', secret).update(body, 'utf8');

  if (mode === 'meta_sha256') {
    const provided = parseMetaSignature(signatureHeader);
    if (!provided) return false;
    return safeEqual(provided, digest.digest('hex'));
  }

  if (mode === 'hex_sha256') {
    return safeEqual(signatureHeader.trim(), digest.digest('hex'));
  }

  return safeEqual(signatureHeader.trim(), digest.digest('base64'));
};

// Generate a time-based secure token for QR code
// Token changes every 60 seconds to prevent screenshot/copy attacks

const SECRET_KEY = 'ysu-secure-2025'; // In production, use environment variable

export const generateSecureToken = (memberId: string): string => {
  const timestamp = Math.floor(Date.now() / 60000); // Changes every minute
  const data = `${memberId}|${timestamp}|${SECRET_KEY}`;

  // Simple hash function (in production, use proper crypto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const token = btoa(`${memberId}|${timestamp}|${Math.abs(hash).toString(36)}`);
  return token;
};

export const verifySecureToken = (token: string): {
  isValid: boolean;
  memberId: string | null;
  error?: string;
} => {
  try {
    const decoded = atob(token);
    const [memberId, timestampStr, hash] = decoded.split('|');
    const tokenTimestamp = parseInt(timestampStr);
    const currentTimestamp = Math.floor(Date.now() / 60000);

    // Token is valid for 2 minutes (current minute + 1 minute grace period)
    if (currentTimestamp - tokenTimestamp > 2) {
      return { isValid: false, memberId: null, error: 'رمز QR منتهي الصلاحية' };
    }

    // Verify hash
    const data = `${memberId}|${tokenTimestamp}|${SECRET_KEY}`;
    let expectedHash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      expectedHash = ((expectedHash << 5) - expectedHash) + char;
      expectedHash = expectedHash & expectedHash;
    }

    if (hash !== Math.abs(expectedHash).toString(36)) {
      return { isValid: false, memberId: null, error: 'رمز QR غير صالح' };
    }

    return { isValid: true, memberId };
  } catch {
    return { isValid: false, memberId: null, error: 'رمز QR تالف' };
  }
};

export const getTokenExpirySeconds = (): number => {
  const now = Date.now();
  const currentMinute = Math.floor(now / 60000);
  const nextMinute = (currentMinute + 1) * 60000;
  return Math.ceil((nextMinute - now) / 1000);
};

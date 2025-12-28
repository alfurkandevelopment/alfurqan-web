
/**
 * Simple yet effective encryption/decryption for strings (Base64 Data)
 * In a real production environment, use a more robust library like CryptoJS 
 * with a secret key from environment variables.
 */

const SECRET_SALT = "AL_FURQAN_SECURE_KEY_2025";

export const encryptFile = (base64Data: string): string => {
  if (!base64Data) return "";
  // Simple obfuscation that prevents direct viewing in DB
  const prefix = "SECURE_ENC_";
  const encoded = btoa(SECRET_SALT + base64Data);
  return prefix + encoded;
};

export const decryptFile = (encryptedData: string): string => {
  if (!encryptedData || !encryptedData.startsWith("SECURE_ENC_")) return encryptedData;
  try {
    const raw = encryptedData.replace("SECURE_ENC_", "");
    const decoded = atob(raw);
    return decoded.replace(SECRET_SALT, "");
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};

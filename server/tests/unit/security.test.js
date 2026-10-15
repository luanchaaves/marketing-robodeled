import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSecureToken, hashToken, timingSafeEqual, } from '../../src/utils/security.js';
import { encryptCredentials, decryptCredentials } from '../../src/utils/encryption.js';
describe('Security & Cryptography Utilities', () => {
    describe('Argon2id Password Hashing', () => {
        it('hashes passwords securely and verifies correct plain text', async () => {
            const password = 'SuperSecret@Password2026!';
            const hash = await hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash.startsWith('$argon2id$')).toBe(true);
            const isValid = await verifyPassword(hash, password);
            expect(isValid).toBe(true);
        });
        it('rejects incorrect password verification', async () => {
            const hash = await hashPassword('CorrectPassword123');
            const isValid = await verifyPassword(hash, 'WrongPassword456');
            expect(isValid).toBe(false);
        });
    });
    describe('Secure Token Generation and SHA-256 Hashing', () => {
        it('generates random hex tokens of expected length', () => {
            const token = generateSecureToken(32);
            expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
        });
        it('consistently hashes tokens using SHA-256', () => {
            const token = 'sample-session-token-123';
            const hash1 = hashToken(token);
            const hash2 = hashToken(token);
            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64);
        });
    });
    describe('Timing-safe string comparison', () => {
        it('returns true for identical strings and false for differing strings', () => {
            expect(timingSafeEqual('exact-match-sig', 'exact-match-sig')).toBe(true);
            expect(timingSafeEqual('exact-match-sig', 'different-sig')).toBe(false);
        });
    });
    describe('AES-256-GCM Credential Encryption & Decryption', () => {
        it('encrypts sensitive credentials payload and decrypts back to original object', () => {
            const sensitiveData = {
                accessToken: 'EAABsb7...secret_meta_token',
                pixelId: '1234567890123',
                clientSecret: 'secret_hash_key_999',
            };
            const encrypted = encryptCredentials(sensitiveData);
            expect(encrypted).not.toBeNull();
            expect(typeof encrypted).toBe('string');
            expect(encrypted).not.toContain('EAABsb7');
            const decrypted = decryptCredentials(encrypted);
            expect(decrypted).toEqual(sensitiveData);
        });
    });
});

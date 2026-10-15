import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { timingSafeEqual } from '../../src/utils/security.js';
describe('Webhook Signature Verification', () => {
    it('correctly creates and verifies Meta Lead Ads HMAC-SHA256 signature', () => {
        const appSecret = 'my_meta_app_secret_123';
        const rawPayload = Buffer.from(JSON.stringify({ entry: [{ id: '12345' }] }));
        const signature = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
        const header = `sha256=${signature}`;
        const expectedSig = header.replace('sha256=', '');
        const computedSig = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
        expect(timingSafeEqual(expectedSig, computedSig)).toBe(true);
    });
    it('rejects forged webhook signatures', () => {
        const appSecret = 'my_meta_app_secret_123';
        const rawPayload = Buffer.from(JSON.stringify({ entry: [{ id: '12345' }] }));
        const fakeSig = crypto.createHmac('sha256', 'wrong_secret').update(rawPayload).digest('hex');
        const computedSig = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
        expect(timingSafeEqual(fakeSig, computedSig)).toBe(false);
    });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
describe('Integration Tests: App Health & API Endpoints', () => {
    const app = createApp();
    describe('GET /health', () => {
        it('returns server health status with memory and version', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.version).toBe('1.0.0');
            expect(res.body.memory).toBeDefined();
        });
    });
    describe('Authentication Security Checks', () => {
        it('rejects protected routes when unauthenticated', async () => {
            const res = await request(app).get('/api/v1/leads');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('rejects invalid login payloads', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'not-an-email', password: '123' });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('Webhook Endpoints Security', () => {
        it('rejects Meta Lead Ads webhook when signature is invalid', async () => {
            const res = await request(app)
                .post('/api/v1/webhooks/meta-leads')
                .set('x-hub-signature-256', 'sha256=invalid_signature_hex_1234567890abcdef')
                .send({ entry: [] });
            // Should return 401 Unauthorized for invalid signature
            expect(res.status).toBe(401);
        });
        it('handles Meta verification challenge (hub.challenge)', async () => {
            const res = await request(app)
                .get('/api/v1/webhooks/meta-leads')
                .query({
                'hub.mode': 'subscribe',
                'hub.verify_token': 'roboled_meta_webhook_verify_token_2026',
                'hub.challenge': 'CHALLENGE_ACCEPTED_123',
            });
            expect(res.status).toBe(200);
            expect(res.text).toBe('CHALLENGE_ACCEPTED_123');
        });
    });
});

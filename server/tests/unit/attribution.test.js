import { describe, it, expect } from 'vitest';
import { attributionService } from '../../src/modules/attribution/attribution.service.js';
describe('Attribution Service & UTM Detection', () => {
    it('detects META_ADS from paid medium and facebook/instagram source', () => {
        const channel = attributionService.detectSourceChannel({
            utm_source: 'facebook',
            utm_medium: 'cpc',
            utm_campaign: 'casamentos_robo_led',
        });
        expect(channel).toBe('META_ADS');
    });
    it('detects INSTAGRAM_ORGANIC from organic instagram referrer', () => {
        const channel = attributionService.detectSourceChannel(undefined, 'https://l.instagram.com/');
        expect(channel).toBe('INSTAGRAM_ORGANIC');
    });
    it('detects WHATSAPP_DIRECT from whatsapp medium or source', () => {
        const channel = attributionService.detectSourceChannel({
            utm_source: 'whatsapp',
            utm_medium: 'direct',
        });
        expect(channel).toBe('WHATSAPP_DIRECT');
    });
    it('detects GOOGLE_ADS when google cpc is present', () => {
        const channel = attributionService.detectSourceChannel({
            utm_source: 'google',
            utm_medium: 'cpc',
        });
        expect(channel).toBe('GOOGLE_ADS');
    });
    it('defaults to MANUAL when no UTM or referrer is provided', () => {
        const channel = attributionService.detectSourceChannel();
        expect(channel).toBe('MANUAL');
    });
});

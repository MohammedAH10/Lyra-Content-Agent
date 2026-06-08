import { describe, expect, it } from 'vitest';

import { moderateFile } from '../src/services/moderation.service';

describe('File Moderation Service', () => {
  describe('Auto-approved (score < 50)', () => {
    it('approves a clean file with no suspicious keywords', () => {
      const result = moderateFile('team-photo-2024.jpg', ['team', 'photo', 'office']);

      expect(result.action).toBe('approved');
      expect(result.score).toBe(0);
      expect(result.categoryScores).toHaveLength(0);
      expect(result.reason).toContain('Auto-approved');
    });

    it('approves a file with generic business content', () => {
      const result = moderateFile('q4-finance-report.pdf', ['finance', 'quarterly', 'report']);

      expect(result.action).toBe('approved');
      expect(result.score).toBe(0);
    });

    it('approves a file with very mild single keyword match below threshold', () => {
      const result = moderateFile('summer-event-photo.jpg', ['summer', 'event', 'party']);

      expect(result.action).toBe('approved');
      expect(result.score).toBe(0);
    });

    it('approves a file with one low-severity keyword match', () => {
      const result = moderateFile('aggressive-marketing-campaign.jpg', ['marketing', 'aggressive']);

      expect(result.action).toBe('approved');
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('Pending review (score 50-74)', () => {
    it('flags a file with multiple keyword matches across categories', () => {
      const result = moderateFile('violent-content-review.mp4', ['violence', 'review', 'blood']);

      expect(result.action).toBe('pending_review');
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(75);
      expect(result.categoryScores.length).toBeGreaterThanOrEqual(1);
      expect(result.reason).toContain('Flagged for admin review');
    });

    it('flags a file with hate speech keywords', () => {
      const result = moderateFile('hate-speech-recording.mp3', ['hate', 'discrimination']);

      expect(result.action).toBe('pending_review');
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(75);
    });
  });

  describe('Auto-rejected (score >= 75)', () => {
    it('rejects a file with explicit sexual content keywords', () => {
      const result = moderateFile('explicit-sexual-content.mp4', ['explicit', 'sexual', 'porn', 'xxx']);

      expect(result.action).toBe('rejected');
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.reason).toContain('Auto-rejected');
      expect(result.reason).toContain('sexual');
    });

    it('rejects a file with multiple severe categories', () => {
      const result = moderateFile(
        'violent-sexual-content.mp4',
        ['violence', 'gore', 'blood', 'sexual', 'explicit', 'nude'],
      );

      expect(result.action).toBe('rejected');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('rejects a file with nudity and offensive keywords combined', () => {
      const result = moderateFile('nude-offensive-content.jpg', ['nude', 'naked', 'offensive', 'harassment', 'toxic']);

      expect(result.action).toBe('rejected');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('rejects a file with all five categories triggered', () => {
      const result = moderateFile(
        'complete-flagged-content.mp4',
        ['sexual', 'nude', 'violence', 'hate', 'offensive'],
      );

      expect(result.action).toBe('rejected');
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.categoryScores).toHaveLength(5);
    });
  });

  describe('Description and tags contribute to scoring', () => {
    it('detects keywords in the description field', () => {
      const result = moderateFile(
        'user-upload.mp4',
        ['user-content'],
        'Contains explicit sexual violence',
      );

      expect(result.action).toBe('rejected');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('detects keywords in tags only', () => {
      const result = moderateFile(
        'innocent-name.jpg',
        ['photo', 'nude', 'erotic'],
      );

      expect(result.action).toBe('pending_review');
      expect(result.score).toBe(60);
      expect(result.categoryScores).toHaveLength(2);
    });
  });

  describe('Edge cases', () => {
    it('handles empty tags array gracefully', () => {
      const result = moderateFile('normal-photo.jpg', []);

      expect(result.action).toBe('approved');
      expect(result.score).toBe(0);
    });

    it('handles description as undefined', () => {
      const result = moderateFile('normal-photo.jpg', ['photo'], undefined);

      expect(result.action).toBe('approved');
      expect(result.score).toBe(0);
    });

    it('handles underscores and hyphens in filenames', () => {
      const result = moderateFile('nude_photo_erotic_content.jpg', []);

      expect(result.action).toBe('pending_review');
      expect(result.score).toBe(60);
      expect(result.categoryScores).toHaveLength(2);
    });

    it('provides detailed reason with category breakdown on rejection', () => {
      const result = moderateFile('sexual-violent-content.mp4', ['sexual', 'violent', 'gore']);

      expect(result.reason).toContain('sexual');
      expect(result.reason).toContain('violence');
      expect(result.reason).toContain('pts');
    });
  });
});

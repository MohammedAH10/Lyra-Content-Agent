import logger from '../utils/logger';
import {
  BLOCKED_CATEGORIES,
  BlockedCategory,
  REJECT_THRESHOLD,
  FLAG_THRESHOLD,
  MAX_SCORE,
} from './safety/moderationPolicy';

export type ModerationAction = 'approved' | 'pending_review' | 'rejected';

export interface ModerationResult {
  action: ModerationAction;
  score: number;
  categoryScores: { category: BlockedCategory; keywordMatches: string[]; points: number }[];
  reason: string;
}

const FIRST_KW_POINTS = 30;
const ADDITIONAL_KW_POINTS = 20;
const MAX_POINTS_PER_CATEGORY = 90;

const extractSearchableText = (
  name: string,
  tags: string[],
  description?: string,
): string => {
  const nameNoExt = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return [nameNoExt, ...tags, description || '']
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const keywordMatchesInText = (keyword: string, text: string): boolean => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = keyword.includes('_')
    ? `\\b${escaped.replace(/_/g, '[-_]?')}\\b`
    : `\\b${escaped}\\b`;
  return new RegExp(pattern, 'i').test(text);
};

export const moderateFile = (
  name: string,
  tags: string[],
  description?: string,
): ModerationResult => {
  const text = extractSearchableText(name, tags, description);

  const categoryScores: { category: BlockedCategory; keywordMatches: string[]; points: number }[] = [];

  for (const [category, keywords] of Object.entries(BLOCKED_CATEGORIES)) {
    const foundInText = keywords.filter((kw) => keywordMatchesInText(kw, text));

    if (foundInText.length > 0) {
      const points = Math.min(
        FIRST_KW_POINTS + (foundInText.length - 1) * ADDITIONAL_KW_POINTS,
        MAX_POINTS_PER_CATEGORY,
      );
      categoryScores.push({
        category: category as BlockedCategory,
        keywordMatches: foundInText,
        points,
      });
    }
  }

  const totalScore = Math.min(
    categoryScores.reduce((sum, cs) => sum + cs.points, 0),
    MAX_SCORE,
  );

  let action: ModerationAction;
  let reason: string;

  if (totalScore >= REJECT_THRESHOLD) {
    action = 'rejected';
    reason = `Auto-rejected — safety score ${totalScore}/100. Flagged categories: ${categoryScores.map((c) => `${c.category} (${c.points}pts)`).join(', ')}.`;
  } else if (totalScore >= FLAG_THRESHOLD) {
    action = 'pending_review';
    reason = `Flagged for admin review — safety score ${totalScore}/100. Categories: ${categoryScores.map((c) => `${c.category} (${c.points}pts)`).join(', ')}.`;
  } else {
    action = 'approved';
    reason = `Auto-approved — safety score ${totalScore}/100. No significant issues detected.`;
  }

  logger.info('File moderation completed', {
    fileName: name,
    score: totalScore,
    action,
    categoryBreakdown: categoryScores,
  });

  return { action, score: totalScore, categoryScores, reason };
};

export type BlockedCategory =
  | 'sexual'
  | 'nudity'
  | 'violence'
  | 'hate_speech'
  | 'offensive';

export interface CategoryScore {
  category: BlockedCategory;
  keywordMatches: string[];
  points: number;
}

export const BLOCKED_CATEGORIES: Record<BlockedCategory, string[]> = {
  sexual: [
    'sexual', 'sex', 'explicit', 'porn', 'pornographic', 'xxx', 'adult_content',
    'erotic', 'nsfw', 'obscene',
  ],
  nudity: [
    'nudity', 'nude', 'naked', 'bare_skin', 'topless', 'lingerie',
    'swimsuit', 'underwear',
  ],
  violence: [
    'violence', 'violent', 'gore', 'blood', 'bloody', 'fight', 'weapon',
    'kill', 'killing', 'death', 'dead_body', 'injury', 'assault',
    'explosion', 'war', 'combat',
  ],
  hate_speech: [
    'hate', 'racist', 'racism', 'discrimination', 'slur', 'xenophobia',
    'bigotry', 'supremacy',
  ],
  offensive: [
    'offensive', 'abusive', 'harassment', 'harass', 'toxic',
    'bullying', 'profanity', 'vulgar', 'crude',
  ],
};

export const REJECT_THRESHOLD = 75;
export const FLAG_THRESHOLD = 50;
export const MAX_SCORE = 100;
export const POINTS_PER_KEYWORD = 10;
export const MAX_POINTS_PER_CATEGORY = 30;

export const getBlockedKeywords = (): string[] => {
  return Object.values(BLOCKED_CATEGORIES).flat();
};

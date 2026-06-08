import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app';
import { fallbackGeneratePost, fallbackSuggestHashtags } from '../src/services/deterministicTemplates';
import { parseAiJson } from '../src/services/modelRouter.service';

// ---------------------------------------------------------------------------
// Unit tests — no database required, always run reliably
// ---------------------------------------------------------------------------

describe('Sprint 15: Empty input validation', () => {

  it('POST /ai/generate-post rejects empty topic', async () => {
    const res = await request(app)
      .post('/ai/generate-post')
      .send({ topic: '', tone: 'professional', format: 'short' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /ai/generate-post rejects missing body', async () => {
    const res = await request(app)
      .post('/ai/generate-post')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /ai/suggest-hashtags rejects empty postContent', async () => {
    const res = await request(app)
      .post('/ai/suggest-hashtags')
      .send({ postContent: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /ai/suggest-improvements rejects empty postContent', async () => {
    const res = await request(app)
      .post('/ai/suggest-improvements')
      .send({ postContent: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('POST /ai/related-post-ideas rejects empty postContent', async () => {
    const res = await request(app)
      .post('/ai/related-post-ideas')
      .send({ postContent: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('POST /ai/recommend-media rejects empty postContent', async () => {
    const res = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('PATCH /files/:id/status rejects invalid status value', async () => {
    const res = await request(app)
      .patch('/files/000000000000000000000000/status')
      .send({ status: 'invalid_status' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PATCH /files/:id/status requires moderationReason when status is rejected', async () => {
    const res = await request(app)
      .patch('/files/000000000000000000000000/status')
      .send({ status: 'rejected' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Sprint 15: Malformed AI output handling', () => {

  it('parseAiJson throws AI_UNAVAILABLE for completely invalid JSON', () => {
    expect(() => parseAiJson('This is not JSON at all')).toThrow('invalid response format');
  });

  it('parseAiJson returns a string when valid JSON is a string', () => {
    const result = parseAiJson('"just a string"');
    expect(typeof result).toBe('string');
  });

  it('parseAiJson returns an empty object when valid JSON is an empty object', () => {
    const result = parseAiJson('{}');
    expect(result).toEqual({});
  });

  it('parseAiJson returns an array when valid JSON is an array', () => {
    const result = parseAiJson('[1, 2, 3]');
    expect(Array.isArray(result)).toBe(true);
  });

  it('parseAiJson throws AI_UNAVAILABLE for truncated/malformed JSON', () => {
    expect(() => parseAiJson('{"content": "hello world"')).toThrow('invalid response format');
  });

  it('parseAiJson returns parsed object for valid JSON with expected fields', () => {
    const result = parseAiJson('{"content": "hello", "variations": []}');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('content', 'hello');
  });

  it('parseAiJson handles nested JSON with extra whitespace', () => {
    const raw = `  {  "content" : "test" , "variations" : []  }  `;
    const result = parseAiJson(raw);
    expect(result).not.toBeNull();
  });
});

describe('Sprint 15: AI failure fallback responses', () => {

  it('fallbackGeneratePost returns fallbackUsed=true', () => {
    const result = fallbackGeneratePost('Test', 'professional', 'short');
    expect(result.fallbackUsed).toBe(true);
  });

  it('fallbackGeneratePost contains topic in content', () => {
    const result = fallbackGeneratePost('AI Safety Research', 'casual', 'long');
    expect(result.content).toContain('AI Safety Research');
  });

  it('fallbackGeneratePost returns 3 variations', () => {
    const result = fallbackGeneratePost('Test', 'excited', 'bullet');
    expect(result.variations).toHaveLength(3);
  });

  it('fallbackGeneratePost returns improvements list', () => {
    const result = fallbackGeneratePost('Test', 'professional', 'short');
    expect(result.improvements.length).toBeGreaterThanOrEqual(2);
  });

  it('fallbackGeneratePost returns related ideas list', () => {
    const result = fallbackGeneratePost('Test', 'professional', 'short');
    expect(result.relatedIdeas.length).toBeGreaterThanOrEqual(2);
  });

  it('fallbackSuggestHashtags returns fallback tags for stopword-only input', () => {
    const result = fallbackSuggestHashtags('the and for but');
    expect(result.hashtags).toContain('#ContentDraft');
    expect(result.hashtags).toContain('#AIUnavailable');
  });

  it('fallbackSuggestHashtags extracts real keywords from meaningful input', () => {
    const result = fallbackSuggestHashtags('Exploring new marketing strategies');
    expect(result.hashtags).toContain('#Marketing');
    expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Sprint 15: Validation error shape consistency', () => {

  it('all validation errors use VALIDATION_ERROR code', async () => {
    const res1 = await request(app).post('/ai/generate-post').send({});
    expect(res1.body.error.code).toBe('VALIDATION_ERROR');

    const res2 = await request(app).post('/ai/suggest-hashtags').send({});
    expect(res2.body.error.code).toBe('VALIDATION_ERROR');

    const res3 = await request(app).post('/ai/suggest-improvements').send({});
    expect(res3.body.error.code).toBe('VALIDATION_ERROR');

    const res4 = await request(app).post('/ai/related-post-ideas').send({});
    expect(res4.body.error.code).toBe('VALIDATION_ERROR');

    const res5 = await request(app).post('/ai/recommend-media').send({});
    expect(res5.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('all validation errors return success=false', async () => {
    const res = await request(app).post('/ai/generate-post').send({});
    expect(res.body.success).toBe(false);
  });

  it('validation error details contain field-level information', async () => {
    const res = await request(app)
      .post('/ai/generate-post')
      .send({ topic: '', tone: 'invalid_tone', format: 'short' })
      .expect(400);

    expect(res.body.error.details).toBeDefined();
  });
});



import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  generatePost: vi.fn(),
  suggestHashtags: vi.fn(),
}));

vi.mock('../src/services/ai.service', () => ({
  generatePost: mocks.generatePost,
  suggestHashtags: mocks.suggestHashtags,
  buildGeneratePostPrompt: vi.fn(),
  buildHashtagPrompt: vi.fn(),
  buildMediaRecommendationPrompt: vi.fn(),
}));

import app from '../src/app';

describe('POST /ai/generate-post', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    mocks.generatePost.mockReset();
    mocks.suggestHashtags.mockReset();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns generated post content for valid prompt', async () => {
    mocks.generatePost.mockResolvedValue({
      primary: 'We are thrilled to announce our new product launch!',
      variations: [
        'Exciting news — our new product is here.',
        'Today marks a new chapter for our brand.',
      ],
      hashtags: ['#ProductLaunch', '#Innovation', '#NewRelease'],
    });

    const response = await request(app)
      .post('/ai/generate-post')
      .send({ prompt: 'Write a post about our new product launch' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.primary).toBe('We are thrilled to announce our new product launch!');
    expect(response.body.data.variations).toHaveLength(2);
    expect(response.body.data.hashtags).toContain('#ProductLaunch');
  });

  it('respects the tone parameter', async () => {
    mocks.generatePost.mockResolvedValue({
      primary: 'Yo check out this dope new release!',
      variations: ['Sick new drop fam.', 'This is fire tbh.'],
      hashtags: ['#NewDrop', '#Lit'],
    });

    const response = await request(app)
      .post('/ai/generate-post')
      .send({ prompt: 'Write about our new product', tone: 'casual', variations: 2 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.variations).toHaveLength(2);
  });

  it('caps variations at 5 via service', async () => {
    mocks.generatePost.mockResolvedValue({
      primary: 'Test post',
      variations: ['v1', 'v2', 'v3', 'v4', 'v5'],
      hashtags: ['#Test'],
    });

    const response = await request(app)
      .post('/ai/generate-post')
      .send({ prompt: 'Write a post about testing', variations: 10 })
      .expect(200);

    expect(response.body.data.variations).toHaveLength(5);
    expect(mocks.generatePost).toHaveBeenCalledWith(
      'Write a post about testing',
      'professional',
      10,
    );
  });

  it('returns 400 for short prompt', async () => {
    const response = await request(app)
      .post('/ai/generate-post')
      .send({ prompt: 'short' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('returns 400 for missing prompt', async () => {
    const response = await request(app)
      .post('/ai/generate-post')
      .send({ tone: 'professional' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 when AI service throws', async () => {
    mocks.generatePost.mockRejectedValue(new Error('AI service failure'));

    const response = await request(app)
      .post('/ai/generate-post')
      .send({ prompt: 'Write a post about our new product launch' })
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /ai/suggest-hashtags', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    mocks.generatePost.mockReset();
    mocks.suggestHashtags.mockReset();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns hashtag suggestions for valid post content', async () => {
    mocks.suggestHashtags.mockResolvedValue({
      hashtags: ['#ProductLaunch', '#Innovation', '#NewRelease', '#TechNews', '#Startup'],
    });

    const response = await request(app)
      .post('/ai/suggest-hashtags')
      .send({ postContent: 'We are launching a new product next week with amazing features' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.hashtags).toContain('#ProductLaunch');
  });

  it('returns 400 for empty post content', async () => {
    const response = await request(app)
      .post('/ai/suggest-hashtags')
      .send({ postContent: '' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 when AI service throws', async () => {
    mocks.suggestHashtags.mockRejectedValue(new Error('AI service failure'));

    const response = await request(app)
      .post('/ai/suggest-hashtags')
      .send({ postContent: 'We are launching a new product next week' })
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });
});

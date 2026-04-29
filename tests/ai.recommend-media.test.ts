import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';

const createFile = (overrides: Record<string, unknown>) => {
  return File.create({
    name: 'default-file.png',
    type: 'image',
    size: 1000,
    url: `https://s3.example.com/files/${crypto.randomUUID()}.png`,
    tags: [],
    status: 'approved',
    ...overrides,
  });
};

describe('POST /ai/recommend-media', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await File.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns ranked recommendations for valid post content', async () => {
    await createFile({
      name: 'product-launch-campaign.png',
      tags: ['product', 'launch', 'marketing'],
    });
    await createFile({
      name: 'team-culture-video.mp4',
      type: 'video',
      tags: ['team', 'culture'],
    });

    const response = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: 'Product launch marketing announcement for next week' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.totalMatched).toBe(1);
    expect(response.body.data.recommendations[0]).toMatchObject({
      score: 3,
      matchReason: 'File tags/name match post keywords: product, launch, marketing',
      file: {
        name: 'product-launch-campaign.png',
        status: 'approved',
      },
    });
  });

  it('returns 400 for empty or weak post content', async () => {
    const response = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: 'launch' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  });

  it('returns the required message when no approved media exists', async () => {
    await createFile({
      name: 'rejected-product-launch.png',
      tags: ['product', 'launch'],
      status: 'rejected',
    });

    const response = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: 'Product launch announcement for next week' })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        recommendations: [],
        message: 'No approved media files are available in the library.',
      },
    });
  });

  it('returns the required message when no approved media matches the post', async () => {
    await createFile({
      name: 'finance-report.pdf',
      type: 'document',
      tags: ['finance', 'quarterly'],
    });

    const response = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: 'Product launch announcement for next week' })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        recommendations: [],
        message: 'No files matched the content of this post.',
      },
    });
  });

  it('never returns non-approved files', async () => {
    await createFile({
      name: 'approved-product-launch.png',
      tags: ['product', 'launch'],
      status: 'approved',
    });
    await createFile({
      name: 'rejected-product-launch.png',
      tags: ['product', 'launch'],
      status: 'rejected',
    });

    const response = await request(app)
      .post('/ai/recommend-media')
      .send({ postContent: 'Product launch announcement for next week' })
      .expect(200);

    const names = response.body.data.recommendations.map(
      (recommendation: { file: { name: string } }) => recommendation.file.name,
    );

    expect(names).toEqual(['approved-product-launch.png']);
    expect(names).not.toContain('rejected-product-launch.png');
  });
});

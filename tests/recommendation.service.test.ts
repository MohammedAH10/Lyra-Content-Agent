import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import File from '../src/models/File';
import {
  extractKeywords,
  recommendMediaForPost,
} from '../src/services/recommendation.service';

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

describe('recommendation service', () => {
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

  it('extracts keywords from post content', () => {
    expect(extractKeywords('Launching our new product campaign next week!')).toEqual([
      'launching',
      'new',
      'product',
      'campaign',
      'next',
      'week',
    ]);
  });

  it('removes stopwords from extracted keywords', () => {
    expect(extractKeywords('The product is for the team and the market')).toEqual([
      'product',
      'team',
      'market',
    ]);
  });

  it('only considers approved files', async () => {
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
    await createFile({
      name: 'pending-product-launch.png',
      tags: ['product', 'launch'],
      status: 'scan_in_progress',
    });

    const result = await recommendMediaForPost('Product launch announcement');

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].file.name).toBe('approved-product-launch.png');
  });

  it('scores files by overlap with file name and tags', async () => {
    await createFile({
      name: 'brand-office.png',
      tags: ['team'],
    });
    await createFile({
      name: 'product-launch-campaign.png',
      tags: ['product', 'launch', 'marketing'],
    });

    const result = await recommendMediaForPost('Product launch marketing post');

    expect(result.recommendations[0]).toMatchObject({
      score: 3,
      matchReason: 'File tags/name match post keywords: product, launch, marketing',
    });
  });

  it('sorts results by descending score', async () => {
    await createFile({
      name: 'product.png',
      tags: ['product'],
    });
    await createFile({
      name: 'product-launch-marketing.png',
      tags: ['product', 'launch', 'marketing'],
    });

    const result = await recommendMediaForPost('Product launch marketing update');

    expect(result.recommendations.map((recommendation) => recommendation.file.name)).toEqual([
      'product-launch-marketing.png',
      'product.png',
    ]);
  });

  it('returns the required empty-library message when no approved files exist', async () => {
    await createFile({
      name: 'rejected-product-launch.png',
      tags: ['product', 'launch'],
      status: 'rejected',
    });

    const result = await recommendMediaForPost('Product launch announcement');

    expect(result).toEqual({
      recommendations: [],
      message: 'No approved media files are available in the library.',
    });
  });

  it('returns the required no-match message when approved files have no relevant matches', async () => {
    await createFile({
      name: 'finance-report.pdf',
      type: 'document',
      tags: ['finance', 'quarterly'],
    });

    const result = await recommendMediaForPost('Product launch announcement');

    expect(result).toEqual({
      recommendations: [],
      message: 'No files matched the content of this post.',
    });
  });
});

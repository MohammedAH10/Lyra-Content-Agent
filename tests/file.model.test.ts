import { describe, expect, it } from 'vitest';

import { FILE_STATUSES, FILE_TYPES, FILE_VISIBILITY } from '../src/utils/constants';
import File from '../src/models/File';

const validFileData = {
  name: 'product-launch.png',
  type: 'image',
  size: 204800,
  url: 'https://s3.example.com/files/product-launch.png',
  tags: ['product', 'launch', 'marketing'],
};

describe('File model validation', () => {
  it('creates a valid file document with upload_initiated as the default status', async () => {
    const file = new File(validFileData);

    await expect(file.validate()).resolves.toBeUndefined();
    expect(file.status).toBe('upload_initiated');
    expect(file.uploadDate).toBeInstanceOf(Date);
  });

  it.each(FILE_STATUSES)('accepts status %s', async (status) => {
    const file = new File({ ...validFileData, status });

    await expect(file.validate()).resolves.toBeUndefined();
  });

  it('rejects unsupported statuses', async () => {
    const file = new File({ ...validFileData, status: 'archived' });

    await expect(file.validate()).rejects.toThrow();
  });

  it.each(FILE_TYPES)('accepts file type %s', async (type) => {
    const file = new File({ ...validFileData, type });

    await expect(file.validate()).resolves.toBeUndefined();
  });

  it('rejects unsupported file types', async () => {
    const file = new File({ ...validFileData, type: 'spreadsheet' });

    await expect(file.validate()).rejects.toThrow();
  });

  it('allows rejected files to store a moderation reason', async () => {
    const file = new File({
      ...validFileData,
      status: 'rejected',
      moderationReason: 'Sensitive content detected',
    });

    await expect(file.validate()).resolves.toBeUndefined();
    expect(file.moderationReason).toBe('Sensitive content detected');
  });

  // ── New Sprint 3 fields ────────────────────────────────────

  it('accepts mimeType, description, ownerId, and visibility fields', async () => {
    const file = new File({
      ...validFileData,
      mimeType: 'image/png',
      description: 'Product launch banner image for Q3 campaign',
      ownerId: 'user-123',
      visibility: 'public',
    });

    await expect(file.validate()).resolves.toBeUndefined();
    expect(file.mimeType).toBe('image/png');
    expect(file.description).toBe('Product launch banner image for Q3 campaign');
    expect(file.ownerId).toBe('user-123');
    expect(file.visibility).toBe('public');
  });

  it.each(FILE_VISIBILITY)('accepts visibility %s', async (visibility) => {
    const file = new File({ ...validFileData, visibility });

    await expect(file.validate()).resolves.toBeUndefined();
  });

  it('rejects unsupported visibility values', async () => {
    const file = new File({ ...validFileData, visibility: 'shared' });

    await expect(file.validate()).rejects.toThrow();
  });

  it('accepts S3 reference fields', async () => {
    const file = new File({
      ...validFileData,
      s3Key: 'uploads/product-launch.png',
      s3Bucket: 't-world-media',
      s3Url: 'https://t-world-media.s3.amazonaws.com/uploads/product-launch.png',
    });

    await expect(file.validate()).resolves.toBeUndefined();
    expect(file.s3Key).toBe('uploads/product-launch.png');
    expect(file.s3Bucket).toBe('t-world-media');
    expect(file.s3Url).toBe('https://t-world-media.s3.amazonaws.com/uploads/product-launch.png');
  });

  it('accepts pending_review status', async () => {
    const file = new File({
      ...validFileData,
      status: 'pending_review',
      moderationReason: 'Flagged for admin review — safety score 65',
    });

    await expect(file.validate()).resolves.toBeUndefined();
    expect(file.status).toBe('pending_review');
  });
});

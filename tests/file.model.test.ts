import { describe, expect, it } from 'vitest';

import { FILE_STATUSES, FILE_TYPES } from '../src/utils/constants';
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
});

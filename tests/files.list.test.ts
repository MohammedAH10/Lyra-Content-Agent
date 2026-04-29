import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';
import logger from '../src/utils/logger';

const seedFiles = async () => {
  await File.create([
    {
      name: 'approved-launch-image.png',
      type: 'image',
      size: 1000,
      url: 'https://s3.example.com/files/approved-launch-image.png',
      tags: ['launch'],
      status: 'approved',
    },
    {
      name: 'approved-demo-video.mp4',
      type: 'video',
      size: 2000,
      url: 'https://s3.example.com/files/approved-demo-video.mp4',
      tags: ['demo'],
      status: 'approved',
    },
    {
      name: 'rejected-sensitive-image.png',
      type: 'image',
      size: 3000,
      url: 'https://s3.example.com/files/rejected-sensitive-image.png',
      tags: ['sensitive'],
      status: 'rejected',
      moderationReason: 'Sensitive content detected',
    },
    {
      name: 'pending-upload-document.pdf',
      type: 'document',
      size: 4000,
      url: 'https://s3.example.com/files/pending-upload-document.pdf',
      tags: ['pending'],
      status: 'upload_initiated',
    },
    {
      name: 'scanning-audio.mp3',
      type: 'audio',
      size: 5000,
      url: 'https://s3.example.com/files/scanning-audio.mp3',
      tags: ['audio'],
      status: 'scan_in_progress',
    },
  ]);
};

describe('GET /files', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await File.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns only approved files by default', async () => {
    await seedFiles();

    const response = await request(app).get('/files').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(2);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.map((file: { status: string }) => file.status)).toEqual([
      'approved',
      'approved',
    ]);
  });

  it('never leaks non-approved files into default user-facing responses', async () => {
    await seedFiles();

    const response = await request(app).get('/files').expect(200);
    const returnedNames = response.body.data.map((file: { name: string }) => file.name);

    expect(returnedNames).not.toContain('rejected-sensitive-image.png');
    expect(returnedNames).not.toContain('pending-upload-document.pdf');
    expect(returnedNames).not.toContain('scanning-audio.mp3');
  });

  it('filters approved files by type query', async () => {
    await seedFiles();

    const response = await request(app).get('/files?type=image').expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.data[0]).toMatchObject({
      name: 'approved-launch-image.png',
      type: 'image',
      status: 'approved',
    });
  });

  it('filters by moderation state when admin-style status query is supplied', async () => {
    await seedFiles();

    const response = await request(app).get('/files?status=rejected').expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.data[0]).toMatchObject({
      name: 'rejected-sensitive-image.png',
      status: 'rejected',
      moderationReason: 'Sensitive content detected',
    });
  });

  it('logs an audit event when non-approved files are filtered out by default', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    await seedFiles();

    await request(app).get('/files').expect(200);

    expect(warnSpy).toHaveBeenCalledWith(
      'Non-approved files filtered from list response',
      expect.objectContaining({
        filteredCount: 3,
      }),
    );
  });
});

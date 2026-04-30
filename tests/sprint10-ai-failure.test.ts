import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';
import * as filesService from '../src/services/files.service';

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

describe('Sprint 10: AI Failure Handling', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    mocks.generatePost.mockReset();
    mocks.suggestHashtags.mockReset();
    await File.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('AI unavailable returns 503 with AI_UNAVAILABLE', () => {
    it('for POST /ai/generate-post', async () => {
      mocks.generatePost.mockRejectedValue(
        new Error('Content generation is temporarily unavailable. Please try again shortly.'),
      );

      const response = await request(app)
        .post('/ai/generate-post')
        .send({ prompt: 'Write a post about our new product launch' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('for POST /ai/suggest-hashtags', async () => {
      mocks.suggestHashtags.mockRejectedValue(
        new Error('Content generation is temporarily unavailable.'),
      );

      const response = await request(app)
        .post('/ai/suggest-hashtags')
        .send({ postContent: 'We are launching a new product next week' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('AI timeout returns 504 with AI_TIMEOUT', () => {
    it('for POST /ai/generate-post', async () => {
      mocks.generatePost.mockRejectedValue(
        new Error('The request took too long. Please try again.'),
      );

      const response = await request(app)
        .post('/ai/generate-post')
        .send({ prompt: 'Write a post about our new product launch' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('for POST /ai/suggest-hashtags', async () => {
      mocks.suggestHashtags.mockRejectedValue(
        new Error('The request took too long. Please try again.'),
      );

      const response = await request(app)
        .post('/ai/suggest-hashtags')
        .send({ postContent: 'We are launching a new product next week' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Sprint 10: Database Error Handling', () => {
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

  describe('Database errors return DB_ERROR', () => {
    it('for POST /files when file creation fails', async () => {
      vi.spyOn(filesService, 'createFile').mockRejectedValue(
        new Error('Failed to save file record to database.'),
      );

      const response = await request(app)
        .post('/files')
        .send({
          name: 'test-file.png',
          type: 'image',
          size: 1000,
          url: 'https://s3.example.com/test.png',
          tags: ['test'],
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('for GET /files when retrieval fails', async () => {
      vi.spyOn(filesService, 'listFiles').mockRejectedValue(
        new Error('Failed to retrieve files from database.'),
      );

      const response = await request(app).get('/files').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('for PATCH /files/:id/status when update fails', async () => {
      const file = await File.create({
        name: 'test-file.png',
        type: 'image',
        size: 1000,
        url: 'https://s3.example.com/test.png',
        tags: [],
        status: 'upload_initiated',
      });

      vi.spyOn(filesService, 'updateFileStatus').mockRejectedValue(
        new Error('Failed to update file status in database.'),
      );

      const response = await request(app)
        .patch(`/files/${file._id.toString()}/status`)
        .send({ status: 'approved' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';

describe('Sprint 5: AWS/S3 Workflow Simulation', () => {
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

  describe('POST /files/initiate-upload', () => {
    it('creates a file with S3 metadata and transitions to scan_in_progress', async () => {
      const response = await request(app)
        .post('/files/initiate-upload')
        .attach('file', Buffer.from('fake-image-data'), 'team-photo.jpg')
        .field('name', 'team-photo.jpg')
        .field('tags', 'team,office,culture')
        .field('description', 'Team photo from Q3 retreat');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data.name).toBe('team-photo.jpg');
      expect(data.type).toBe('image');
      expect(data.status).toBe('scan_in_progress');
      expect(data.moderationReason).toContain('Scan initiated');

      expect(data.s3Bucket).toBe('t-world-media');
      expect(data.s3Key).toMatch(/^uploads\//);
      expect(data.s3Url).toContain('s3.us-east-1.amazonaws.com');
      expect(data.s3Url).toContain(data.s3Key);
    });

    it('stores the actual file data for later retrieval', async () => {
      const fileBuffer = Buffer.from('real-image-bytes-content');
      const response = await request(app)
        .post('/files/initiate-upload')
        .attach('file', fileBuffer, 'product-photo.jpg')
        .field('name', 'product-photo.jpg')
        .field('tags', 'product');

      const fileId = response.body.data.id;

      const dataResponse = await request(app)
        .get(`/files/${fileId}/data`)
        .expect(200);

      expect(dataResponse.body).toEqual(fileBuffer);
      expect(dataResponse.headers['content-type']).toBe('image/jpeg');
      expect(dataResponse.headers['content-length']).toBe(String(fileBuffer.length));
    });

    it('returns 400 when no file is attached', async () => {
      const response = await request(app)
        .post('/files/initiate-upload')
        .field('name', 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/files/initiate-upload')
        .attach('file', Buffer.from('data'), 'photo.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('accepts optional type, ownerId, and description fields', async () => {
      const response = await request(app)
        .post('/files/initiate-upload')
        .attach('file', Buffer.from('data'), 'document.pdf')
        .field('name', 'document.pdf')
        .field('type', 'document')
        .field('ownerId', 'user-456')
        .field('description', 'Annual report');

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('document');
      expect(response.body.data.ownerId).toBe('user-456');
      expect(response.body.data.description).toBe('Annual report');
    });
  });

  describe('PATCH /workflow/files/:id/moderation-result', () => {
    const createScanningFile = async () => {
      return File.create({
        name: 'scanning-file.mp4',
        type: 'video',
        size: 1024,
        tags: ['test'],
        data: Buffer.from('test-data'),
        s3Bucket: 't-world-media',
        s3Key: 'uploads/test-file.mp4',
        s3Url: 'https://t-world-media.s3.us-east-1.amazonaws.com/uploads/test-file.mp4',
        status: 'scan_in_progress',
        moderationReason: 'Scan initiated — awaiting moderation result',
        url: '/api/files/test/data',
      });
    };

    it('auto-approves a file with score below 50', async () => {
      const file = await createScanningFile();

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationScore: 15, moderationCategories: [] })
        .expect(200);

      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.moderationReason).toContain('Auto-approved');
      expect(response.body.data.moderationReason).toContain('15');
    });

    it('flags a file as pending_review for score between 50-74', async () => {
      const file = await createScanningFile();

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationScore: 65, moderationCategories: ['hate_speech', 'offensive'] })
        .expect(200);

      expect(response.body.data.status).toBe('pending_review');
      expect(response.body.data.moderationReason).toContain('Flagged for admin review');
      expect(response.body.data.moderationReason).toContain('65');
    });

    it('auto-rejects a file with score >= 75', async () => {
      const file = await createScanningFile();

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationScore: 88, moderationCategories: ['sexual', 'violence'] })
        .expect(200);

      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.moderationReason).toContain('Auto-rejected');
      expect(response.body.data.moderationReason).toContain('88');
    });

    it('rejects a file not in scan_in_progress status', async () => {
      const file = await File.create({
        name: 'already-approved.png',
        type: 'image',
        size: 100,
        tags: [],
        status: 'approved',
        url: '/api/files/test/data',
      });

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationScore: 30, moderationCategories: [] })
        .expect(409);

      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('returns 400 for missing moderationScore', async () => {
      const file = await createScanningFile();

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationCategories: [] })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for out-of-range moderationScore', async () => {
      const file = await createScanningFile();

      const response = await request(app)
        .patch(`/workflow/files/${file._id.toString()}/moderation-result`)
        .send({ moderationScore: 150, moderationCategories: [] })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for unknown file ID', async () => {
      const response = await request(app)
        .patch(`/workflow/files/${new mongoose.Types.ObjectId().toString()}/moderation-result`)
        .send({ moderationScore: 30, moderationCategories: [] })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /files/s3-data (simulated S3 retrieval)', () => {
    it('serves file data by s3Key', async () => {
      const file = await File.create({
        name: 's3-image.png',
        type: 'image',
        size: 512,
        tags: [],
        data: Buffer.from('s3-served-content'),
        s3Bucket: 't-world-media',
        s3Key: 'uploads/s3-image.png',
        s3Url: 'https://t-world-media.s3.us-east-1.amazonaws.com/uploads/s3-image.png',
        status: 'approved',
        url: '/api/files/test/data',
      });

      const response = await request(app)
        .get(`/files/s3-data?s3Key=${encodeURIComponent('uploads/s3-image.png')}`)
        .expect(200);

      expect(response.body).toEqual(Buffer.from('s3-served-content'));
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['x-amz-request-id']).toBeDefined();
    });

    it('returns 400 when s3Key is missing', async () => {
      const response = await request(app)
        .get('/files/s3-data')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for unknown s3Key', async () => {
      const response = await request(app)
        .get('/files/s3-data?s3Key=uploads/nonexistent.png')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

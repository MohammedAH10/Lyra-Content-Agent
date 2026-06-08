import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';

describe('Sprint 4: Files & Docs API — Upload with Moderation', () => {
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

  describe('POST /files/upload with moderation', () => {
    it('auto-approves a clean file (score < 50)', async () => {
      const response = await request(app)
        .post('/files/upload')
        .attach('file', Buffer.from('fake-image-bytes'), 'team-photo-2024.jpg')
        .field('name', 'team-photo-2024.jpg')
        .field('tags', 'team,photo,office');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.moderationReason).toContain('Auto-approved');
    });

    it('flags a file as pending_review (score 50-74)', async () => {
      const response = await request(app)
        .post('/files/upload')
        .attach('file', Buffer.from('fake-video-bytes'), 'violent-content-review.mp4')
        .field('name', 'violent-content-review.mp4')
        .field('tags', 'violence,review,blood');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending_review');
      expect(response.body.data.moderationReason).toContain('Flagged for admin review');
    });

    it('auto-rejects a file with explicit content (score >= 75)', async () => {
      const response = await request(app)
        .post('/files/upload')
        .attach('file', Buffer.from('fake-video-bytes'), 'explicit-sexual-content.mp4')
        .field('name', 'explicit-sexual-content.mp4')
        .field('tags', 'explicit,sexual,porn,xxx');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.moderationReason).toContain('Auto-rejected');
    });

    it('returns 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/files/upload')
        .field('name', 'test-file.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/files/upload')
        .attach('file', Buffer.from('bytes'), 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /files — approved-only boundary', () => {
    beforeEach(async () => {
      await File.create([
        { name: 'approved-1.png', type: 'image', size: 100, url: '/data/1', status: 'approved', tags: [] },
        { name: 'approved-2.png', type: 'image', size: 200, url: '/data/2', status: 'approved', tags: [] },
        { name: 'rejected-1.jpg', type: 'image', size: 150, url: '/data/3', status: 'rejected', tags: [] },
        { name: 'pending-upload.png', type: 'image', size: 300, url: '/data/4', status: 'upload_initiated', tags: [] },
        { name: 'scanning.pdf', type: 'document', size: 400, url: '/data/5', status: 'scan_in_progress', tags: [] },
        { name: 'flagged-video.mp4', type: 'video', size: 500, url: '/data/6', status: 'pending_review', tags: [] },
      ]);
    });

    it('returns only approved files by default', async () => {
      const response = await request(app).get('/files').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      response.body.data.forEach((f: { status: string }) => {
        expect(f.status).toBe('approved');
      });
    });

    it('filters by type', async () => {
      const response = await request(app).get('/files?type=document').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });

    it('filters by status when explicitly requested', async () => {
      const response = await request(app).get('/files?status=rejected').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('rejected');
    });

    it('returns all approved files across types', async () => {
      const response = await request(app).get('/files?type=image').expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.data.every((f: { type: string }) => f.type === 'image')).toBe(true);
    });

    it('rejected files never appear in default (approved-only) listing', async () => {
      const approved = await request(app).get('/files');
      const approvedIds = approved.body.data.map((f: { id: string }) => f.id);

      const rejected = await File.find({ status: 'rejected' });
      rejected.forEach((r) => {
        expect(approvedIds).not.toContain(r._id.toString());
      });
    });
  });

  describe('PATCH /files/:id/status — admin moderation actions', () => {
    it('can approve a pending_review file', async () => {
      const file = await File.create({
        name: 'pending-review.png', type: 'image', size: 100,
        url: '/data/pending', tags: [], status: 'pending_review',
        moderationReason: 'Flagged for admin review',
      });

      const response = await request(app)
        .patch(`/files/${file._id.toString()}/status`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.moderationReason).toBeNull();
    });

    it('can reject a pending_review file with reason', async () => {
      const file = await File.create({
        name: 'pending-review.png', type: 'image', size: 100,
        url: '/data/pending', tags: [], status: 'pending_review',
        moderationReason: 'Flagged for admin review',
      });

      const response = await request(app)
        .patch(`/files/${file._id.toString()}/status`)
        .send({ status: 'rejected', moderationReason: 'Admin confirmed violation' })
        .expect(200);

      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.moderationReason).toBe('Admin confirmed violation');
    });
  });
});

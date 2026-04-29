import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';
import logger from '../src/utils/logger';

const createPendingFile = async () => {
  return File.create({
    name: 'pipeline-file.png',
    type: 'image',
    size: 204800,
    url: 'https://s3.example.com/files/pipeline-file.png',
    tags: ['pipeline'],
    status: 'scan_in_progress',
  });
};

describe('PATCH /files/:id/status', () => {
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

  it('updates an existing file to approved', async () => {
    const file = await createPendingFile();

    const response = await request(app)
      .patch(`/files/${file._id.toString()}/status`)
      .send({ status: 'approved' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      id: file._id.toString(),
      status: 'approved',
    });

    const updatedFile = await File.findById(file._id);
    expect(updatedFile?.status).toBe('approved');
  });

  it('updates an existing file to rejected with a moderation reason', async () => {
    const file = await createPendingFile();

    const response = await request(app)
      .patch(`/files/${file._id.toString()}/status`)
      .send({ status: 'rejected', moderationReason: 'Unsafe visual content' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: file._id.toString(),
      status: 'rejected',
      moderationReason: 'Unsafe visual content',
    });
  });

  it('requires moderationReason when status is rejected', async () => {
    const file = await createPendingFile();

    const response = await request(app)
      .patch(`/files/${file._id.toString()}/status`)
      .send({ status: 'rejected' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  });

  it('returns 400 for unsupported statuses', async () => {
    const file = await createPendingFile();

    const response = await request(app)
      .patch(`/files/${file._id.toString()}/status`)
      .send({ status: 'scan_in_progress' })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown file IDs', async () => {
    const unknownId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .patch(`/files/${unknownId}/status`)
      .send({ status: 'approved' })
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'File not found',
        details: {},
      },
    });
  });

  it('logs file status update events', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const file = await createPendingFile();

    await request(app)
      .patch(`/files/${file._id.toString()}/status`)
      .send({ status: 'approved' })
      .expect(200);

    expect(infoSpy).toHaveBeenCalledWith(
      'File status updated',
      expect.objectContaining({
        fileId: file._id.toString(),
        status: 'approved',
      }),
    );
  });
});

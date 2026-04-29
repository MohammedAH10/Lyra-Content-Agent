import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import app from '../src/app';
import File from '../src/models/File';

const validFilePayload = {
  name: 'product-launch.png',
  type: 'image',
  size: 204800,
  url: 'https://s3.example.com/files/product-launch.png',
  tags: ['product', 'launch', 'marketing'],
};

describe('POST /files', () => {
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

  it('creates a file record and returns 201', async () => {
    const response = await request(app).post('/files').send(validFilePayload).expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      name: validFilePayload.name,
      type: validFilePayload.type,
      size: validFilePayload.size,
      url: validFilePayload.url,
      tags: validFilePayload.tags,
      status: 'upload_initiated',
    });

    const files = await File.find({});
    expect(files).toHaveLength(1);
    expect(files[0].status).toBe('upload_initiated');
  });

  it('always creates files with upload_initiated status', async () => {
    const response = await request(app)
      .post('/files')
      .send({ ...validFilePayload, status: 'approved' })
      .expect(201);

    expect(response.body.data.status).toBe('upload_initiated');

    const createdFile = await File.findById(response.body.data.id);
    expect(createdFile?.status).toBe('upload_initiated');
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await request(app).post('/files').send({ type: 'image' }).expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  });

  it('returns 400 when fields are invalid', async () => {
    const response = await request(app)
      .post('/files')
      .send({ ...validFilePayload, type: 'spreadsheet', size: -1 })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

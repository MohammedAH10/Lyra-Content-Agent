import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { errorHandler } from '../src/middleware/errorHandler';
import { validate } from '../src/middleware/validate';

const buildTestApp = () => {
  const app = express();

  app.use(express.json());

  app.post(
    '/validated',
    validate({
      body: z.object({
        name: z.string().min(1),
      }),
    }),
    (_req, res) => {
      res.status(200).json({ success: true });
    },
  );

  app.get('/unknown-error', () => {
    throw new Error('Unexpected test failure');
  });

  app.use(errorHandler);

  return app;
};

describe('validation and standard error handling', () => {
  it('returns the standard error shape for invalid request bodies', async () => {
    const response = await request(buildTestApp())
      .post('/validated')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: expect.any(Object),
      },
    });
  });

  it('uses VALIDATION_ERROR for validation failures', async () => {
    const response = await request(buildTestApp())
      .post('/validated')
      .send({ name: '' })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('uses INTERNAL_ERROR for unknown errors', async () => {
    const response = await request(buildTestApp()).get('/unknown-error').expect(500);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        details: {},
      },
    });
  });
});

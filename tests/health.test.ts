import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app';

describe('GET /health', () => {
  it('returns the API health response', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'API is healthy',
    });
  });
});

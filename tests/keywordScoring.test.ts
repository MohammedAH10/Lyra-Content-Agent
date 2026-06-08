import { describe, expect, it } from 'vitest';

import {
  scoreFileAgainstContent,
  scoreFiles,
} from '../src/services/keywordScoring.service';
import { FileDocument } from '../src/types';

const makeMockFile = (overrides: Partial<FileDocument> = {}): FileDocument => ({
  _id: { toString: () => 'mock-id-123' } as any,
  name: 'test-file.jpg',
  type: 'image',
  mimeType: 'image/jpeg',
  description: 'A test file description',
  size: 1000,
  url: 'https://example.com/test.jpg',
  tags: ['test', 'sample', 'demo'],
  status: 'approved',
  visibility: 'private',
  uploadDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
}) as unknown as FileDocument;

describe('scoreFileAgainstContent', () => {
  it('returns null when no keywords match', () => {
    const file = makeMockFile({ name: 'office-building.jpg', tags: ['building', 'architecture'] });
    const result = scoreFileAgainstContent(file, ['finance', 'banking', 'investment']);
    expect(result).toBeNull();
  });

  it('scores a file with matching keywords in name and tags', () => {
    const file = makeMockFile({ name: 'student-workshop.jpg', tags: ['student', 'workshop', 'education'] });
    const result = scoreFileAgainstContent(file, ['student', 'workshop', 'entrepreneurship', 'africa']);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
    expect(result!.name).toBe('student-workshop.jpg');
    expect(result!.reason).toContain('student');
    expect(result!.reason).toContain('workshop');
  });

  it('matches against description field', () => {
    const file = makeMockFile({
      name: 'generic.jpg',
      tags: [],
      description: 'entrepreneurship program for african students',
    });
    const result = scoreFileAgainstContent(file, ['entrepreneurship', 'students', 'africa']);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it('matches against file type', () => {
    const file = makeMockFile({ name: 'video.mp4', type: 'video', tags: ['tutorial'] });
    const result = scoreFileAgainstContent(file, ['video', 'tutorial']);
    expect(result).not.toBeNull();
    expect(result!.reason).toContain('video');
  });

  it('returns null for empty post keywords', () => {
    const file = makeMockFile();
    const result = scoreFileAgainstContent(file, []);
    expect(result).toBeNull();
  });

  it('returns correct fileId', () => {
    const file = makeMockFile({ _id: { toString: () => 'file-456' } as any });
    const result = scoreFileAgainstContent(file, ['test']);
    expect(result?.fileId).toBe('file-456');
  });
});

describe('scoreFiles', () => {
  it('returns empty array for empty post content', () => {
    const files = [makeMockFile()];
    const result = scoreFiles(files, '');
    expect(result).toEqual([]);
  });

  it('filters by type', () => {
    const imageFile = makeMockFile({ name: 'image.png', type: 'image', tags: ['launch'] });
    const videoFile = makeMockFile({ name: 'video.mp4', type: 'video', tags: ['launch'] });

    const result = scoreFiles([imageFile, videoFile], 'launch campaign', 'image');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('image');
  });

  it('respects limit parameter', () => {
    const files = [
      makeMockFile({ name: 'a.jpg', tags: ['product'] }),
      makeMockFile({ name: 'b.jpg', tags: ['product'] }),
      makeMockFile({ name: 'c.jpg', tags: ['product'] }),
    ];

    const result = scoreFiles(files, 'product launch', undefined, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('sorts by score descending', () => {
    const lowMatch = makeMockFile({ name: 'low.jpg', tags: ['product'] });
    const highMatch = makeMockFile({
      name: 'high.jpg',
      tags: ['product', 'launch', 'marketing', 'campaign'],
    });

    const result = scoreFiles([lowMatch, highMatch], 'product launch marketing campaign');
    expect(result[0].name).toBe('high.jpg');
    expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
  });

  it('filters out files with zero score', () => {
    const match = makeMockFile({ name: 'match.jpg', tags: ['finance'] });
    const noMatch = makeMockFile({ name: 'unrelated.jpg', tags: ['architecture'] });

    const result = scoreFiles([match, noMatch], 'finance report');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('match.jpg');
  });
});

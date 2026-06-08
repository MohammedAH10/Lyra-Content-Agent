import { describe, expect, it } from 'vitest';

import {
  buildGeneratePostPrompt,
  buildRegeneratePrompt,
} from '../src/services/ai.service';

describe('buildGeneratePostPrompt', () => {
  it('includes topic, tone, and format', () => {
    const prompt = buildGeneratePostPrompt('education in Africa', 'professional', 'short');
    expect(prompt).toContain('education in Africa');
    expect(prompt).toContain('professional');
    expect(prompt).toContain('short');
  });

  it('includes format-specific instructions for short format', () => {
    const prompt = buildGeneratePostPrompt('Test', 'casual', 'short');
    expect(prompt).toContain('2-3 short paragraphs');
  });

  it('includes format-specific instructions for long format', () => {
    const prompt = buildGeneratePostPrompt('Test', 'excited', 'long');
    expect(prompt).toContain('4-6 paragraphs');
  });

  it('includes format-specific instructions for bullet format', () => {
    const prompt = buildGeneratePostPrompt('Test', 'professional', 'bullet');
    expect(prompt).toContain('bullet points');
  });

  it('requests JSON with content, variations, improvements, relatedIdeas', () => {
    const prompt = buildGeneratePostPrompt('Test', 'professional', 'short');
    expect(prompt).toContain('"content"');
    expect(prompt).toContain('"variations"');
    expect(prompt).toContain('"improvements"');
    expect(prompt).toContain('"relatedIdeas"');
  });

  it('requests exactly 3 variations with Short, Professional, Engaging labels', () => {
    const prompt = buildGeneratePostPrompt('Test', 'casual', 'long');
    expect(prompt).toContain('"Short"');
    expect(prompt).toContain('"Professional"');
    expect(prompt).toContain('"Engaging"');
    expect(prompt).toContain('exactly 3');
  });
});

describe('buildRegeneratePrompt', () => {
  it('includes previous content wrapped in markers', () => {
    const prompt = buildRegeneratePrompt(
      'Old post content here',
      'education in Africa',
      'professional',
      'short',
    );
    expect(prompt).toContain('Old post content here');
    expect(prompt).toContain('"""');
    expect(prompt).toContain('Previous version');
  });

  it('includes additional instructions when provided', () => {
    const prompt = buildRegeneratePrompt(
      'Old content',
      'topic',
      'casual',
      'bullet',
      'Make it more engaging',
    );
    expect(prompt).toContain('Make it more engaging');
    expect(prompt).toContain('Additional user instructions');
  });

  it('works without additional instructions', () => {
    const prompt = buildRegeneratePrompt(
      'Old content',
      'topic',
      'excited',
      'long',
    );
    expect(prompt).not.toContain('Additional user instructions');
  });

  it('includes format-specific instructions', () => {
    const prompt = buildRegeneratePrompt('Old', 'topic', 'professional', 'bullet');
    expect(prompt).toContain('bullet points');
  });
});

import { describe, it, expect } from 'vitest';
import { slugify, generateSlug } from '@/lib/slug';

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld');
  });

  it('replaces spaces and underscores with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
    expect(slugify('hello_world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(slugify('@#$%')).toBe('');
  });

  it('handles unicode characters', () => {
    expect(slugify('你好世界')).toBe('你好世界');
  });
});

describe('generateSlug', () => {
  it('generates slug from latin title', () => {
    expect(generateSlug('Baihe Title')).toBe('baihe-title');
  });

  it('handles special characters in title', () => {
    expect(generateSlug('My Series @ 2024!')).toBe('my-series-2024');
  });
});
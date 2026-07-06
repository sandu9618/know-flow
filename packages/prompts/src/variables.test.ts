import { describe, expect, it } from 'vitest';

import { getUnfilledVariables, substituteVariables } from './variables.js';

describe('substituteVariables', () => {
  it('replaces placeholders with provided values', () => {
    const template = 'Hello {{name}}, welcome to {{place}}.';
    const values = { name: 'Ada', place: 'KnowFlow' };

    expect(substituteVariables(template, values)).toBe(
      'Hello Ada, welcome to KnowFlow.',
    );
  });

  it('leaves placeholders when a value is missing', () => {
    const template = 'Question: {{question}}';
    const values = {};

    expect(substituteVariables(template, values)).toBe(
      'Question: {{question}}',
    );
  });

  it('replaces every occurrence of the same placeholder', () => {
    const template = '{{text}} and again {{text}}';
    const values = { text: 'hello' };

    expect(substituteVariables(template, values)).toBe('hello and again hello');
  });

  it('replaces a placeholder with an empty string when the value is empty', () => {
    const template = 'Value: {{text}}';
    const values = { text: '' };

    expect(substituteVariables(template, values)).toBe('Value: ');
  });
});

describe('getUnfilledVariables', () => {
  it('returns names with missing values', () => {
    expect(getUnfilledVariables(['text', 'audience'], {})).toEqual([
      'text',
      'audience',
    ]);
  });

  it('returns names with empty or whitespace-only values', () => {
    expect(
      getUnfilledVariables(['text', 'audience'], {
        text: '',
        audience: '   ',
      }),
    ).toEqual(['text', 'audience']);
  });

  it('excludes names that have non-empty trimmed values', () => {
    expect(
      getUnfilledVariables(['text', 'audience'], {
        text: 'summary',
        audience: ' engineers ',
      }),
    ).toEqual([]);
  });

  it('returns only unfilled names from a mixed set', () => {
    expect(
      getUnfilledVariables(['text', 'audience', 'tone'], {
        text: 'article',
        audience: '',
      }),
    ).toEqual(['audience', 'tone']);
  });

  it('returns an empty array when variableNames is empty', () => {
    expect(getUnfilledVariables([], { text: 'value' })).toEqual([]);
  });
});

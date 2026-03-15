import { describe, it, expect } from 'vitest';
import { extractMessages, parseExportFile } from '../openai';

const SAMPLE_MAPPING = {
  'sys': {
    id: 'sys',
    parent: null,
    children: ['msg-1'],
    message: { author: { role: 'system' }, content: { parts: ['You are helpful.'] } },
  },
  'msg-1': {
    id: 'msg-1',
    parent: 'sys',
    children: ['msg-2'],
    message: { author: { role: 'user' }, content: { parts: ['Hello!'] } },
  },
  'msg-2': {
    id: 'msg-2',
    parent: 'msg-1',
    children: [],
    message: { author: { role: 'assistant' }, content: { parts: ['Hi there! How can I help?'] } },
  },
};

describe('extractMessages', () => {
  it('returns messages in order, skipping system', () => {
    const msgs = extractMessages(SAMPLE_MAPPING);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toEqual({ role: 'user', content: 'Hello!' });
    expect(msgs[1]).toEqual({ role: 'assistant', content: 'Hi there! How can I help?' });
  });

  it('returns empty array for null mapping', () => {
    expect(extractMessages(null)).toEqual([]);
  });

  it('skips messages with empty content', () => {
    const mapping = {
      root: { id: 'root', parent: null, children: ['empty'], message: { author: { role: 'system' }, content: { parts: [''] } } },
      empty: { id: 'empty', parent: 'root', children: [], message: { author: { role: 'user' }, content: { parts: ['  '] } } },
    };
    expect(extractMessages(mapping)).toEqual([]);
  });
});

describe('parseExportFile', () => {
  it('resolves with parsed conversations array', async () => {
    const data = [{ id: 'c1', title: 'Test', mapping: SAMPLE_MAPPING }];
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'conversations.json', { type: 'application/json' });

    const result = await parseExportFile(file);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });

  it('rejects if file is not an array', async () => {
    const blob = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
    const file = new File([blob], 'conversations.json');

    await expect(parseExportFile(file)).rejects.toThrow('Unexpected format');
  });

  it('rejects on invalid JSON', async () => {
    const blob = new Blob(['not json at all'], { type: 'application/json' });
    const file = new File([blob], 'conversations.json');

    await expect(parseExportFile(file)).rejects.toThrow('Could not parse file');
  });
});

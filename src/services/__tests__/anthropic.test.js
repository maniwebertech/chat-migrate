import { describe, it, expect } from 'vitest';
import { extractClaudeMessages, parseClaudeExportFile } from '../anthropic';

const SAMPLE_CLAUDE_MESSAGES = [
  { sender: 'human', text: 'What is Tailwind?' },
  { sender: 'assistant', text: 'Tailwind is a utility-first CSS framework.' },
  { sender: 'human', text: 'Can I use it with React?' },
  { sender: 'assistant', text: 'Yes, it works great with React.' },
];

describe('extractClaudeMessages', () => {
  it('maps sender human → user, assistant → assistant', () => {
    const msgs = extractClaudeMessages(SAMPLE_CLAUDE_MESSAGES);
    expect(msgs[0]).toEqual({ role: 'user', content: 'What is Tailwind?' });
    expect(msgs[1]).toEqual({ role: 'assistant', content: 'Tailwind is a utility-first CSS framework.' });
  });

  it('filters out empty messages', () => {
    const msgs = extractClaudeMessages([
      { sender: 'human', text: '   ' },
      { sender: 'assistant', text: 'Hello' },
    ]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe('assistant');
  });

  it('returns empty array for empty input', () => {
    expect(extractClaudeMessages([])).toEqual([]);
  });
});

describe('parseClaudeExportFile', () => {
  it('normalises Claude export to common shape', async () => {
    const data = [
      {
        uuid: 'abc-123',
        name: 'My Chat',
        created_at: '2024-01-15T10:00:00Z',
        chat_messages: SAMPLE_CLAUDE_MESSAGES,
      },
    ];
    const file = new File([JSON.stringify(data)], 'conversations.json');
    const result = await parseClaudeExportFile(file);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc-123');
    expect(result[0].title).toBe('My Chat');
    expect(result[0]._claudeMessages).toEqual(SAMPLE_CLAUDE_MESSAGES);
  });

  it('rejects if not an array', async () => {
    const file = new File([JSON.stringify({ oops: true })], 'conversations.json');
    await expect(parseClaudeExportFile(file)).rejects.toThrow('Unexpected format');
  });
});

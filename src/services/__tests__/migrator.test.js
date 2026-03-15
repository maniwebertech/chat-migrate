import { describe, it, expect, vi } from 'vitest';
import { runMigration } from '../migrator';

const SAMPLE_CHATS = [
  {
    id: 'c1',
    title: 'Python Help',
    mapping: {
      root: { id: 'root', parent: null, children: ['m1'], message: { author: { role: 'system' }, content: { parts: [''] } } },
      m1: { id: 'm1', parent: 'root', children: ['m2'], message: { author: { role: 'user' }, content: { parts: ['How do I use lists?'] } } },
      m2: { id: 'm2', parent: 'm1', children: [], message: { author: { role: 'assistant' }, content: { parts: ['Use square brackets: [1, 2, 3]'] } } },
    },
  },
];

describe('runMigration', () => {
  it('logs a warning and returns early when chats array is empty', async () => {
    const addLog = vi.fn();
    await runMigration({ chats: [], sourceProvider: 'chatgpt', targetKey: '', targetProvider: 'json', addLog });
    expect(addLog).toHaveBeenCalledWith('No chats selected.', 'warning');
  });

  it('logs success for json export target', async () => {
    const addLog = vi.fn();
    // Mock URL.createObjectURL / anchor click so no real download fires
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
    const anchor = { click: vi.fn(), href: '', download: '' };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);

    await runMigration({
      chats: SAMPLE_CHATS,
      sourceProvider: 'chatgpt',
      targetKey: '',
      targetProvider: 'json',
      addLog,
    });

    const successLogs = addLog.mock.calls.filter(([, type]) => type === 'success');
    expect(successLogs.length).toBeGreaterThan(0);
    expect(successLogs[0][0]).toContain('Python Help');
  });

  it('logs error when Claude API call fails', async () => {
    const addLog = vi.fn();
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await runMigration({
      chats: SAMPLE_CHATS,
      sourceProvider: 'chatgpt',
      targetKey: 'sk-ant-fake',
      targetProvider: 'claude',
      addLog,
    });

    const errorLogs = addLog.mock.calls.filter(([, type]) => type === 'error');
    expect(errorLogs.length).toBeGreaterThan(0);
    expect(errorLogs[0][0]).toContain('Python Help');
  });
});

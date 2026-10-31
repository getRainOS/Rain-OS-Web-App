import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import CitationMonitor from '../pages/CitationMonitor.jsx';

vi.mock('../api/client.js', () => {
  const calls = { citationCheck: vi.fn(), citationHistory: vi.fn(() => Promise.resolve({ data: [] })) };
  return {
    api: new Proxy(calls, {
      get: (target, key) => (key in target ? target[key] : vi.fn(() => Promise.resolve({ data: [] }))),
    }),
  };
});

// The subject picker lists analysed sites; the test chooses one directly.
vi.mock('../components/SubjectPicker.jsx', async () => {
  const React = await import('react');
  return {
    default: ({ onChange }) => React.createElement('button', {
      type: 'button',
      onClick: () => onChange({ key: 'site:acme.com', website: 'acme.com', name: 'Acme Widgets', lookFor: 'Acme Widgets', type: 'site' }),
    }, 'Pick Acme'),
  };
});
vi.mock('../components/RecentPicker.jsx', () => ({ default: () => null }));

function renderPanel() {
  const value = {
    user: { email: 'owner@example.com', usage: { limit: 100, count: 0 } },
    userLane: 'general',
    setUser: vi.fn(),
    refreshUser: vi.fn(),
    onLogout: vi.fn(),
  };
  return render(
    <AppContext.Provider value={value}>
      <MemoryRouter>
        <CitationMonitor />
      </MemoryRouter>
    </AppContext.Provider>
  );
}

function fillForm(topic) {
  fireEvent.change(screen.getByPlaceholderText(/What would a customer ask AI/), { target: { value: topic } });
}

const runButton = () => screen.getByRole('button', { name: /Check citations|Checking/ });

describe('Citation Monitor panel', () => {
  beforeEach(() => {
    api.citationCheck.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('keeps the check button off until there is a question and a subject', () => {
    renderPanel();
    expect(runButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    expect(runButton().disabled).toBe(true);

    fillForm('best roof repair near me');
    expect(runButton().disabled).toBe(false);
  });

  it('sends the question and subject for the citation check', async () => {
    api.citationCheck.mockResolvedValue({ data: { cited: true, answerExcerpt: 'Acme is cited.', sources: [] } });
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    fillForm('best roof repair');
    fireEvent.click(runButton());

    await waitFor(() => expect(api.citationCheck).toHaveBeenCalledWith(expect.objectContaining({
      topic: 'best roof repair',
      subject: 'site:acme.com',
    })));
  });

  it('shows the error when the citation check fails', async () => {
    api.citationCheck.mockRejectedValue(new Error('Citation check failed on our side'));
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    fillForm('best roof repair');
    fireEvent.click(runButton());

    expect(await screen.findByText('Citation check failed on our side')).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import BrandVisibility from '../pages/BrandVisibility.jsx';

vi.mock('../api/client.js', () => {
  const calls = { brandVisibility: vi.fn(), brandVisHistory: vi.fn(() => Promise.resolve({ data: [] })) };
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
        <BrandVisibility />
      </MemoryRouter>
    </AppContext.Provider>
  );
}

function fillForm(analysisName, topic) {
  fireEvent.change(screen.getByPlaceholderText('e.g. Acme Roofing brand check'), { target: { value: analysisName } });
  fireEvent.change(screen.getByPlaceholderText('e.g. AI content optimization tools'), { target: { value: topic } });
}

const runButton = () => screen.getByRole('button', { name: /Check brand sentiment|Checking AI answers/ });

describe('Brand Sentiment panel', () => {
  beforeEach(() => {
    api.brandVisibility.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('does not run a check until a subject is chosen', () => {
    renderPanel();
    fillForm('Acme check', 'AI roofing tips');

    fireEvent.click(runButton());

    expect(api.brandVisibility).not.toHaveBeenCalled();
  });

  it('sends the chosen brand, question and subject, then shows the result', async () => {
    api.brandVisibility.mockResolvedValue({
      data: { answerExcerpt: 'Acme Widgets is a trusted roofer.', mentioned: true, sources: [], recommendations: [] },
    });
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    fillForm('Acme check', 'AI roofing tips');
    fireEvent.click(runButton());

    await waitFor(() => expect(api.brandVisibility).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Acme check',
      brand: 'Acme Widgets',
      topic: 'AI roofing tips',
      subject: 'site:acme.com',
    })));
    expect((await screen.findAllByText('Summary')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('What AI said').length).toBeGreaterThan(0);
  });

  it('explains the plan limit when the check is not included in the user plan', async () => {
    api.brandVisibility.mockRejectedValue(Object.assign(new Error('Plan required'), { status: 403 }));
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    fillForm('Acme check', 'AI roofing tips');
    fireEvent.click(runButton());

    expect(await screen.findByText('Business plan required')).toBeTruthy();
  });

  it('shows the error when the check fails for another reason', async () => {
    api.brandVisibility.mockRejectedValue(new Error('Brand check failed on our side'));
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Acme' }));
    fillForm('Acme check', 'AI roofing tips');
    fireEvent.click(runButton());

    expect(await screen.findByText('Brand check failed on our side')).toBeTruthy();
  });
});

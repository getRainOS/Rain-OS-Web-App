import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import Dashboard from '../pages/Dashboard.jsx';

// The dashboard loads several lists on mount. Each is answered with an empty
// list unless a test sets history itself.
vi.mock('../api/client.js', () => {
  const calls = { history: vi.fn() };
  return {
    api: new Proxy(calls, {
      get: (target, key) => (key in target ? target[key] : vi.fn(() => Promise.resolve({ data: [] }))),
    }),
  };
});

// The charts measure their container, which jsdom does not do.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Charts and maps are not under test here.
vi.mock('../components/ScoreDonut.jsx', () => ({ default: () => null }));
vi.mock('../components/NewAnalysisMenu.jsx', () => ({ default: () => null }));
vi.mock('../components/CitationMapCard.jsx', () => ({ default: () => null }));
vi.mock('../components/MapsGridCard.jsx', () => ({ default: () => null }));
vi.mock('../components/AnswerSourcesCard.jsx', () => ({ default: () => null }));

function renderDashboard() {
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
        <Dashboard />
      </MemoryRouter>
    </AppContext.Provider>
  );
}

const ANALYSIS = {
  id: 'analysis-1',
  url: 'https://acme.com/',
  title: 'Acme home page',
  overall_score: 64,
  lane: 'general',
  created_at: new Date().toISOString(),
};

describe('Dashboard', () => {
  beforeEach(() => {
    api.history.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows the first-run prompt with a link to Full Check when there are no analyses', async () => {
    api.history.mockResolvedValue({ data: [] });
    renderDashboard();

    expect(await screen.findByText('No analyses yet')).toBeTruthy();
    // The chart and the analyses list each show the prompt.
    const links = screen.getAllByRole('link', { name: /Check my website/ });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link.getAttribute('href')).toBe('/full-check');
  });

  it('lists recent analyses with their titles and scores', async () => {
    api.history.mockResolvedValue({ data: [ANALYSIS] });
    renderDashboard();

    expect((await screen.findAllByText('Acme home page')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('64').length).toBeGreaterThan(0);
    expect(screen.queryByText('No analyses yet')).toBeNull();
  });

  it('falls back to the first-run prompt when the history cannot be loaded', async () => {
    api.history.mockRejectedValue(new Error('Server unavailable'));
    renderDashboard();

    expect(await screen.findByText('No analyses yet')).toBeTruthy();
  });

  it('asks for history for the signed-in lane', async () => {
    api.history.mockResolvedValue({ data: [] });
    renderDashboard();

    await screen.findByText('No analyses yet');
    expect(api.history).toHaveBeenCalledWith(expect.objectContaining({ lane: 'general' }));
  });
});

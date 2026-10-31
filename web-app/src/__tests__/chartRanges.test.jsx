import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import Dashboard from '../pages/Dashboard.jsx';

vi.mock('../api/client.js', () => {
  const calls = { history: vi.fn() };
  return {
    api: new Proxy(calls, {
      get: (target, key) => (key in target ? target[key] : vi.fn(() => Promise.resolve({ data: [] }))),
    }),
  };
});

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

// Analyses of one site, newest first, for the trend chart.
function analysesOf(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `analysis-${i}`,
    url: `https://acme.com/page-${i}`,
    title: `Acme page ${i}`,
    brand: 'Acme Widgets',
    overall_score: 40 + i,
    lane: 'general',
    analyzed_at: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}


function rangeButton(n) {
  return screen.getByRole('button', { name: String(n) });
}

describe('Dashboard trend chart', () => {
  beforeEach(() => {
    api.history.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('asks for one more analysis when there is only one, without blaming the filters', async () => {
    api.history.mockResolvedValue({ data: analysesOf(1) });
    renderDashboard();

    expect(await screen.findByText('Run one more analysis to see your trend here')).toBeTruthy();
    expect(screen.queryByText('No analyses match these filters')).toBeNull();
    expect(screen.queryByRole('button', { name: /Clear filters/ })).toBeNull();
  });

  it('asks for a first analysis when there are none', async () => {
    api.history.mockResolvedValue({ data: [] });
    renderDashboard();

    expect(await screen.findByText('Run your first analysis to see trends here')).toBeTruthy();
  });

  it('draws the trend once there are at least two analyses', async () => {
    api.history.mockResolvedValue({ data: analysesOf(3) });
    renderDashboard();

    await screen.findAllByRole('heading', { name: 'Score Trend' });
    expect(screen.queryByText('Run your first analysis to see trends here')).toBeNull();
  });

  it('offers 7, 14 and 30 day ranges, with 14 selected by default', async () => {
    api.history.mockResolvedValue({ data: analysesOf(3) });
    renderDashboard();

    await screen.findAllByRole('heading', { name: 'Score Trend' });
    expect(rangeButton(7)).toBeTruthy();
    expect(rangeButton(14)).toBeTruthy();
    expect(rangeButton(30)).toBeTruthy();
    expect(rangeButton(14).className).toContain('rangeBtnActive');
    expect(rangeButton(7).className).not.toContain('rangeBtnActive');
    expect(screen.getByText('Last 14 analyses')).toBeTruthy();
  });

  it('changes the range when a different one is picked', async () => {
    api.history.mockResolvedValue({ data: analysesOf(3) });
    renderDashboard();

    await screen.findAllByRole('heading', { name: 'Score Trend' });
    fireEvent.click(rangeButton(7));

    expect(screen.getByText('Last 7 analyses')).toBeTruthy();
    expect(rangeButton(7).className).toContain('rangeBtnActive');
    expect(rangeButton(14).className).not.toContain('rangeBtnActive');
  });

  it('keeps the chosen range when the subtitle is read after switching to 30 days', async () => {
    api.history.mockResolvedValue({ data: analysesOf(3) });
    renderDashboard();

    await screen.findAllByRole('heading', { name: 'Score Trend' });
    fireEvent.click(rangeButton(30));

    expect(screen.getByText('Last 30 analyses')).toBeTruthy();
    expect(rangeButton(30).className).toContain('rangeBtnActive');
  });
});

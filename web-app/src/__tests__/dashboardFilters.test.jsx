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

const URL_ANALYSIS = {
  id: 'analysis-url',
  url: 'https://acme.com/',
  title: 'Acme home page',
  overall_score: 64,
  lane: 'general',
  created_at: new Date().toISOString(),
};

const REPO_ANALYSIS = {
  id: 'analysis-repo',
  repo: 'acme/widgets',
  title: 'Widgets README',
  overall_score: 58,
  lane: 'general',
  created_at: new Date().toISOString(),
};

// The subject picker also shows the selected analysis's name, so only matches
// outside a dropdown count as rows in the recent list.
function listRows(title) {
  return screen.queryAllByText(title).filter(el => !el.closest('[role="combobox"]'));
}

// Opens the "Filter recent analyses by type" menu and picks an option.
function chooseRecentType(optionName) {
  fireEvent.click(screen.getByRole('combobox', { name: 'Filter recent analyses by type' }));
  const listbox = screen.getByRole('listbox');
  fireEvent.click(within(listbox).getByRole('option', { name: new RegExp(`^${optionName}`) }));
}

describe('Dashboard filters', () => {
  beforeEach(() => {
    api.history.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows only analyses of the chosen type in the recent list', async () => {
    api.history.mockResolvedValue({ data: [URL_ANALYSIS, REPO_ANALYSIS] });
    renderDashboard();

    expect((await screen.findAllByText('Acme home page')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Widgets README')).length).toBeGreaterThan(0);

    chooseRecentType('Repo');

    expect(listRows('Acme home page')).toHaveLength(0);
    expect(listRows('Widgets README').length).toBeGreaterThan(0);
  });

  it('says so when the chosen type has no analyses', async () => {
    api.history.mockResolvedValue({ data: [URL_ANALYSIS] });
    renderDashboard();

    await screen.findAllByText('Acme home page');
    chooseRecentType('Repo');

    expect(screen.getByText('No repo analyses yet.')).toBeTruthy();
  });

  it('brings every analysis back when the type is set to all again', async () => {
    api.history.mockResolvedValue({ data: [URL_ANALYSIS, REPO_ANALYSIS] });
    renderDashboard();

    await screen.findAllByText('Acme home page');
    chooseRecentType('Repo');
    expect(listRows('Acme home page')).toHaveLength(0);

    chooseRecentType('All recent analyses');

    expect(listRows('Acme home page').length).toBeGreaterThan(0);
    expect(listRows('Widgets README').length).toBeGreaterThan(0);
  });
});

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

const ACME = {
  id: 'analysis-acme',
  url: 'https://acme.com/',
  title: 'Acme home page',
  brand: 'Acme Widgets',
  ai_readability: 70,
  digital_authority: 60,
  conversion_readiness: 50,
  product_discoverability: 40,
  rag_readiness: 30,
  local_presence: 20,
  overall_score: 64,
  lane: 'general',
  analyzed_at: new Date().toISOString(),
};

const BETA = {
  id: 'analysis-beta',
  url: 'https://beta.com/',
  title: 'Beta home page',
  brand: 'Beta Plumbing',
  ai_readability: 70,
  digital_authority: 60,
  conversion_readiness: 50,
  product_discoverability: 40,
  rag_readiness: 30,
  local_presence: 20,
  overall_score: 51,
  lane: 'general',
  analyzed_at: new Date(Date.now() - 86400000).toISOString(),
};

// The Pillar Breakdown heading names the analysis the picker has selected.
function pillarHeading(title) {
  return screen.queryAllByRole('heading', { name: title });
}

const SUBJECT_PICKER = 'What the dashboard shows';

function subjectPicker() {
  return screen.getByRole('combobox', { name: SUBJECT_PICKER });
}

function chooseSubject(name) {
  fireEvent.click(subjectPicker());
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: new RegExp(`^${name}`) }));
}

describe('Dashboard subject picker', () => {
  beforeEach(() => {
    api.history.mockReset();
    api.history.mockResolvedValue({ data: [ACME, BETA] });
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('offers each analysed website by its brand name', async () => {
    renderDashboard();
    await screen.findAllByText('Acme home page');

    fireEvent.click(subjectPicker());
    const names = within(screen.getByRole('listbox')).getAllByRole('option').map(o => o.textContent);

    expect(names.some(n => n.startsWith('Acme Widgets'))).toBe(true);
    expect(names.some(n => n.startsWith('Beta Plumbing'))).toBe(true);
  });

  it('selects the most recent subject by default and shows its pillar breakdown', async () => {
    renderDashboard();

    expect((await screen.findAllByRole('heading', { name: 'Acme home page' })).length).toBeGreaterThan(0);
    expect(subjectPicker().textContent).toContain('Acme Widgets');
    expect(pillarHeading('Beta home page')).toHaveLength(0);
  });

  it('switches the pillar breakdown to another subject and remembers the choice', async () => {
    renderDashboard();
    await screen.findAllByRole('heading', { name: 'Acme home page' });

    chooseSubject('Beta Plumbing');

    expect((await screen.findAllByRole('heading', { name: 'Beta home page' })).length).toBeGreaterThan(0);
    expect(pillarHeading('Acme home page')).toHaveLength(0);
    expect(localStorage.getItem('rain_os_subject')).toBe('site:beta.com');
  });

  it('opens on the subject chosen last time', async () => {
    localStorage.setItem('rain_os_subject', 'site:beta.com');
    renderDashboard();

    expect((await screen.findAllByRole('heading', { name: 'Beta home page' })).length).toBeGreaterThan(0);
    expect(subjectPicker().textContent).toContain('Beta Plumbing');
  });

  it('keeps Recent Analyses listing every subject', async () => {
    renderDashboard();
    await screen.findAllByRole('heading', { name: 'Acme home page' });

    chooseSubject('Beta Plumbing');
    await screen.findAllByRole('heading', { name: 'Beta home page' });

    expect(screen.getAllByText('Acme home page').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta home page').length).toBeGreaterThan(0);
  });
});

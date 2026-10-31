import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import FullCheck from '../pages/FullCheck.jsx';

// Every API call the flow makes goes through this mock. Anything the page
// calls on load that is not listed here gets an empty list.
vi.mock('../api/client.js', () => {
  const calls = {
    suggestPrompts: vi.fn(),
    scanUrl: vi.fn(),
    citationCheck: vi.fn(),
    shareOfVoice: vi.fn(),
    brandVisibility: vi.fn(),
  };
  return {
    api: new Proxy(calls, {
      get: (target, key) => (key in target ? target[key] : vi.fn(() => Promise.resolve({ data: [] }))),
    }),
  };
});

// The subject picker loads the user's analysed sites; it is not under test.
vi.mock('../components/SubjectPicker.jsx', () => ({ default: () => null }));

const QUESTIONS = [
  'Who sells the best widgets for small shops?',
  'How much do widgets cost in Austin?',
  'Are widgets worth buying for a home office?',
  'Which widget brand is most trusted?',
];

function renderFullCheck({ site = 'https://acme.com', usage = { limit: 100, count: 10 } } = {}) {
  const value = {
    user: { email: 'owner@example.com', usage },
    userLane: 'general',
    setUser: vi.fn(),
    refreshUser: vi.fn(),
    onLogout: vi.fn(),
  };
  const entry = `/full-check?url=${encodeURIComponent(site)}&brand=Acme`;
  return render(
    <AppContext.Provider value={value}>
      <MemoryRouter initialEntries={[entry]}>
        <FullCheck />
      </MemoryRouter>
    </AppContext.Provider>
  );
}

function mockSuccessfulRun() {
  api.suggestPrompts.mockResolvedValue({ data: { suggestions: QUESTIONS.map(question => ({ question })) } });
  api.scanUrl.mockResolvedValue({ data: { overallScore: 72, technical_recommendations: [] } });
  api.citationCheck.mockResolvedValue({ data: { cited: false, sources: [] } });
  api.shareOfVoice.mockResolvedValue({ data: { mentionedCount: 1 } });
  api.brandVisibility.mockResolvedValue({ data: { mentioned: true } });
}

async function reachQuestions() {
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  await screen.findByRole('button', { name: new RegExp(QUESTIONS[0].slice(0, 20)) });
}

describe('Full check flow', () => {
  beforeEach(() => {
    for (const fn of Object.values(api)) {
      if (typeof fn?.mockReset === 'function') fn.mockReset();
    }
  });
  afterEach(() => {
    cleanup();
  });

  it('finds questions, runs the full check and shows the report with its total cost', async () => {
    mockSuccessfulRun();
    renderFullCheck();

    await reachQuestions();
    expect(api.suggestPrompts).toHaveBeenCalledWith({ url: 'https://acme.com', lane: 'general' });

    fireEvent.click(screen.getByRole('button', { name: /Run full check/ }));

    expect(await screen.findByText(/analyses used/)).toBeTruthy();
    expect(screen.getByText('acme.com')).toBeTruthy();

    expect(api.scanUrl).toHaveBeenCalledWith('https://acme.com', expect.anything());
    // Full plan picks 3 questions by default.
    expect(api.citationCheck).toHaveBeenCalledTimes(3);
    expect(api.shareOfVoice).toHaveBeenCalledTimes(1);
    expect(api.brandVisibility).toHaveBeenCalledTimes(1);
    // Scan 1 + 3 questions + Share of Voice 3 + Brand Sentiment 1 = 8.
    expect(screen.getByText('8 analyses used')).toBeTruthy();
  });

  it('blocks the run when the plan costs more analyses than the user has left', async () => {
    mockSuccessfulRun();
    renderFullCheck({ usage: { limit: 100, count: 97 } });

    await reachQuestions();

    expect(screen.getByText(/That needs 8 analyses and you have 3/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Run full check/ }).disabled).toBe(true);
    expect(api.scanUrl).not.toHaveBeenCalled();
  });

  it('lets the user type their own question when suggestions fail', async () => {
    api.suggestPrompts.mockRejectedValue(new Error('Suggestions are busy right now.'));
    renderFullCheck();

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(await screen.findByText(/Suggestions are busy right now\. You can type your own question below\./)).toBeTruthy();
    expect(screen.getByPlaceholderText('Or type a question your customers ask')).toBeTruthy();
  });

  it('refuses a shared platform such as YouTube before looking for questions', () => {
    renderFullCheck({ site: 'https://www.youtube.com/@acmewidgets' });

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(screen.getByText(/which many businesses share/)).toBeTruthy();
    expect(api.suggestPrompts).not.toHaveBeenCalled();
  });

  it('still shows the report when the page scan fails, and says which part did not run', async () => {
    mockSuccessfulRun();
    api.scanUrl.mockRejectedValue(new Error('Scanner unavailable'));
    renderFullCheck();

    await reachQuestions();
    fireEvent.click(screen.getByRole('button', { name: /Run full check/ }));

    expect(await screen.findByText(/The page scan didn/)).toBeTruthy();
    expect(screen.getByText(/analyses used/)).toBeTruthy();
    await waitFor(() => expect(api.brandVisibility).toHaveBeenCalled());
  });
});

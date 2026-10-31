import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import UrlScanner from '../pages/UrlScanner.jsx';

// The scanner calls the API for its own check. Any other call the page makes
// on load gets an empty list, so the page renders without a backend.
vi.mock('../api/client.js', () => {
  const scanUrl = vi.fn();
  return {
    api: new Proxy({ scanUrl }, {
      get: (target, key) => (key in target ? target[key] : vi.fn(() => Promise.resolve({ data: [] }))),
    }),
  };
});

// Child panels that load their own data are not part of this test.
vi.mock('../components/PastAnalyses.jsx', () => ({ default: () => null }));
vi.mock('../components/ListingCheck.jsx', () => ({ default: () => null }));
vi.mock('../components/MapsGridCard.jsx', () => ({ default: () => null }));
vi.mock('../components/BrandNameLine.jsx', () => ({ default: () => null }));
vi.mock('../components/ProductPageCheck.jsx', () => ({ default: () => null }));
vi.mock('../components/LocalPageCheck.jsx', () => ({ default: () => null, LocalSteps: () => null }));
vi.mock('../components/PillarScores.jsx', () => ({ default: () => null }));
vi.mock('../components/ArtifactBlock.jsx', () => ({ default: () => null }));
vi.mock('../components/CitationCrossPromo.jsx', () => ({ default: () => null }));
vi.mock('../components/GithubPushPanel.jsx', () => ({ default: () => null }));
vi.mock('../components/RecentPicker.jsx', () => ({ default: () => null }));

const URL_PLACEHOLDER = 'https://yourstore.com/product';

function renderScanner() {
  const value = {
    user: { email: 'owner@example.com' },
    userLane: 'general',
    setUser: vi.fn(),
    refreshUser: vi.fn(),
    onLogout: vi.fn(),
  };
  return render(
    <AppContext.Provider value={value}>
      <MemoryRouter>
        <UrlScanner />
      </MemoryRouter>
    </AppContext.Provider>
  );
}

function scanButton() {
  return screen.getByRole('button', { name: /Scan URL|Scanning/ });
}

describe('running a URL check', () => {
  beforeEach(() => {
    api.scanUrl.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('keeps the scan button disabled until a URL is entered', () => {
    renderScanner();
    expect(scanButton().disabled).toBe(true);
  });

  it('sends the entered site to the scanner and runs it for the lane', () => {
    api.scanUrl.mockReturnValue(new Promise(() => {}));
    renderScanner();

    fireEvent.change(screen.getByPlaceholderText(URL_PLACEHOLDER), { target: { value: 'acme.com' } });
    expect(scanButton().disabled).toBe(false);
    fireEvent.click(scanButton());

    expect(api.scanUrl).toHaveBeenCalledWith(
      'https://acme.com',
      expect.objectContaining({ module: 'general' })
    );
  });

  it('shows scanning and blocks a second run while the check is in progress', () => {
    api.scanUrl.mockReturnValue(new Promise(() => {}));
    renderScanner();

    fireEvent.change(screen.getByPlaceholderText(URL_PLACEHOLDER), { target: { value: 'acme.com' } });
    fireEvent.click(scanButton());

    expect(screen.getByRole('button', { name: /Scanning/ }).disabled).toBe(true);
  });

  it('shows the error message when the check fails', async () => {
    api.scanUrl.mockRejectedValue(new Error('That site could not be reached'));
    renderScanner();

    fireEvent.change(screen.getByPlaceholderText(URL_PLACEHOLDER), { target: { value: 'acme.com' } });
    fireEvent.click(scanButton());

    expect(await screen.findByText('That site could not be reached')).toBeTruthy();
    expect(scanButton().disabled).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { supabase } from '../lib/supabase.js';
import AuthModal from '../components/AuthModal.jsx';

// Supabase handles the password; the backend sync is a plain fetch. Both are
// replaced so the tests see only what the modal does with the results.
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

const SESSION_USER = { id: 'user-1', email: 'owner@example.com' };

function renderModal(props = {}) {
  const onAuth = vi.fn();
  const utils = render(<AuthModal onAuth={onAuth} onBack={() => {}} {...props} />);
  return { ...utils, onAuth };
}

function fill(container, email, password) {
  fireEvent.change(container.querySelector('input[type="email"], input[placeholder="you@example.com"]'), { target: { value: email } });
  const pw = container.querySelector('input[type="password"]');
  if (pw) fireEvent.change(pw, { target: { value: password } });
}

function submit(container) {
  fireEvent.submit(container.querySelector('form'));
}

describe('AuthModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'rain_os_test_key', email: SESSION_USER.email }),
    })));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('does not contact Supabase until both email and password are entered', () => {
    const { container } = renderModal();
    fill(container, '', '');
    submit(container);
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('signs up, syncs the account and passes the API key on when Supabase returns a session', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { session: { access_token: 'token-123' }, user: SESSION_USER },
      error: null,
    });
    const { container, onAuth } = renderModal();

    fill(container, '  owner@example.com ', 'a-long-password');
    submit(container);

    await waitFor(() => expect(onAuth).toHaveBeenCalledWith('rain_os_test_key', expect.anything()));
    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'owner@example.com', password: 'a-long-password' });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/sync'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token-123' }) })
    );
  });

  it('asks a new user to confirm their email, then moves them to sign in', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { session: null, user: SESSION_USER }, error: null });
    const { container, onAuth } = renderModal();

    fill(container, 'owner@example.com', 'a-long-password');
    submit(container);

    expect(await screen.findByText('Check your email to confirm your account, then log in.')).toBeTruthy();
    expect(onAuth).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign in' }).getAttribute('type')).toBe('submit');
  });

  it('shows the sign-up error from Supabase and does not sign the user in', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: null, error: new Error('Password should be at least 6 characters.') });
    const { container, onAuth } = renderModal();

    fill(container, 'owner@example.com', 'short');
    submit(container);

    expect(await screen.findByText('Password should be at least 6 characters.')).toBeTruthy();
    expect(onAuth).not.toHaveBeenCalled();
  });

  it('signs in with a password and passes the API key on', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-456' }, user: SESSION_USER },
      error: null,
    });
    const { container, onAuth } = renderModal({ initialMode: 'login' });

    fill(container, 'owner@example.com', 'correct-password');
    submit(container);

    await waitFor(() => expect(onAuth).toHaveBeenCalledWith('rain_os_test_key', expect.anything()));
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'owner@example.com', password: 'correct-password' });
  });

  it('shows an error and stays signed out when the password is wrong', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: new Error('Invalid login credentials') });
    const { container, onAuth } = renderModal({ initialMode: 'login' });

    fill(container, 'owner@example.com', 'wrong');
    submit(container);

    expect(await screen.findByText('Invalid login credentials')).toBeTruthy();
    expect(onAuth).not.toHaveBeenCalled();
  });

  it('shows the backend error when the account sync fails after a good sign-in', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-789' }, user: SESSION_USER },
      error: null,
    });
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Account is suspended.' }),
    });
    const { container, onAuth } = renderModal({ initialMode: 'login' });

    fill(container, 'owner@example.com', 'correct-password');
    submit(container);

    expect(await screen.findByText('Account is suspended.')).toBeTruthy();
    expect(onAuth).not.toHaveBeenCalled();
  });

  it('sends a password reset email back to the app', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const { container } = renderModal({ initialMode: 'login' });

    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    fill(container, 'owner@example.com', '');
    submit(container);

    expect(await screen.findByText('Password reset email sent. Check your inbox.')).toBeTruthy();
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'owner@example.com',
      expect.objectContaining({ redirectTo: expect.stringMatching(/\/auth\/callback$/) })
    );
  });
});

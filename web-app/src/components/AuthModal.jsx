import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { setApiKey, api } from '../api/client.js';
import { DEMO_KEY, DEMO_USER } from '../demo/demoData.js';
import styles from './AuthModal.module.css';

const BASE_API = 'https://api.getrainos.com';

async function syncWithBackend(accessToken) {
  const res = await fetch(`${BASE_API}/api/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to sync account. Please try again.');
  }
  return res.json();
}

export default function AuthModal({ onAuth, onBack, initialMode = 'signup', pendingContent }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleDemo() {
    setApiKey(DEMO_KEY);
    onAuth(DEMO_KEY, DEMO_USER);
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({ email: email.trim(), password });
        if (result.error) throw result.error;
        if (result.data.session) {
          await finishAuth(result.data.session.access_token, result.data.user);
        } else {
          setMessage('Check your email to confirm your account, then log in.');
          setMode('login');
        }
      } else if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error) throw result.error;
        await finishAuth(result.data.session.access_token, result.data.user);
      } else if (mode === 'reset') {
        result = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (result.error) throw result.error;
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  async function finishAuth(accessToken, supabaseUser) {
    const userData = await syncWithBackend(accessToken);
    setApiKey(userData.apiKey);
    onAuth(userData.apiKey, userData);
  }

  const isReset = mode === 'reset';
  const isSignup = mode === 'signup';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.logo}>
          <span className={styles.logoRain}>rain</span>
          <span className={styles.logoOS}> OS</span>
        </div>

        <h1 className={styles.title}>
          {isReset ? 'Reset your password' : isSignup ? 'Start for free' : 'Welcome back'}
        </h1>
        <p className={styles.sub}>
          {isReset
            ? "Enter your email and we'll send a reset link"
            : isSignup
            ? '5 free analyses — no credit card needed'
            : 'Sign in to your Rain OS account'}
        </p>

        {!isReset && (
          <>
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <span className="spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <div className={styles.divider}><span>or</span></div>
          </>
        )}

        <form onSubmit={handleEmailAuth} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="auth-email" className={styles.label}>Email</label>
            <input
              id="auth-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              required
            />
          </div>

          {!isReset && (
            <div className={styles.field}>
              <label htmlFor="auth-password" className={styles.label}>Password</label>
              <input
                id="auth-password"
                type="password"
                className={styles.input}
                placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                minLength={isSignup ? 8 : undefined}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || googleLoading}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {loading
              ? 'Please wait…'
              : isReset
              ? 'Send reset link'
              : isSignup
              ? 'Create account'
              : 'Sign in'}
          </button>
        </form>

        <div className={styles.footer}>
          {isReset ? (
            <button type="button" className={styles.switchBtn} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
              ← Back to sign in
            </button>
          ) : (
            <>
              {!isSignup && (
                <button type="button" className={styles.switchBtn} onClick={() => { setMode('reset'); setError(''); setMessage(''); }}>
                  Forgot password?
                </button>
              )}
              <span className={styles.switchText}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setMessage(''); }}
                >
                  {isSignup ? 'Sign in' : 'Sign up free'}
                </button>
              </span>
            </>
          )}
        </div>

        <div className={styles.demoDivider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={styles.demoBtn}
          onClick={handleDemo}
          disabled={loading || googleLoading}
        >
          Try Demo — no account needed
        </button>

        {onBack && (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← Back to home
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './AuthGate.module.css';

const BASE_API = 'https://api.getrainos.com';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This confirmation link is missing its token. Please use the link from your email exactly as sent.');
      return;
    }

    fetch(`${BASE_API}/api/auth/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Confirmation failed.');
        }
        setStatus('success');
        setMessage(data.message || 'Email confirmed. You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'This link is invalid or has already been used.');
      });
  }, [token]);

  return (
    <div className={styles.root}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>rain</span>
          <span className={styles.logoOS}> OS</span>
        </div>

        {status === 'loading' && (
          <>
            <h1 className={styles.title}>Confirming your email…</h1>
            <p className={styles.sub}>Just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className={styles.title}>Email confirmed</h1>
            <p className={styles.sub}>{message}</p>
            <a href="https://app.getrainos.com" className={`btn btn-primary ${styles.submitBtn}`} style={{ display: 'inline-flex' }}>
              Continue to log in
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className={styles.title}>Confirmation failed</h1>
            <p className={styles.error}>{message}</p>
            <p className={styles.footer}>
              Need a new link? Contact{' '}
              <a href="mailto:support@getrainos.com" className={styles.link}>support@getrainos.com</a>
            </p>
          </>
        )}

        <Link to="/" className={styles.backBtn}>← Back to home</Link>
      </div>
    </div>
  );
}

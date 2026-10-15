import { Component } from 'react';

// Without this, any render error unmounts the whole app and leaves a blank
// black screen. Show a way out instead.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ui] render error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24, color: 'var(--text, #f5f5f5)', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>Something went wrong on this page</h2>
          <p style={{ color: 'var(--text-muted, #999)', fontSize: 14, margin: '0 0 16px' }}>
            Your data is safe. Reload to try again, or go back to the dashboard.
          </p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '8px 16px', marginRight: 8, borderRadius: 6, border: 0, background: '#f5f5f5', color: '#0d0d0d', fontWeight: 600, cursor: 'pointer' }}>Reload</button>
          <a href="/dashboard" style={{ color: 'inherit', fontSize: 14 }}>Dashboard</a>
        </div>
      </div>
    );
  }
}

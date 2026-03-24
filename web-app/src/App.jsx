import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getApiKey, api, isDemo as checkDemo } from './api/client.js';
import AuthGate from './pages/AuthGate.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentAnalyzer from './pages/ContentAnalyzer.jsx';
import UrlScanner from './pages/UrlScanner.jsx';
import History from './pages/History.jsx';
import Upgrade from './pages/Upgrade.jsx';
import Settings from './pages/Settings.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));

export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [apiKey, setApiKeyState] = useState(getApiKey);
  const [user, setUser] = useState(null);
  const isDemo = apiKey === '__demo__';

  function onAuth(key, userData) {
    setApiKeyState(key);
    setUser(userData);
  }

  function onLogout() {
    setApiKeyState('');
    setUser(null);
  }

  function refreshUser() {
    if (checkDemo()) return;
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }

  return (
    <AppContext.Provider value={{ apiKey, user, setUser, onLogout, refreshUser, isDemo }}>
      <HashRouter>
        <AppRoutes apiKey={apiKey} onAuth={onAuth} onLogout={onLogout} refreshUser={refreshUser} />
      </HashRouter>
    </AppContext.Provider>
  );
}

function AuthGateRoute({ onAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pending = location.state || {};

  return (
    <AuthGate
      onAuth={(key, userData) => {
        onAuth(key, userData);
        if (pending.pendingContent) {
          navigate('/analyze', {
            replace: true,
            state: { pendingContent: pending.pendingContent },
          });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }}
      onBack={() => navigate('/')}
    />
  );
}

function AppRoutes({ apiKey, onAuth }) {
  const navigate = useNavigate();

  if (!apiKey) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ background: '#020410' }}>
          <div className="spinner" />
        </div>
      }>
        <Routes>
          <Route
            path="/"
            element={
              <LandingWrapper>
                <LandingPage
                  onAnalyze={(content) => navigate('/login', { state: { pendingContent: content } })}
                  onLoginClick={() => navigate('/login')}
                />
              </LandingWrapper>
            }
          />
          <Route
            path="/login"
            element={<AuthGateRoute onAuth={onAuth} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<ContentAnalyzer />} />
        <Route path="/url-scanner" element={<UrlScanner />} />
        <Route path="/history" element={<History />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function LandingWrapper({ children }) {
  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(14,165,233,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(168,85,247,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

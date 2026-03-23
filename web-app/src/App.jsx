import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  const [showAuth, setShowAuth] = useState(false);
  const isDemo = apiKey === '__demo__';

  function onAuth(key, userData) {
    setApiKeyState(key);
    setUser(userData);
    setShowAuth(false);
  }

  function onLogout() {
    setApiKeyState('');
    setUser(null);
    setShowAuth(false);
  }

  function refreshUser() {
    if (checkDemo()) return;
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }

  function handleLandingAnalyze(content, industry) {
    setShowAuth(true);
  }

  return (
    <AppContext.Provider value={{ apiKey, user, setUser, onLogout, refreshUser, isDemo }}>
      <BrowserRouter>
        {!apiKey ? (
          showAuth ? (
            <AuthGate onAuth={onAuth} onBack={() => setShowAuth(false)} />
          ) : (
            <LandingWrapper>
              <LandingPage
                onAnalyze={handleLandingAnalyze}
                onLoginClick={() => setShowAuth(true)}
              />
            </LandingWrapper>
          )
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<ContentAnalyzer />} />
              <Route path="/url-scanner" element={<UrlScanner />} />
              <Route path="/history" element={<History />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </BrowserRouter>
    </AppContext.Provider>
  );
}

function LandingWrapper({ children }) {
  return (
    <div className="min-h-screen text-slate-50 overflow-x-hidden font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(14,165,233,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(168,85,247,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="spinner" />
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

import { useState, useEffect, createContext, useContext } from 'react';
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
      <BrowserRouter>
        {!apiKey ? (
          <AuthGate onAuth={onAuth} />
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

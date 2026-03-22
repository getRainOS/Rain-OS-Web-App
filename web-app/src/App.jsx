import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getApiKey } from './api/client.js';
import AuthGate from './pages/AuthGate.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentAnalyzer from './pages/ContentAnalyzer.jsx';
import UrlScanner from './pages/UrlScanner.jsx';
import History from './pages/History.jsx';
import Upgrade from './pages/Upgrade.jsx';

export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [apiKey, setApiKeyState] = useState(getApiKey);
  const [user, setUser] = useState(null);

  function onAuth(key, userData) {
    setApiKeyState(key);
    setUser(userData);
  }

  function onLogout() {
    setApiKeyState('');
    setUser(null);
  }

  return (
    <AppContext.Provider value={{ apiKey, user, setUser, onLogout }}>
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
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </BrowserRouter>
    </AppContext.Provider>
  );
}

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getApiKey, setApiKey, clearApiKey, api } from './api/client.js';
import { supabase } from './lib/supabase.js';
import { AppContext } from './context/AppContext.jsx';
import AuthModal from './components/AuthModal.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentAnalyzer from './pages/ContentAnalyzer.jsx';
import UrlScanner from './pages/UrlScanner.jsx';
import RepoAnalysis from './pages/RepoAnalysis.jsx';
import CitationMonitor from './pages/CitationMonitor.jsx';
import BrandVisibility from './pages/BrandVisibility.jsx';
import ShareOfVoice from './pages/ShareOfVoice.jsx';
import History from './pages/History.jsx';
import Upgrade from './pages/Upgrade.jsx';
import Settings from './pages/Settings.jsx';

const VibeCoders = lazy(() => import('./pages/VibeCoders.tsx'));
const LocalBusinessPage = lazy(() => import('./pages/LocalBusinessPage.tsx'));
const ContentWriters = lazy(() => import('./pages/ContentWriters.tsx'));
const WordPressPlugin = lazy(() => import('./pages/WordPressPlugin.tsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.tsx'));
const ProductSellers = lazy(() => import('./pages/ProductSellers.tsx'));
const Developers = lazy(() => import('./pages/Developers.tsx'));
const DocsPage = lazy(() => import('./pages/DocsPage.tsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.tsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.tsx'));
const SupportPage = lazy(() => import('./pages/SupportPage.tsx'));
const BlogIndex = lazy(() => import('./pages/BlogIndex.tsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'));

const BASE_API = 'https://api.getrainos.com';

async function syncWithBackend(accessToken) {
  const res = await fetch(`${BASE_API}/api/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Account sync failed');
  return res.json();
}

const PREVIEW_LANE = 'general';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === '1';
  const [apiKey, setApiKeyState] = useState(() => isPreview ? '__demo__' : getApiKey());
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userLane, setUserLaneState] = useState(() => {
    if (isPreview) return PREVIEW_LANE;
    return localStorage.getItem('rain_os_user_lane') || null;
  });
  const isDemo = apiKey === '__demo__';

  function setUserLane(lane) {
    if (lane) localStorage.setItem('rain_os_user_lane', lane);
    else localStorage.removeItem('rain_os_user_lane');
    setUserLaneState(lane);
  }

  useEffect(() => {
    async function initAuth() {
      if (isPreview) { setAuthChecked(true); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const userData = await syncWithBackend(session.access_token);
          setApiKey(userData.apiKey);
          setApiKeyState(userData.apiKey);
          setUser(userData);
        } catch (_) {
          const existingKey = getApiKey();
          if (existingKey && existingKey !== '__demo__') {
            try {
              const { data } = await api.me();
              setUser(data);
            } catch (_2) {}
          }
        }
      } else if (getApiKey() && getApiKey() !== '__demo__') {
        try {
          const { data } = await api.me();
          setUser(data);
        } catch (_) {}
      }
      setAuthChecked(true);
    }
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearApiKey();
        setApiKeyState('');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function onAuth(key, userData) {
    setApiKeyState(key);
    setUser(userData);
  }

  function onLogout() {
    supabase.auth.signOut().catch(() => {});
    clearApiKey();
    setApiKeyState('');
    setUser(null);
  }

  function refreshUser() {
    if (isDemo) return;
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020410', gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>
          <span style={{ color: '#0ea5e9' }}>rain</span> OS
        </div>
        <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', background: '#0ea5e9', borderRadius: 1, animation: 'rainLoad 1s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes rainLoad { 0%{transform:translateX(-100%)} 50%{transform:translateX(100%)} 100%{transform:translateX(250%)} }`}</style>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ apiKey, user, setUser, onLogout, refreshUser, isDemo, userLane, setUserLane }}>
      <BrowserRouter>
        <AppRoutes apiKey={apiKey} onAuth={onAuth} onLogout={onLogout} refreshUser={refreshUser} />
      </BrowserRouter>
    </AppContext.Provider>
  );
}

function AuthCallbackRoute({ onAuth }) {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const userData = await syncWithBackend(session.access_token);
          setApiKey(userData.apiKey);
          onAuth(userData.apiKey, userData);
          navigate('/dashboard', { replace: true });
        } catch {
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    handleCallback();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020410' }}>
      <div className="spinner" />
    </div>
  );
}

function AuthModalRoute({ onAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pending = location.state || {};
  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode') === 'login' ? 'login' : 'signup';

  return (
    <LandingWrapper>
      <VibeCoders />
      <AuthModal
        onAuth={(key, userData) => {
          onAuth(key, userData);
          if (pending.pendingContent) {
            navigate('/analyze', { replace: true, state: { pendingContent: pending.pendingContent } });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }}
        onBack={() => navigate('/')}
        initialMode={initialMode}
        pendingContent={pending.pendingContent}
      />
    </LandingWrapper>
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
                <VibeCoders />
              </LandingWrapper>
            }
          />
          <Route path="/local-business" element={<LandingWrapper><LocalBusinessPage onBack={() => navigate('/')} /></LandingWrapper>} />
          <Route path="/login" element={<AuthModalRoute onAuth={onAuth} />} />
          <Route path="/auth/callback" element={<AuthCallbackRoute onAuth={onAuth} />} />
          <Route path="/content-writers" element={<LandingWrapper><ContentWriters /></LandingWrapper>} />
          <Route path="/wordpress-plugin" element={<LandingWrapper><WordPressPlugin /></LandingWrapper>} />
          <Route path="/pricing" element={<LandingWrapper><PricingPage /></LandingWrapper>} />
          <Route path="/product-sellers" element={<LandingWrapper><ProductSellers /></LandingWrapper>} />
          <Route path="/vibe-coders" element={<Navigate to="/" replace />} />
          <Route path="/developers" element={<LandingWrapper><Developers /></LandingWrapper>} />
          <Route path="/docs" element={<LandingWrapper><DocsPage /></LandingWrapper>} />
          <Route path="/privacy" element={<LandingWrapper><PrivacyPolicy /></LandingWrapper>} />
          <Route path="/terms" element={<LandingWrapper><TermsOfService /></LandingWrapper>} />
          <Route path="/support" element={<LandingWrapper><SupportPage /></LandingWrapper>} />
          <Route path="/blog" element={<LandingWrapper><BlogIndex /></LandingWrapper>} />
          <Route path="/blog/:slug" element={<LandingWrapper><BlogPost /></LandingWrapper>} />
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
        <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<ContentAnalyzer />} />
        <Route path="/url-scanner" element={<UrlScanner />} />
        <Route path="/repo-analysis" element={<RepoAnalysis />} />
        <Route path="/citation-monitor" element={<CitationMonitor />} />
        <Route path="/brand-visibility" element={<BrandVisibility />} />
        <Route path="/share-of-voice" element={<ShareOfVoice />} />
        <Route path="/history" element={<History />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/local-business" element={<Navigate to="/dashboard" replace />} />
        <Route path="/content-writers" element={<LandingWrapper><ContentWriters /></LandingWrapper>} />
        <Route path="/wordpress-plugin" element={<LandingWrapper><WordPressPlugin /></LandingWrapper>} />
        <Route path="/pricing" element={<LandingWrapper><PricingPage /></LandingWrapper>} />
        <Route path="/product-sellers" element={<LandingWrapper><ProductSellers /></LandingWrapper>} />
        <Route path="/vibe-coders" element={<Navigate to="/" replace />} />
        <Route path="/developers" element={<LandingWrapper><Developers /></LandingWrapper>} />
        <Route path="/docs" element={<LandingWrapper><DocsPage /></LandingWrapper>} />
        <Route path="/privacy" element={<LandingWrapper><PrivacyPolicy /></LandingWrapper>} />
        <Route path="/terms" element={<LandingWrapper><TermsOfService /></LandingWrapper>} />
        <Route path="/support" element={<LandingWrapper><SupportPage /></LandingWrapper>} />
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

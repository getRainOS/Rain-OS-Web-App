import { Pricing, FAQ } from '@/components/marketing/MarketingComponents';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(14,165,233,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(168,85,247,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]" style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />
      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />
      <main className="relative z-10 flex flex-col min-h-screen">
        <section className="pt-40 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-rain-400 font-bold tracking-wider text-xs uppercase mb-3 block">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Choose the plan that fits how often you analyze content for AI readability, citations, and conversion readiness.</p>
          </div>
        </section>
        <Pricing />
        <FAQ />
        <footer className="border-t border-white/10 py-10 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

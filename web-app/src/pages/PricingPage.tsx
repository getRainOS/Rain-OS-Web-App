import { Pricing, FAQ } from '@/components/marketing/MarketingComponents';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

import SiteFooter from '@/components/marketing/SiteFooter';
export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-neutral-50 font-sans relative" style={{ background: '#000000' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#000000' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, #000000)' }} />
      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />
      <main className="relative z-10 flex flex-col min-h-screen">
        <section className="pt-40 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">Choose the plan that fits how often you analyze content for AI readability, citations, and conversion readiness.</p>
          </div>
        </section>
        <Pricing />
        <FAQ />
        <SiteFooter />
      </main>
    </div>
  );
}

import { Pricing, FAQ } from '@/components/marketing/MarketingComponents';

export default function PricingPage() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(14,165,233,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]" style={{ background: 'rgba(168,85,247,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]" style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-white/10 py-6">
        <div className="w-full max-w-7xl px-8 flex items-center justify-between">
          <a href="#/" className="flex items-center gap-2 group">
            <span className="font-bold text-3xl tracking-tighter text-white transition-all">
              r<span className="text-sky-400">ai</span>n
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#/content-writers" className="hover:text-white transition-colors">Writers & Marketers</a>
            <a href="https://www.getrainos.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
            <a href="#/wordpress-plugin" className="hover:text-white transition-colors">WordPress Plugin</a>
            <a href="#/pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="w-[140px]" />
        </div>
      </header>
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
      </main>
    </div>
  );
}

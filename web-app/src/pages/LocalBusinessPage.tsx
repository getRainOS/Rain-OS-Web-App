import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Search, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketingNav from '@/components/marketing/MarketingNav';

export default function LocalBusinessPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MarketingNav onLoginClick={onBack} onGetStartedClick={onBack} />
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-300 mb-6">
            Local Business
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            AEO + SEO for local businesses.
          </h1>
          <p className="mt-5 text-slate-400 text-lg leading-relaxed">
            Optimize for the questions AI answers, the searches Google ranks, and the calls that turn into customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card-gradient rounded-3xl p-8">
            <Search className="w-7 h-7 text-sky-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Answer-first pages</h2>
            <p className="text-slate-400">Make your services easy for AI to understand and cite.</p>
          </div>
          <div className="card-gradient rounded-3xl p-8">
            <MapPin className="w-7 h-7 text-emerald-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Local trust signals</h2>
            <p className="text-slate-400">Clear location, service area, reviews, and business details.</p>
          </div>
          <div className="card-gradient rounded-3xl p-8">
            <PhoneCall className="w-7 h-7 text-violet-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">More calls</h2>
            <p className="text-slate-400">Built for contact intent, phone clicks, and lead conversion.</p>
          </div>
        </div>

        <div className="mt-12 flex gap-4 flex-wrap">
          <Button onClick={onBack} className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-6 py-3 font-bold inline-flex items-center gap-2">
            Back home
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';
import SiteFooter from '@/components/marketing/SiteFooter';

// How the Rain Score is built: what is measured, what is judged, and the weights.
// Kept in step with the scoring code (backend/services/geminiService.ts and readability.ts).

const PILLARS = [
  { name: 'AI Readability', what: 'How easily AI can parse, break up and extract answers from your content.', measured: 'Sentence length, passive voice, vague words, heading count, question and answer structure.', judged: 'Whether each section makes sense on its own and whether sentences are quotable.' },
  { name: 'Digital Authority', what: 'Whether the content shows expertise, trust and sources AI can check.', measured: 'Figures (numbers, percentages, dates) per 100 words, and links to outside sources.', judged: 'Entity clarity, topical depth, freshness and social proof.' },
  { name: 'Conversion Readiness', what: 'Whether the content makes its next step clear to the reader.', measured: 'No rule-based checks. Judged by AI.', judged: 'How clear the next step and the value are.' },
  { name: 'Easy to Quote', what: 'Whether individual passages can be lifted into an answer without losing their meaning.', measured: 'Answers that open a section, and question structure.', judged: 'Whether a passage stands on its own.' },
  { name: 'Product Discoverability', what: 'For online sellers: whether product details are clear to AI.', measured: 'No rule-based checks. Judged by AI.', judged: 'Price, variants and availability clarity.' },
  { name: 'Local Presence', what: 'For local businesses: whether location and listing details are clear.', measured: 'No rule-based checks. Judged by AI.', judged: 'Location, hours, service area and review signals.' },
];

const WEIGHTS = [
  { module: 'General, writers and marketers', ar: '25%', da: '25%', cr: '25%', rr: '25%', pd: '—', lp: '—' },
  { module: 'Developers and vibe coders', ar: '25%', da: '25%', cr: '25%', rr: '25%', pd: '—', lp: '—' },
  { module: 'Online sellers', ar: '20%', da: '20%', cr: '20%', rr: '20%', pd: '20%', lp: '—' },
  { module: 'Local businesses', ar: '20%', da: '20%', cr: '20%', rr: '20%', pd: '—', lp: '20%' },
];

export default function HowWeScorePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      <MarketingNav onLoginClick={() => navigate('/')} onGetStartedClick={() => navigate('/')} />
      <main className="mx-auto max-w-4xl px-6 pt-36 pb-24">
        <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">How we score</div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em]">How the Rain Score is built</h1>
        <p className="mt-5 text-lg leading-relaxed text-neutral-400">
          The Rain Score measures how readable your content is for AI. It is not a prediction of citations, rankings or sales. Each pillar is scored from 0 to 100, and the overall score is a weighted average of the pillars for your kind of business.
        </p>

        <h2 className="mt-14 text-2xl font-semibold">Overall score</h2>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          The overall score is a weighted average, not a total. The weights add up to 100%, so the overall score always falls between the lowest and highest pillar score. The weights for each kind of business are below.
        </p>
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/10 text-neutral-500">
              <tr><th className="p-3 font-medium">Business type</th><th className="p-3 font-medium">Structure</th><th className="p-3 font-medium">Digital Authority</th><th className="p-3 font-medium">Conversion</th><th className="p-3 font-medium">Easy to Quote</th><th className="p-3 font-medium">Product</th><th className="p-3 font-medium">Local</th></tr>
            </thead>
            <tbody className="text-neutral-300">
              {WEIGHTS.map(w => (
                <tr key={w.module} className="border-b border-white/[0.06]">
                  <td className="p-3 text-white">{w.module}</td><td className="p-3">{w.ar}</td><td className="p-3">{w.da}</td><td className="p-3">{w.cr}</td><td className="p-3">{w.rr}</td><td className="p-3">{w.pd}</td><td className="p-3">{w.lp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">What each pillar covers</h2>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          Some checks are rule-based: the same text always gives the same result, such as heading count or figures per 100 words. Others are judged by an AI model, so the score can shift a little between runs. Each pillar score combines both.
        </p>
        <div className="mt-8 space-y-6">
          {PILLARS.map(p => (
            <div key={p.name} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
              <div className="text-[16px] font-semibold text-white">{p.name}</div>
              <p className="mt-2 text-[14px] text-neutral-400">{p.what}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 text-[13px]">
                <div><div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Checked by rule</div><p className="mt-1 text-neutral-300">{p.measured}</p></div>
                <div><div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Judged by AI</div><p className="mt-1 text-neutral-300">{p.judged}</p></div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">What the score does not show</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-400 leading-relaxed">
          <li>The weights are our choice, not a standard.</li>
          <li>Judged parts can change slightly between runs. Re-checking the same text will not always give the same number.</li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}

import React from 'react';
import PlumberIllustration from './PlumberIllustration';

const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace" };

// An illustrative before-and-after, not a customer story. The business and the
// answers are invented for the example and labeled as such on the page.
const QUESTION = "Who's the best emergency plumber near Austin that's open right now?";

const BEFORE = {
  label: 'Before',
  note: 'The business is not named.',
  answer: 'Here are well-reviewed plumbers in Austin with 24/7 service: Acme Plumbing, Sample Drain Co. and Riverside Pipe Works.',
};

const AFTER = {
  label: 'After two fixes',
  note: 'Licensing and 24/7 dispatch added to the first paragraph.',
  answer: 'Here are well-reviewed plumbers in Austin with 24/7 service: Acme Plumbing, Example Plumbing Co. (licensed, 24/7 dispatch, same-day repairs) and Sample Drain Co.',
};

function Card({ tone, label, note, answer }: { tone: 'before' | 'after'; label: string; note: string; answer: string }) {
  const named = tone === 'after';
  return (
    <div className={`rounded-xl border p-5 md:p-6 text-left ${named ? 'border-white/25 bg-white/[0.04]' : 'border-white/10 bg-[#0a0a0a]'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400" style={MONO}>{label}</span>
        <span className={`text-[11px] ${named ? 'text-white' : 'text-neutral-500'}`} style={MONO}>{named ? 'Named' : 'Not named'}</span>
      </div>
      <p className="text-[14px] leading-relaxed text-neutral-300">{answer}</p>
      <p className="mt-4 text-[12px] text-neutral-500">{note}</p>
    </div>
  );
}

export default function IllustratedExample() {
  return (
    <section className="relative z-10 py-24 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={MONO}>Example</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-white">What a before and after looks like</h2>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            A plumber in Austin asked AI for an emergency plumber. The same question, before and after two fixes.
          </p>
        </div>

        <PlumberIllustration className="mx-auto mt-10 w-full max-w-sm text-white" />

        <div className="mt-6 text-center">
          <span className="inline-block rounded-md border border-white/10 bg-black px-4 py-2 text-[14px] text-neutral-200">{QUESTION}</span>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card tone="before" label={BEFORE.label} note={BEFORE.note} answer={BEFORE.answer} />
          <Card tone="after" label={AFTER.label} note={AFTER.note} answer={AFTER.answer} />
        </div>

        <p className="mt-6 text-center text-[12px] text-neutral-500" style={MONO}>
          Illustrative example. All business names are invented, and this is not a customer or a result.
        </p>
      </div>
    </section>
  );
}

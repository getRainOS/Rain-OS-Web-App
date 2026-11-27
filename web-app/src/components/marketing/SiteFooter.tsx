import Logo from '@/components/Logo.tsx';
import React from 'react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Analysis tools',
    links: [
      { label: 'Content Optimizer', to: '/analyze' },
      { label: 'URL Scanner', to: '/url-scanner' },
      { label: 'Repo Analysis', to: '/repo-analysis' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Monitoring tools',
    links: [
      { label: 'Citation Monitor', to: '/citation-monitor' },
      { label: 'Share of Voice', to: '/share-of-voice' },
      { label: 'How AI describes you', to: '/brand-visibility' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Writers & Marketers', to: '/content-writers' },
      { label: 'Online Sellers', to: '/product-sellers' },
      { label: 'Developers', to: '/developers' },
      { label: 'Vibe Coders', to: '/vibe-coders' },
      { label: 'Local Businesses', to: '/local-business' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', to: '/docs' },
      { label: 'Blog', to: '/blog' },
      { label: 'AI Readability', to: '/ai-readability' },
      { label: 'How we score', to: '/how-we-score' },
      { label: 'Support', to: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Security & trust', to: '/trust' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-black">
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(5,1fr)] gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="block w-fit leading-none text-white" aria-label="rain OS home">
              <Logo size={22} />
            </Link>
            <p className="mt-1 text-[12px] text-neutral-500 leading-none">Optimization Systems</p>
            <p className="mt-2 text-[13px] text-neutral-500 leading-snug max-w-[240px]">
              Be <span className="text-white">Seen.</span>
            </p>
          </div>
          {COLUMNS.map(col => (
            <div key={col.title}>
              <div className="text-[12px] font-medium text-neutral-300 mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[13px] text-neutral-500 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-[12px] text-neutral-600">
          <span>© {new Date().getFullYear()} rain OS. All rights reserved.</span>
          <span>support@getrainos.com</span>
        </div>
      </div>
    </footer>
  );
}

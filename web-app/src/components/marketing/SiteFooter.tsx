import Logo from '@/components/Logo.tsx';
import React from 'react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Content Optimizer', to: '/content-writers' },
      { label: 'URL Scanner', to: '/ai-readability' },
      { label: 'Citation Monitor', to: '/#product' },
      { label: 'Repo Analysis', to: '/vibe-coders' },
      { label: 'Pricing', to: '/pricing' },
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
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-bold text-2xl tracking-tighter text-white" aria-label="rain OS home">
              <Logo size={30} />
            </Link>
            <p className="mt-4 text-[13px] text-neutral-500 leading-relaxed max-w-[240px]">
              Be seen by AI.
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

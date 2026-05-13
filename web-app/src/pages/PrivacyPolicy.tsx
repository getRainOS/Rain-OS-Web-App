import MarketingNav from '@/components/marketing/MarketingNav';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = 'May 9, 2025';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Account information: When you sign up, we collect your email address. We use this to identify your account, send transactional emails (receipts, password resets), and communicate product updates.',
      'Content you submit: When you run an analysis, you send text content, URLs, or GitHub repository identifiers to our API. This content is processed to generate your Rain Score and pillar breakdown. We do not permanently store your raw text content on our servers after analysis is complete.',
      'Usage data: We record the number of analyses you run each billing cycle so we can enforce plan limits. We also store your Rain Score history (overall score and per-pillar scores) so you can track progress over time. Raw content is not stored as part of this history.',
      'API key: We issue a unique API key per account, which is stored securely in our database. You are responsible for keeping your key private.',
      'Payment information: Billing is handled entirely by Stripe. We never see or store your full card number. We store your Stripe customer ID and subscription status to manage your plan.',
      'Technical data: We collect standard server logs including IP addresses, request timestamps, and HTTP status codes. These are used for security monitoring and debugging and are not sold or shared.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'To provide the service: processing your content analyses, returning scores and recommendations, and displaying your history.',
      'To enforce plan limits: tracking usage counts against your subscription tier.',
      'To process billing: communicating with Stripe to manage subscriptions, upgrades, and cancellations.',
      'To improve the service: aggregate, anonymised usage patterns help us prioritise features and improve scoring accuracy. We never use your content to train AI models.',
      'To communicate with you: sending receipts, billing notifications, and (if you opt in) product updates. You can unsubscribe from non-transactional emails at any time.',
    ],
  },
  {
    title: 'GitHub Integration',
    body: [
      'If you connect your GitHub account, we request read-only access to your repositories. We use this access only to fetch the specific source files required for Repo Analysis (README, package.json, index.html, robots.txt, llms.txt, and similar).',
      'We do not store your GitHub access token in plaintext. It is encrypted using AES-256-CBC before being written to our database.',
      'We never read, store, or process any repository files beyond what is required to generate your analysis. Your source code is not retained after analysis is complete.',
      'You can disconnect your GitHub account at any time from the Settings page, which permanently deletes your stored token.',
    ],
  },
  {
    title: 'Third-Party Services',
    body: [
      'Stripe: handles all payment processing. Your payment information is subject to Stripe\'s Privacy Policy at stripe.com/privacy.',
      'Google Gemini API: we use Gemini to generate scoring insights for your content. Content you submit is sent to Google\'s API under our agreement with Google. We do not share your account information with Google.',
      'Supabase: we use Supabase for authentication and database hosting. Your data is stored on Supabase-managed infrastructure.',
      'We do not sell, rent, or share your personal information with any third party for advertising or marketing purposes.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'Your account data (email, API key, subscription status) is retained for as long as your account exists.',
      'Your analysis history (scores, pillar breakdowns, timestamps) is retained for as long as your account exists so you can review progress over time.',
      'Raw content submitted for analysis is not retained after the analysis request completes.',
      'You may request deletion of your account and all associated data by emailing support@getrainos.com. We will complete deletion within 30 days.',
    ],
  },
  {
    title: 'Cookies and Local Storage',
    body: [
      'The web app stores your API key in your browser\'s localStorage for session persistence. This data never leaves your browser except as the Authorization header on API requests.',
      'Your selected solution lane preference is also stored in localStorage.',
      'We do not use third-party advertising cookies. We may use minimal first-party session cookies for authentication if you sign in via email/password.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'Access: you can request a copy of the personal data we hold about you.',
      'Correction: you can update your email address by contacting support.',
      'Deletion: you can request full account deletion at any time.',
      'Portability: you can export your analysis history from the Score History page.',
      'To exercise any of these rights, email us at support@getrainos.com.',
    ],
  },
  {
    title: 'Security',
    body: [
      'All data is transmitted over HTTPS/TLS. API keys are stored hashed. GitHub tokens are encrypted at rest. We perform regular security reviews.',
      'If you believe you have found a security vulnerability, please report it responsibly to support@getrainos.com.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy as the product evolves. We will notify you of material changes by email and by updating the "Last updated" date at the top of this page.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'If you have any questions about this Privacy Policy, contact us at support@getrainos.com.',
    ],
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(14,165,233,0.04)', filter: 'blur(150px)' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />

      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-36 pb-24">
        <div className="mb-12">
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Legal</span>
          <h1 className="text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-slate-400 mt-4 leading-relaxed">
            rain OS is built to help you improve how AI engines read and cite your content. We take data privacy seriously
            and try to collect only what is necessary to operate the service. This policy explains what we collect, why,
            and how you can control it.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <div key={i} className="border-t border-white/[0.07] pt-8">
              <h2 className="text-lg font-semibold text-white mb-4">{s.title}</h2>
              <ul className="space-y-3">
                {s.body.map((p, j) => (
                  <li key={j} className="text-slate-400 leading-relaxed text-sm pl-4 border-l border-white/10">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/privacy" className="text-sky-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

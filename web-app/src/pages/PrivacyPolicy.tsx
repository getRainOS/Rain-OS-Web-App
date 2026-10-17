import MarketingNav from '@/components/marketing/MarketingNav';
import { useNavigate } from 'react-router-dom';

import SiteFooter from '@/components/marketing/SiteFooter';
const LAST_UPDATED = 'October 17, 2026';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Account information: When you sign up, we collect your email address. We use this to identify your account, send transactional emails (receipts, password resets), and communicate product updates.',
      'Content you submit: When you run an analysis, you send text, URLs, questions or GitHub repository identifiers to our API to generate your scores and results. Text you paste into Content Optimizer is saved with that analysis so you can reopen and re-analyze it; deleting the analysis deletes it.',
      'Usage data: We record the number of analyses you run each billing cycle so we can enforce plan limits, and we store your score and check history so you can track progress over time.',
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
      'Supabase: handles sign-in sessions.',
      'Railway: runs our API and hosts our database. Vercel: serves the website and app. Resend: sends account and alert emails.',
      'We do not sell, rent, or share your personal information with any third party for advertising or marketing purposes.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'Your account data (email, API key, subscription status) is retained for as long as your account exists.',
      'Your analysis history (scores, pillar breakdowns, timestamps) is retained for as long as your account exists so you can review progress over time.',
      'Text pasted into Content Optimizer is kept with its analysis until you delete the analysis or your account. Repository files fetched for Repo Analysis are not kept.',
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
      'Portability: you can export your history as CSV from the History page.',
      'To exercise any of these rights, email us at support@getrainos.com.',
    ],
  },
  {
    title: 'Security',
    body: [
      'All data is transmitted over HTTPS/TLS. Passwords are stored as salted scrypt hashes, API keys are stored hashed, and GitHub tokens are encrypted at rest. See our Security & trust page for details.',
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
    <div className="min-h-screen text-neutral-50 font-sans relative" style={{ background: '#000000' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#000000' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(255,255,255,0.04)', filter: 'blur(150px)' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, #000000)' }} />

      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-36 pb-24">
        <div className="mb-12">
          <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Legal</span>
          <h1 className="text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>Privacy Policy</h1>
          <p className="text-neutral-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-neutral-400 mt-4 leading-relaxed">
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
                  <li key={j} className="text-neutral-400 leading-relaxed text-sm pl-4 border-l border-white/10">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

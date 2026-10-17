import MarketingNav from '@/components/marketing/MarketingNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = 'October 17, 2026';

// Every statement here is checked against the code and our hosting setup.
// Update this page whenever a provider, a storage rule or a control changes.
const GLANCE = [
  { title: 'Encrypted in transit', body: 'Every request to rain OS and its API travels over HTTPS.' },
  { title: 'Passwords are never stored', body: 'Only a salted scrypt hash is kept, so a password cannot be read back, even by us.' },
  { title: 'Keys and tokens protected', body: 'API keys are stored hashed. GitHub access tokens are encrypted with AES-256 before they are saved.' },
  { title: 'Not used for training', body: 'We do not use your content to train AI models.' },
];

const PROVIDERS = [
  ['Google (Gemini API)', 'Scores your content and runs the visibility checks, with Google Search grounding.', 'The text, page or question being analyzed'],
  ['Google (sign-in)', 'Optional “Continue with Google” sign-in.', 'Your Google account email and name'],
  ['Railway', 'Runs the rain OS API and hosts our Postgres database. App servers run in Railway’s US West region.', 'Your account and saved results'],
  ['Vercel', 'Serves the rain OS website and app.', 'Standard web request data'],
  ['Supabase', 'Handles sign-in sessions.', 'Your email and sign-in details'],
  ['Stripe', 'Processes payments. We never see your full card number.', 'Billing details'],
  ['Resend', 'Sends account and alert emails.', 'Your email address and the email content'],
  ['GitHub', 'Only if you connect it: reads the files Repo Analysis needs.', 'Read-only repository access'],
];

const STORED = [
  'Your account: email, name if you add one, plan and usage counts.',
  'Your results: scores, checks and their history, so you can track progress over time.',
  'Content you paste into Content Optimizer is saved with that analysis so you can reopen it and re-analyze it. Deleting the analysis deletes the content.',
  'Repository files fetched for Repo Analysis are used for that analysis and not kept.',
  'Everything is kept until you delete it or close your account.',
];

const CONTROLS = [
  'Delete single analyses or clear any history from the History page.',
  'Export your history as CSV, or print a full report, at any time.',
  'Disconnect GitHub from Settings, which deletes the stored token.',
  'Turn off citation alert emails in Settings.',
  'Close your account and have all your data deleted by emailing support@getrainos.com. We complete deletion within 30 days.',
];

const NOT_YET = [
  'We do not have a SOC 2 or ISO 27001 report.',
  'There is no single sign-on (SSO) or team accounts yet.',
  'If you need a security questionnaire answered or a data processing agreement, email support@getrainos.com and we will answer it plainly.',
];

export default function TrustPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-neutral-50 font-sans relative" style={{ background: '#000000' }}>
      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-24">
        <div className="mb-12">
          <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Trust</span>
          <h1 className="text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>Security and data handling</h1>
          <p className="text-neutral-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-neutral-400 mt-4 leading-relaxed max-w-2xl">
            What we store, where it lives, who processes it, and what you control. If something here is unclear,
            email support@getrainos.com.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-white/[0.07] border border-white/[0.07] rounded-lg overflow-hidden mb-14">
          {GLANCE.map(g => (
            <div key={g.title} className="bg-black p-6">
              <h2 className="text-sm font-semibold text-white mb-2">{g.title}</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">{g.body}</p>
            </div>
          ))}
        </div>

        <Section title="Who processes your data">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">What for</th>
                  <th className="py-2 font-medium">Data involved</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.map(([name, why, data]) => (
                  <tr key={name} className="border-t border-white/[0.07] align-top">
                    <td className="py-3 pr-4 text-white whitespace-nowrap">{name}</td>
                    <td className="py-3 pr-4 text-neutral-400">{why}</td>
                    <td className="py-3 text-neutral-400">{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-500 mt-4">We do not sell or share your data for advertising.</p>
        </Section>

        <Section title="What we store"><List items={STORED} /></Section>
        <Section title="What you control"><List items={CONTROLS} /></Section>
        <Section title="Also in place">
          <List items={[
            'Request rate limits on the API to slow down abuse.',
            'Standard security headers on every API response.',
            'Account access by API key, sent only in the request header.',
          ]} />
        </Section>
        <Section title="What we don’t have yet"><List items={NOT_YET} /></Section>
        <Section title="Report a vulnerability">
          <p className="text-sm text-neutral-400 leading-relaxed">
            Email support@getrainos.com with the details. Please give us a reasonable chance to fix it before sharing it publicly.
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/[0.07] pt-8 mb-10">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map(t => (
        <li key={t} className="text-neutral-400 leading-relaxed text-sm pl-4 border-l border-white/10">{t}</li>
      ))}
    </ul>
  );
}

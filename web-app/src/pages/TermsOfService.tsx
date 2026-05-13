import MarketingNav from '@/components/marketing/MarketingNav';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = 'May 9, 2025';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By creating an account or using the rain OS service (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.',
      'We may update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will notify you of material changes by email.',
    ],
  },
  {
    title: 'Description of Service',
    body: [
      'rain OS provides Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) analysis tools that score your content, URLs, and source code repositories for AI readability, citation authority, and conversion readiness.',
      'The Service is offered as a web application at getrainos.com, a WordPress plugin, and (in future) a Chrome extension. These Terms apply to all clients and access methods.',
    ],
  },
  {
    title: 'Account Terms',
    body: [
      'You must be 18 years of age or older to use the Service.',
      'You are responsible for maintaining the confidentiality of your API key and for all activity that occurs under your account.',
      'You must provide accurate information when creating your account. Accounts created with false information may be suspended.',
      'One account per person or organization. You may not share accounts or API keys across multiple organizations unless you are on a plan that explicitly permits this.',
      'You may not use automated scripts or bots to consume API calls beyond your plan limits.',
    ],
  },
  {
    title: 'API Key Usage',
    body: [
      'Your API key is a credential that grants access to the Service on your behalf. You must keep it confidential.',
      'You are responsible for all usage attributed to your API key, whether authorized or not. If you believe your key has been compromised, contact support@getrainos.com immediately to have it rotated.',
      'We reserve the right to suspend or revoke API keys that are found to be used in violation of these Terms.',
    ],
  },
  {
    title: 'Content You Submit',
    body: [
      'You retain full ownership of any content you submit to the Service for analysis.',
      'By submitting content, you grant rain OS a limited, non-exclusive, royalty-free license to process that content solely for the purpose of returning analysis results to you.',
      'We do not claim ownership of your content, use it for training AI models, or share it with third parties beyond what is described in our Privacy Policy.',
      'You are solely responsible for ensuring that any content you submit does not violate applicable law or the intellectual property rights of others.',
      'You may not submit content that is unlawful, harmful, or intended to facilitate illegal activity.',
    ],
  },
  {
    title: 'Acceptable Use',
    body: [
      'You agree not to: (a) attempt to gain unauthorized access to any part of the Service or its underlying infrastructure; (b) reverse-engineer or attempt to extract the source code of the Service; (c) use the Service in a way that disrupts, degrades, or impairs it for other users; (d) resell, sublicense, or provide API access to the Service to third parties without our prior written consent; (e) use the Service to generate spam, misinformation, or content designed to deceive.',
    ],
  },
  {
    title: 'Plans, Billing, and Cancellation',
    body: [
      'Paid plans are billed monthly or annually in advance via Stripe. Prices are shown at the time of purchase and may change with 30 days notice.',
      'Free plans include a limited number of analyses per month. Paid plans unlock higher limits and additional features as described on the pricing page.',
      'You may cancel your subscription at any time from the Settings page. Cancellation takes effect at the end of your current billing period. We do not offer prorated refunds for unused time, except where required by law.',
      'We reserve the right to modify or discontinue any plan at any time. We will provide reasonable notice before doing so.',
    ],
  },
  {
    title: 'Disclaimer of Warranties',
    body: [
      'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
      'We do not warrant that the Service will be uninterrupted, error-free, or that analysis results will be accurate, complete, or suitable for your specific purpose.',
      'AI citation and search engine behavior changes frequently. Rain Scores reflect our best analysis at the time of the request and are not guarantees of any ranking, citation, or traffic outcome.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, rain OS and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of revenue, loss of data, or loss of business opportunity, arising out of or relating to your use of the Service.',
      'Our total liability to you for any claim arising out of or relating to these Terms or the Service, regardless of the form of the action, shall not exceed the amount you paid us in the twelve months preceding the claim.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'You may terminate your account at any time by contacting support@getrainos.com.',
      'We may suspend or terminate your account at any time if we determine, in our sole discretion, that you have violated these Terms or that continued access poses a security or legal risk.',
      'Upon termination, your right to use the Service immediately ceases. Sections relating to intellectual property, disclaimers, limitations of liability, and dispute resolution survive termination.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be resolved through good-faith negotiation where possible.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about these Terms? Email us at support@getrainos.com.',
    ],
  },
];

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(168,85,247,0.04)', filter: 'blur(150px)' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />

      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-36 pb-24">
        <div className="mb-12">
          <span className="text-purple-400 font-bold tracking-wider text-xs uppercase mb-3 block">Legal</span>
          <h1 className="text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Please read these Terms carefully before using rain OS. They govern your access to and use of our analysis
            tools, API, WordPress plugin, and all other parts of the Service.
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
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-purple-400">Terms of Service</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

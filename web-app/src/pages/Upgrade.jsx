import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import styles from './Upgrade.module.css';


const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    priceId: 'price_1SeCHg3NMjs4uYdguOgkr3SQ',
    description: 'Try Rain OS and see how AI reads your content.',
    color: 'var(--text-muted)',
    limit: '5 checks / month',
    features: [
      { label: '5 content analyses / month', included: true },
      { label: 'Content Analyzer', included: true },
      { label: 'Basic recommendations', included: true },
      { label: 'URL Scanner', included: false },
      { label: 'Repo Analysis', included: false },
      { label: 'Citation Monitor', included: false },
      { label: 'AI Visibility', included: false },
      { label: 'Share of Voice', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    priceId: 'price_1SeCKM3NMjs4uYdgcBRhgIhD',
    description: 'Full AEO suite for content creators and growing brands.',
    color: 'var(--accent)',
    featured: true,
    limit: '200 checks / month',
    features: [
      { label: '200 analyses / month', included: true },
      { label: 'Content Analyzer', included: true },
      { label: 'URL Scanner', included: true },
      { label: 'Repo Analysis (GitHub)', included: true },
      { label: 'Citation Monitor — 20 checks / mo', included: true },
      { label: 'Quick Tools (titles, meta, summarize)', included: true },
      { label: 'Score History', included: true },
      { label: 'AI Visibility', included: false },
      { label: 'Share of Voice', included: false },
    ],
  },
  {
    name: 'Business',
    price: '$99',
    period: '/ month',
    priceId: 'price_1SeCJH3NMjs4uYdgpi0xB0XN',
    description: 'Premium AI intelligence for scaling brands and agencies.',
    color: 'var(--purple)',
    limit: '500 checks / month',
    features: [
      { label: '500 analyses / month', included: true },
      { label: 'Everything in Pro', included: true },
      { label: 'Citation Monitor — 100 checks / mo', included: true },
      { label: 'AI Visibility — 50 checks / mo', included: true },
      { label: 'Share of Voice — 20 checks / mo', included: true },
      { label: 'Priority support', included: true },
    ],
  },
];

export default function Upgrade() {
  const { user, isDemo } = useApp();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPriceId = user?.stripePriceId ?? null;

  function getCurrentPlanName() {
    if (!currentPriceId) return 'Free';
    const match = PLANS.find(p => p.priceId === currentPriceId);
    return match?.name ?? 'Free';
  }

  const currentPlan = getCurrentPlanName();
  const isSubscribed = user?.subscriptionStatus === 'active';

  async function handleUpgrade(priceId) {
    setError('');
    setLoadingPlan(priceId);
    const successUrl = window.location.origin + '/#/dashboard';
    const cancelUrl = window.location.origin + '/#/upgrade';
    try {
      const { data } = await api.createCheckoutSession(priceId, successUrl, cancelUrl);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try at getrainos.com.');
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    setError('');
    setPortalLoading(true);
    try {
      const { data } = await api.createBillingPortal(window.location.origin + '/#/upgrade');
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      setError(err.message || 'Could not open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upgrade Your Plan</h1>
        <p className={styles.sub}>Choose the plan that fits your AEO optimization needs</p>
      </div>

      {isDemo && (
        <div className={styles.demoNotice}>
          You're exploring in demo mode. To upgrade, sign up for a real account at{' '}
          <a href="https://app.getrainos.com" target="_blank" rel="noopener noreferrer">app.getrainos.com</a>.
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.plans}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.name;
          const isLoading = loadingPlan === plan.priceId;
          return (
            <div
              key={plan.name}
              className={`${styles.plan} ${plan.featured ? styles.planFeatured : ''}`}
              style={{ '--plan-color': plan.color }}
            >
              {plan.featured && <div className={styles.badge}>Most Popular</div>}

              <div className={styles.planTop}>
                <div className={styles.planName} style={{ color: plan.color }}>{plan.name}</div>
                <div className={styles.planPrice}>
                  {plan.price}
                  <span className={styles.planPeriod}>{plan.period}</span>
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
              </div>

              <div className={styles.planLimit}>{plan.limit}</div>
              <ul className={styles.features}>
                {plan.features.map((f, i) => (
                  <li key={i} className={`${styles.feature} ${!f.included ? styles.featureLocked : ''}`}>
                    <span className={styles.checkmark} style={{ color: f.included ? plan.color : 'var(--text-dim)' }}>
                      {f.included ? '✓' : '—'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <div className={styles.planBottom}>
                {isCurrent ? (
                  <span className={styles.currentBadge}>Current Plan</span>
                ) : plan.priceId === 'price_1SeCHg3NMjs4uYdguOgkr3SQ' ? (
                  <span className={styles.currentBadge} style={{ opacity: 0.5 }}>Free Tier</span>
                ) : (
                  <button
                    className={styles.ctaBtn}
                    style={{ background: plan.color, boxShadow: `0 0 20px ${plan.color}40` }}
                    onClick={() => handleUpgrade(plan.priceId)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="spinner" style={{ width: 14, height: 14 }} /> Processing…</>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isSubscribed && (
        <div className={styles.billingRow}>
          <span className={styles.billingText}>Manage your subscription, invoices, and payment methods:</span>
          <button
            className="btn btn-ghost"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? <><span className="spinner" /> Opening…</> : 'Manage Billing →'}
          </button>
        </div>
      )}

      <p className={styles.note}>
        All plans billed monthly. Cancel anytime. Subscribed users can manage billing directly from the
        "Manage Billing" button above or from{' '}
        <a href="https://www.getrainos.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
          getrainos.com
        </a>.
      </p>
    </div>
  );
}

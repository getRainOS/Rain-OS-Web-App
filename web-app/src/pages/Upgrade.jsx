import { useApp } from '../App.jsx';
import styles from './Upgrade.module.css';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    priceId: 'price_1SeCHg3NMjs4uYdguOgkr3SQ',
    description: 'Get started with AI readability insights.',
    color: 'var(--text-muted)',
    features: [
      '20 analyses / month',
      'AI Readability pillar',
      'Basic recommendations',
      'Content Analyzer',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    priceId: 'price_1SeCKM3NMjs4uYdgcBRhgIhD',
    description: 'Full AEO analysis for content creators.',
    color: 'var(--accent)',
    featured: true,
    features: [
      '500 analyses / month',
      'All 4 pillars',
      'Quick Tools (titles, meta, summarize)',
      'Score History',
      'URL Scanner',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    checkoutUrl: 'https://www.getrainos.com/upgrade?plan=pro',
  },
  {
    name: 'Business',
    price: '$99',
    period: '/ month',
    priceId: 'price_1SeCJH3NMjs4uYdgpi0xB0XN',
    description: 'High-volume AEO optimization for teams.',
    color: 'var(--purple)',
    features: [
      'Unlimited analyses',
      'All 4 pillars',
      'All Quick Tools',
      'Team access',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Upgrade to Business',
    checkoutUrl: 'https://www.getrainos.com/upgrade?plan=business',
  },
];

export default function Upgrade() {
  const { user } = useApp();

  function getCurrentPlan() {
    if (!user?.stripePriceId) return 'Free';
    if (user.stripePriceId === 'price_1SeCJH3NMjs4uYdgpi0xB0XN') return 'Business';
    if (user.stripePriceId === 'price_1SeCKM3NMjs4uYdgcBRhgIhD') return 'Pro';
    return 'Free';
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upgrade Your Plan</h1>
        <p className={styles.sub}>Choose the plan that fits your AEO optimization needs</p>
      </div>

      <div className={styles.plans}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.name;
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

              <ul className={styles.features}>
                {plan.features.map((f, i) => (
                  <li key={i} className={styles.feature}>
                    <span className={styles.checkmark} style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={styles.planBottom}>
                {isCurrent ? (
                  <span className={styles.currentBadge}>Current Plan</span>
                ) : plan.checkoutUrl ? (
                  <a
                    href={plan.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaBtn}
                    style={{ background: plan.color, boxShadow: `0 0 20px ${plan.color}40` }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button className={styles.ctaBtn} disabled>{plan.cta}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.note}>
        All plans billed monthly. Cancel anytime.{' '}
        <a href="https://www.getrainos.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Visit getrainos.com
        </a>{' '}
        to manage your subscription.
      </p>
    </div>
  );
}

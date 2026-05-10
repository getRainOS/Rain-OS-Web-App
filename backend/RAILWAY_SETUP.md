# Railway Deployment Setup

## Switching from getRainOS/Backend → getRainOS/Web-Application

### Steps in Railway Dashboard

1. Go to your Railway project → backend service → **Settings**
2. Under **Source / Repository** → click **Change Repo**
3. Select `getRainOS/Web-Application`
4. Set **Root Directory** to: `backend`
5. Railway will auto-detect the build and start commands from `railway.json`
6. Click **Deploy**

---

## Required Environment Variables

Set these in Railway → your service → **Variables**:

### Core
| Variable | Description |
|---|---|
| `PORT` | Railway sets this automatically — do not override |
| `DATABASE_URL` | PostgreSQL connection string |
| `API_BASE_URL` | Your Railway backend URL e.g. `https://api.getrainos.com` |
| `APP_URL` | Your frontend URL e.g. `https://getrainos.com` |

### AI / Gemini
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model name e.g. `gemini-1.5-flash` |

### Supabase
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |

### Stripe
| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_PRO` | Pro plan price ID |
| `STRIPE_PRICE_ID_BUSINESS` | Business plan price ID |

### GitHub OAuth (for Repo Analysis feature)
| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |

### Google OAuth (if used)
| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |

### Security
| Variable | Description |
|---|---|
| `ENCRYPTION_SECRET` | AES-256 encryption key for GitHub tokens |
| `API_KEY` | Internal API key (if used) |
| `CRON_SECRET` | Secret for cron job endpoints |

---

## Build & Start Commands (auto-detected via railway.json)
- **Build**: `npm install` — this triggers `postinstall` which runs `tsc` to compile TypeScript
- **Start**: `npm start` — runs `node dist/api/index.js`

## Health Check
The `/health` endpoint is used by Railway for health monitoring.

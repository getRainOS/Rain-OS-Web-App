# Rain OS: Headless AI Readability Analysis Engine

This repository contains the backend API for Rain OS, a headless service that analyzes web content to score and improve its AI Readability for Answer Engine Optimization (AEO). This service is designed to be consumed by other applications, such as a WordPress plugin or a custom frontend dashboard.

## Features

*   **Secure User Authentication**: Supports email/password and Google OAuth.
*   **API Key Management**: Provides secure, unique API keys for each user.
*   **AI-Powered Content Analysis**: Leverages the Google Gemini API to perform deep content analysis.
*   **Stripe Subscription Integration**: Manages user subscriptions, usage limits, and billing via Stripe webhooks.
*   **RESTful API**: A clear set of endpoints for user management, content analysis, and subscription control.

## Prerequisites

*   **Node.js** (v18 or later)
*   **PostgreSQL** Database
*   **Environment Variables**: You will need API keys and secrets from several services.

## Getting Started

### 1. Installation

Clone the repository and install the dependencies.

```bash
git clone <repository_url>
cd rain-os-backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project and populate it with the following variables:

```dotenv
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Google Gemini API
API_KEY="your_google_gemini_api_key"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application Security
ENCRYPTION_SECRET="a_random_32_character_string_for_db_encryption"
CRON_SECRET="a_secure_random_string_for_cron_job_authentication"

# (Optional) Google OAuth Client ID
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

### 3. Database Setup

The application will automatically create the necessary `users` table when it starts for the first time. Ensure your `DATABASE_URL` is configured correctly.

### 4. Running the Server

Build the TypeScript files and start the server.

```bash
# This will build the project into the /dist directory
npm run build

# This will start the server
npm start
```

The API will be running on `http://localhost:3001` by default.

## API Endpoints

All API endpoints are prefixed with `/api`. An `Authorization: Bearer <your_rain_os_api_key>` header is required for protected routes.

*   `POST /api/auth/signup`: Create a new user account.
*   `POST /api/auth/login`: Log in with email and password.
*   `POST /api/auth/google`: Sign up or log in with a Google ID token.
*   `GET /api/users/me`: Get the current user's details.
*   `POST /api/users/me/regenerate-key`: Invalidate the old API key and generate a new one.
*   `POST /api/analyze`: Analyze content. Requires `{ content: string, industry: string }` in the body.
*   `POST /api/stripe/create-checkout-session`: Get a URL to the Stripe checkout page.
*   `POST /api/stripe/create-portal-session`: Get a URL to the Stripe customer portal to manage subscriptions.
*   `POST /api/stripe/webhook`: Endpoint for Stripe to send subscription events.
*   `POST /api/cron/reset-usage`: A secure endpoint to reset all user usage counts (e.g., at the start of a month).

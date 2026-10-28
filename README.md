# Smart Budget Tracker

A responsive personal-finance dashboard for tracking income, expenses, budgets, savings goals, and everyday spending patterns.

**Current status: early frontend prototype.** The repository started empty. This is a fresh implementation, not a recovered copy of the original app. The reference screen recording still needs to be compared against the UI to tune visual fidelity.

## Stack

- React 18 + Vite
- Recharts for charts
- Lucide React icons
- CSS responsive layout
- Browser local storage for demo transactions

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Prototype features currently present

- Dashboard with income, expense, balance and goal summaries
- Add income/expense transaction form
- Transaction search, type filtering, and transaction deletion
- CSV export plus full JSON backup/restore for transactions, budgets, and goals
- Monthly budget overview and budget-limit editing; spent totals are derived from current-month expense records
- Savings goal creation and manual allocation with browser persistence
- Ledger-driven six-month trend and category breakdown charts
- Transparent rule-based money prompts and calculators
- Bill-splitting and daily-spending calculators
- Responsive navigation, help page and privacy notes

## Important scope boundary

This is still a **local-only demo**, not a secure production finance application. It has no real user accounts, backend API, cloud database, bank integration, or server-side recovery. Local browser storage is not encrypted by this app. The demo begins with sample transactions, budgets, and goals; reset or delete those before recording a personal-data demo. JSON backup/restore is provided, but the user is responsible for protecting backup files.

## Not implemented yet

- Cross-device backup and restore
- Automated recurring transactions/reminders
- Shared expenses with settlement tracking
- Transaction editing and full calendar view
- Secure account creation/login, password recovery, and account-specific cloud data
- Backend API and production database
- Historical analytics derived exclusively from the user's ledger
- Tested forecasting, anomaly detection, or trained ML models
- Production security review and deployment configuration

Dashboard trends and spending breakdowns are calculated from the transactions currently stored in the browser. The initial transaction list is demo data; delete or reset it before using the workspace for your own records. The app currently stores transactions in the browser only; clearing browser data can erase them. Do not enter sensitive real financial data until authentication, cloud persistence, and security controls have been implemented and tested.

## Money-handling principles

- Income increases the ledger balance; expenses decrease it.
- Savings allocations are not expenses.
- Transfers between accounts are neither income nor spending.
- Derived totals should be computed from ledger entries rather than manually maintained totals.
- Forecasts must be labelled estimates and disclose their assumptions.


## Secure email/password authentication (Python API)

The repository now includes a FastAPI authentication service in `backend/`. The frontend only uses real sign-in when `VITE_API_BASE_URL` points to a deployed HTTPS API; otherwise the login form stays fail-closed and the separate demo workspace remains available for sample-data previews.

### Deploy the API

1. In Render, create a new Blueprint from this repository and let it read `render.yaml`.
2. The blueprint provisions a Python web service and PostgreSQL database. Wait for both to finish provisioning.
3. In the `smartbudget-auth-api` service environment, set `FRONTEND_ORIGINS` to the exact HTTPS origin of your deployed frontend (for example `https://your-app.vercel.app`, with no path or trailing slash). Keep `APP_ENV=production` and `COOKIE_SECURE=true`.
4. In Vercel, set `VITE_API_BASE_URL` to the API's HTTPS origin (for example `https://smartbudget-auth-api.onrender.com`) and redeploy the frontend.
5. Visit the API's `/health` endpoint and test registration, logout, and wrong-password rejection before using accounts.

Local API setup and required environment variables are documented in `backend/README.md`.

### Important security boundary

The API verifies email/password on the server, hashes passwords with Argon2, and uses revocable HttpOnly sessions. However, transactions, budgets, and goals are still stored in browser localStorage; namespacing them by account ID is not equivalent to server-side access control. Do not enter real or sensitive financial information until those records are moved behind authenticated, per-user backend endpoints. Google OAuth is not yet implemented.

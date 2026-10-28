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
- Transaction search and type filtering
- CSV export
- Monthly budget overview and budget-limit editing
- Savings goal creation and manual allocation
- Basic charts and rule-based money prompts
- Bill-splitting and daily-spending calculators
- Responsive navigation, help page and privacy notes

## Not implemented yet

- Secure sign-up/login, password recovery, and account-specific cloud data
- API/backend and production database
- Cross-device backup and restore
- Automated recurring transactions/reminders
- Shared expenses with settlement tracking
- Transaction editing/deletion and full calendar view
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

# Smart Budget Tracker

A personal-finance dashboard for tracking income, expenses, budgets, savings goals, shared bills, and spending patterns.

## Status

Initial repository setup. The application is being built from scratch because no source code was present in the repository. Features will be marked complete only after implementation and testing.

## Planned stack

- Frontend: React + Vite
- API: Python + FastAPI
- Data analysis and forecasting: Pandas, NumPy, scikit-learn (introduced only where data volume supports it)
- Charts: Recharts
- Authentication and persistent storage: to be configured with a managed database/auth provider before public deployment

## Development priorities

1. Reconstruct the reference interface once its recording/screenshots are available in the active project context.
2. Build the dashboard and transaction workflows.
3. Add correct rolling-balance, budgets, savings, and shared-expense logic.
4. Add analytics and clearly labelled estimates.
5. Add authentication, persistence, validation, tests, and deployment configuration.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The initial frontend scaffold is a development starting point, not a production-ready financial application. Do not enter real financial or account credentials until authentication, persistence, and security controls have been implemented and tested.

## Money-handling rules

- Income increases the ledger balance; expenses decrease it.
- Transfers into savings are allocations, not expenses.
- Moving money between accounts is not income or spending.
- Derived balances should be computed from ledger entries rather than manually maintained totals.
- Forecasts are estimates and should disclose their assumptions.

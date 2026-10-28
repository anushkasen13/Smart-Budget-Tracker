# SmartBudget Authentication API

FastAPI backend for real email/password authentication. It uses PostgreSQL in production, Argon2 password hashing, opaque random server-side sessions, HttpOnly cookies, session revocation on logout, exact-origin CORS, and rate limits on registration/login.

## Local development

1. Install Python 3.11+.
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`.
4. Set environment variables:
   - `APP_ENV=development`
   - `DATABASE_URL=sqlite:///./smartbudget.db` (local development only)
   - `COOKIE_SECURE=false` (local HTTP only)
   - `FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
5. Run: `uvicorn main:app --reload --port 8000`.

Set frontend `VITE_API_BASE_URL=http://localhost:8000` and restart Vite.

## Production deployment

Deploy this directory as a Python web service (for example, Render):
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Use a managed, persistent PostgreSQL database; set `DATABASE_URL` to its connection string.
- Set `APP_ENV=production`, `COOKIE_SECURE=true`, and `FRONTEND_ORIGINS` to the exact HTTPS origin of the deployed frontend (no path or trailing slash).
- Set frontend deployment variable `VITE_API_BASE_URL` to the backend's HTTPS origin, then rebuild/redeploy the frontend.
- Never commit database URLs, passwords, API keys, or secrets.

The production API refuses to start with SQLite. Cross-site cookies require HTTPS and `SameSite=None`; this app sets those when `COOKIE_SECURE=true`.

## Security scope and limitations

- Passwords are Argon2-hashed and never stored in plaintext.
- Session tokens are random, stored as SHA-256 digests in the database, held by the browser in an HttpOnly cookie, and revocable at logout.
- Login and registration have IP-based rate limits.
- CORS is restricted to configured origins.
- This service authenticates accounts and supports profile updates. **It does not yet store or authorize transactions, budgets, or savings goals on the server.** The current finance data still lives in browser localStorage and must be migrated to authenticated per-user API endpoints before real sensitive financial data is considered protected.
- Google OAuth is not implemented. Do not present the Google button as functional until OAuth is configured.
- Review deployment logs and configure monitoring, backups, HTTPS, and an appropriate privacy policy before public use.

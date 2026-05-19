# OnePieceDaily — Backend Deployment (Render)

## Quick Start

### 1. Prerequisites
- A [Render](https://render.com) account (free tier works)
- A PostgreSQL database (Render provides one free, or use Supabase/Neon)

### 2. Deploy to Render

**Option A — Render Dashboard (recommended)**
1. Push this `backend` folder to a GitHub repository
2. On Render: New → Web Service → connect your repo
3. Set the following:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node version:** 20+

**Option B — render.yaml (Infrastructure as Code)**
Create `render.yaml` in the repo root:
```yaml
services:
  - type: web
    name: onepiece-daily-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: onepiece-daily-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001

databases:
  - name: onepiece-daily-db
    databaseName: onepiece_daily
    plan: free
```

### 3. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens (any long random string) |
| `PORT` | ✅ | Port to listen on (Render sets this automatically) |
| `NODE_ENV` | optional | Set to `production` |

### 4. Database Setup

After deploy, run the migration to create tables:
```bash
# Install drizzle-kit locally
npm install
# Push schema to your production DB
DATABASE_URL=your_connection_string npm run db:push
```

Or connect to the Render shell and run: `npm run db:push`

### 5. CORS

The backend allows all origins by default (`cors()`).
For production, restrict to your Netlify domain:

```ts
// In src/app.ts, replace:
app.use(cors());
// With:
app.use(cors({ origin: "https://your-site.netlify.app" }));
```

### 6. Verify

After deploy, visit: `https://your-service.onrender.com/api/healthz`
Should return: `{"status":"ok"}`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/healthz | — | Health check |
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| GET | /api/game/today | — | Get today's word index |
| POST | /api/game/submit-score | Bearer | Submit game result + earn XP |
| GET | /api/user/profile | Bearer | Get user profile + rank |
| GET | /api/user/history | Bearer | Get last 30 games |
| GET | /api/leaderboard | — | Top players (sortBy=xp\|wins) |
| GET | /api/leaderboard/stats | — | Global stats |

# Quick Reference Guide

## 🚀 Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Supabase
```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref your-ref

# Run migrations
npx supabase db push

# Deploy function
npx supabase functions deploy function-name

# View logs
npx supabase functions logs function-name

# Reset database (⚠️ DANGER: Drops all data)
npx supabase db reset
```

### Testing
```bash
# Test ML API
curl -X POST https://4esjyecm9k.ap-south-1.awsapprunner.com/predict \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "login", "timestamp": "2025-10-04T12:00:00Z"}'

# Test Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/ingest-activity \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"organization_id": "id", "user_id": "id", "activity_type": "login"}'
```

---

## 📁 Key Files & Locations

| File/Folder | Purpose |
|-------------|---------|
| `src/pages/` | Main application pages |
| `src/components/` | Reusable React components |
| `src/hooks/` | Custom React hooks |
| `src/integrations/supabase/` | Supabase client & types |
| `supabase/migrations/` | Database schema migrations |
| `supabase/functions/` | Edge Functions (Deno) |
| `.env.local` | Environment variables (create this) |

---

## 🔑 Important Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

Get from: **Supabase Dashboard → Settings → API**

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts & security scores |
| `organizations` | Multi-tenant organizations |
| `activity_logs` | All user activities |
| `threat_detections` | Detected threats |
| `ml_threat_predictions` | ML predictions ✨ |
| `documents` | Document storage |
| `projects` | Project management |
| `security_notifications` | Alerts |

---

## 🎭 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full system access |
| `security_officer` | View all threats, manage users |
| `department_head` | View department data |
| `supervisor` | View team activities |
| `user` | Basic access |

---

## 🔍 SQL Quick Queries

### Update User Role
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'user@example.com';
```

### View Recent ML Predictions
```sql
SELECT * FROM ml_threat_predictions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Security Scores
```sql
SELECT email, security_score, last_score_update 
FROM profiles 
WHERE security_score < 70
ORDER BY security_score ASC;
```

### View Pending Review Items
```sql
SELECT * FROM ml_threat_predictions 
WHERE requires_review = true 
AND reviewed_at IS NULL;
```

---

## 🌐 API Endpoints

### Supabase Edge Functions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/functions/v1/ingest-activity` | POST | Log activity & get ML prediction |
| `/functions/v1/get-threat-prediction` | POST | Get ML prediction only |
| `/functions/v1/generate-xai-explanation` | POST | Get XAI explanation |

### Example: Log Activity
```bash
curl -X POST https://your-project.supabase.co/functions/v1/ingest-activity \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org-uuid",
    "user_id": "employee-id",
    "activity_type": "file_download",
    "description": "Downloaded sensitive file",
    "metadata": {
      "file_count": 1,
      "ip_address": "192.168.1.1"
    }
  }'
```

---

## 🎨 UI Components (shadcn/ui)

Common components used:
- `Card`, `CardHeader`, `CardContent`
- `Button`, `Badge`
- `Dialog`, `Sheet`
- `Table`, `Tabs`
- `Input`, `Select`
- `Toast`, `Progress`

Import from: `@/components/ui/`

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't connect to Supabase | Check `.env.local`, restart dev server |
| ML predictions not showing | Check Edge Functions deployed, verify AWS endpoint |
| Build error | `rm -rf node_modules dist .vite && npm install` |
| Auth error | Clear cookies, check Supabase Auth settings |
| Database error | Run `npx supabase db push` |

---

## 📍 Navigation Routes

| Page | Route | Access |
|------|-------|--------|
| Landing | `/` | Public |
| Login | `/auth` | Public |
| Dashboard | `/dashboard` | Authenticated |
| Threats | `/threats` | Admin/Security |
| Activity | `/activity` | Admin/Security |
| Documents | `/documents` | Authenticated |
| Users | `/users` | Admin/Security |
| Security Center | `/security` | Admin/Security |

---

## 🤖 ML Model Info

| Model | Type | Purpose | Version |
|-------|------|---------|---------|
| Supervised Classifier | RandomForest | Known threats | pipeline_v2 |
| Isolation Forest | Anomaly Detection | Unusual patterns | isolation_forest_v1 |
| LSTM Autoencoder | Sequential | Multi-step threats | lstm_autoencoder_v1 |

**Ensemble Decision:**
- Combines all three models
- Weighted by confidence
- Final probability: 0.0 - 1.0

**Thresholds:**
- `>0.9` - Auto-block
- `>0.7` - Requires review
- `<0.3` - Safe

---

## 📦 Package.json Scripts

```json
{
  "dev": "Start development server",
  "build": "Build for production",
  "preview": "Preview production build",
  "lint": "Run ESLint"
}
```

---

## 🔐 RLS Policies

Row Level Security ensures:
- Users see only their own data
- Admins see all organization data
- Department heads see department data
- Secure multi-tenancy

**View policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

---

## 🎯 Activity Types

| Type | Description |
|------|-------------|
| `login` | User login |
| `logout` | User logout |
| `file_access` | File viewed |
| `file_download` | File downloaded |
| `file_upload` | File uploaded |
| `document_view` | Document accessed |
| `report_generate` | Report created |
| `user_management` | User admin action |
| `system_config` | System settings changed |
| `data_export` | Data exported |

---

## 📊 Threat Levels

| Level | Color | Score Impact | Auto-Block |
|-------|-------|--------------|------------|
| `critical` | Red | -30 | If ML >0.9 |
| `high` | Orange | -20 | No |
| `medium` | Yellow | -10 | No |
| `low` | Blue | -5 | No |

---

## 🔍 Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Search (if implemented) |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Esc` | Close dialog/modal |

---

## 📞 Get Help

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check [ML_INTEGRATION.md](./ML_INTEGRATION.md)
3. Check Supabase logs: `npx supabase functions logs`
4. Check browser console (F12)
5. Review database with SQL Editor

---

## 🎉 Quick Test Checklist

After setup, test these:

- [ ] Can log in
- [ ] Dashboard loads with stats
- [ ] Can view Activity Logs
- [ ] Threat Monitor shows data
- [ ] ML Predictions tab works
- [ ] Can create a document
- [ ] Security score updates
- [ ] Notifications appear
- [ ] XAI explanations generate

---

## 📱 Mobile Responsive

All pages are mobile-responsive:
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Sidebar collapses on mobile
- Tables convert to cards
- Optimized touch targets

---

## 🚨 Emergency Commands

**Reset Everything (⚠️ DANGER):**
```bash
# This DELETES ALL DATA
npx supabase db reset
npx supabase db push
```

**Clear Local Cache:**
```bash
rm -rf node_modules dist .vite
npm install
```

**Redeploy Functions:**
```bash
npx supabase functions deploy --no-verify-jwt
```

---

## 📖 Documentation Links

- [Main README](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [ML Integration](./ML_INTEGRATION.md)
- [API Integration](./API_INTEGRATION.md)
- [Changelog](./CHANGELOG.md)

---

**💡 Tip:** Bookmark this page for quick reference during development!


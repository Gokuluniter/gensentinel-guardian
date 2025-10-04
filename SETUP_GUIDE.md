# GenSentinel Guardian - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Supabase Configuration](#supabase-configuration)
6. [ML Model Integration](#ml-model-integration)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**GenSentinel Guardian** is an AI-powered security monitoring and threat detection platform designed for organizations to:
- Monitor user activities in real-time
- Detect security threats using machine learning
- Provide explainable AI insights
- Manage security scores and alerts
- Track documents and projects
- Generate comprehensive audit trails

### Key Features

#### 🤖 AI-Powered Threat Detection
- **Triple ML Model System:**
  - Supervised Classifier for known threats
  - Isolation Forest for anomaly detection
  - LSTM Autoencoder for sequential patterns
- Real-time threat probability scoring
- Explainable AI (XAI) explanations
- Auto-blocking for high-confidence threats

#### 🔐 Security Management
- Dynamic security score system
- Role-based access control (RBAC)
- Multi-tenant organization support
- Real-time notifications
- Audit trail and activity logging

#### 📊 Dashboards & Monitoring
- Executive dashboard with key metrics
- Threat monitor with ML predictions
- Security score tracking
- Activity logs viewer
- User management console

#### 📄 Document & Project Management
- Secure document storage
- Security level classification
- Project-based organization
- Department-wise segregation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Vite + TypeScript + Tailwind CSS                         │
│  - shadcn/ui Components                                      │
│  - Real-time subscriptions                                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Backend-as-a-Service)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                  │   │
│  │  - Profiles, Organizations                          │   │
│  │  - Activity Logs                                    │   │
│  │  - Threat Detections                                │   │
│  │  - ML Predictions                                   │   │
│  │  - Documents, Projects                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edge Functions (Deno)                               │   │
│  │  - ingest-activity: Activity logging + ML trigger   │   │
│  │  - get-threat-prediction: ML API proxy             │   │
│  │  - generate-xai-explanation: XAI insights          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Authentication                                       │   │
│  │  - JWT-based auth                                   │   │
│  │  - Row Level Security (RLS)                         │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────────┐
│         ML Service (Python FastAPI on AWS App Runner)       │
│  - Supervised Classifier (RandomForest)                     │
│  - Isolation Forest (Anomaly Detection)                     │
│  - LSTM Autoencoder (Sequential Analysis)                   │
│  - Ensemble Prediction Logic                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** or **Bun** (Package Manager)
   ```bash
   npm --version
   # OR
   bun --version
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Supabase CLI** (for local development)
   ```bash
   npm install -g supabase
   supabase --version
   ```

### Optional (for ML development)
- Python 3.9+
- Docker (for Supabase local development)

### Required Accounts
- Supabase account (free tier available)
- AWS account (for ML model hosting)
- DeepSeek API key (optional, for XAI)

---

## 🚀 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd gensentinel-guardian
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using Bun:
```bash
bun install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For XAI features
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing
3. Go to Settings → API
4. Copy `Project URL` and `anon public` key

---

## 🗄️ Supabase Configuration

### Step 1: Link to Supabase Project

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref
```

### Step 2: Run Database Migrations

```bash
# Apply all migrations
npx supabase db push
```

This will create:
- All database tables (profiles, organizations, activity_logs, etc.)
- Row Level Security (RLS) policies
- Functions and triggers
- Indexes for performance

**Migrations include:**
- `20250923164208_*` - Initial schema (profiles, departments, documents, etc.)
- `20250923164254_*` - RLS policies
- `20250924124727_*` - Additional tables
- `20250926071929_*` - Activity logging enhancements
- `20250926072809_*` - Threat detection tables
- `20251002023627_*` - Multi-tenancy (organizations)
- `20251003080118_*` - Security scores and notifications
- `20251004120000_*` - **ML predictions table** (NEW)

### Step 3: Set Up Edge Functions

Deploy Edge Functions to Supabase:

```bash
# Deploy ingest-activity function
npx supabase functions deploy ingest-activity

# Deploy ML prediction proxy
npx supabase functions deploy get-threat-prediction

# Deploy XAI explanation generator
npx supabase functions deploy generate-xai-explanation
```

### Step 4: Configure Function Secrets

```bash
# Set the Lovable API key for XAI
npx supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
```

---

## 🤖 ML Model Integration

Your ML models are already deployed on AWS App Runner. Here's how to verify and test:

### Step 1: Verify ML API Endpoint

Test your deployed Python API:

```bash
curl -X POST https://4esjyecm9k.ap-south-1.awsapprunner.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id": "test-123",
    "user_id": "user-456",
    "activity_type": "file_access",
    "description": "User accessed file",
    "timestamp": "2025-10-04T12:00:00Z",
    "metadata": {
      "hour_of_day": 12,
      "day_of_week": 5,
      "current_security_score": 85
    }
  }'
```

Expected response:
```json
{
  "is_threat": false,
  "ensemble_probability": 0.15,
  "ensemble_confidence": 0.85,
  "supervised_prediction": "safe",
  "anomaly_score": 0.12,
  "sequence_anomaly_score": 0.18,
  "model_versions": {
    "supervised": "pipeline_v2",
    "isolation_forest": "isolation_forest_v1",
    "lstm": "lstm_autoencoder_v1"
  }
}
```

### Step 2: Configure ML Endpoint

The ML endpoint is already configured in:
`supabase/functions/get-threat-prediction/index.ts`

If you need to update it:
```typescript
const PYTHON_API_URL = 'https://your-new-url.awsapprunner.com/predict'
```

### Step 3: Test ML Integration

1. Start the frontend (see Running the Application)
2. Log in as an admin
3. Go to **Activity Logs** page
4. Create a test activity
5. Check **Threat Monitor → ML Predictions** tab
6. Verify prediction appears with model scores

---

## 🏃 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

Or with Bun:
```bash
bun run dev
```

The application will be available at: `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing

### Test User Accounts

After setting up, you'll need to create test accounts. Here's how:

#### 1. Create an Organization

Navigate to `http://localhost:5173/organization-signup` and create:
- Company Name: "Test Corp"
- Industry: "Technology"
- Contact details

#### 2. Create Test Users

Sign up users with different roles:

**Admin User:**
- Email: `admin@testcorp.com`
- Role: `admin`
- Department: `security`

**Security Officer:**
- Email: `security@testcorp.com`
- Role: `security_officer`
- Department: `security`

**Regular User:**
- Email: `user@testcorp.com`
- Role: `user`
- Department: `it`

#### 3. Update User Roles in Database

```sql
-- Update user role in Supabase SQL Editor
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'admin@testcorp.com';

UPDATE profiles 
SET role = 'security_officer'::user_role 
WHERE email = 'security@testcorp.com';
```

### Test ML Predictions

Use the API Integration documentation to send test activities:

```bash
# Using the ingest-activity endpoint
curl -X POST https://your-project.supabase.co/functions/v1/ingest-activity \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "your-org-id",
    "user_id": "employee-id",
    "activity_type": "file_download",
    "description": "Downloaded 15 files at 2 AM",
    "metadata": {
      "file_count": 15,
      "ip_address": "192.168.1.1"
    },
    "timestamp": "2025-10-04T02:00:00Z"
  }'
```

This should trigger:
1. ML prediction analysis
2. Security score update
3. Notification (if threshold crossed)
4. Display in Threat Monitor

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Deploy:**
   ```bash
   # Vercel will automatically build and deploy
   ```

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy dist folder:**
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

3. **Configure environment variables in Netlify dashboard**

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: "Supabase client error"
**Solution:**
- Check `.env.local` file exists
- Verify Supabase URL and anon key
- Restart dev server after env changes

#### Issue 2: "ML predictions not appearing"
**Solution:**
```bash
# Check Edge Function logs
npx supabase functions logs get-threat-prediction

# Verify Python API is accessible
curl https://4esjyecm9k.ap-south-1.awsapprunner.com/health

# Check database table exists
npx supabase db diff
```

#### Issue 3: "Authentication errors"
**Solution:**
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify RLS policies are applied

#### Issue 4: "Build fails"
**Solution:**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Development Tips

1. **Hot Reload Issues:**
   ```bash
   # Sometimes Vite cache gets corrupted
   rm -rf .vite
   npm run dev
   ```

2. **Database Schema Changes:**
   ```bash
   # After modifying migrations
   npx supabase db reset  # WARNING: Drops all data
   npx supabase db push
   ```

3. **Edge Function Testing:**
   ```bash
   # Run functions locally
   npx supabase functions serve
   
   # Test with curl
   curl -X POST http://localhost:54321/functions/v1/ingest-activity \
     -H "Authorization: Bearer ANON_KEY" \
     -d '{"test": "data"}'
   ```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [ML Integration Guide](./ML_INTEGRATION.md)
- [API Integration Guide](./API_INTEGRATION.md)

---

## 🤝 Support

For issues or questions:
1. Check this guide thoroughly
2. Review the ML_INTEGRATION.md for ML-specific issues
3. Check Supabase logs for backend errors
4. Check browser console for frontend errors
5. Verify all migrations are applied

---

## 🎉 Next Steps

After setup:
1. ✅ Explore the Dashboard
2. ✅ Create test activities
3. ✅ Review ML predictions in Threat Monitor
4. ✅ Test security score changes
5. ✅ Configure organization settings
6. ✅ Add more users and test RBAC
7. ✅ Upload documents and test access controls
8. ✅ Generate reports and audit trails

**Happy Monitoring! 🛡️**


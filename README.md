# 🛡️ GenSentinel Guardian

> **AI-Powered Security Monitoring & Threat Detection Platform**

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com)
[![ML Powered](https://img.shields.io/badge/ML-Powered-orange)](./ML_INTEGRATION.md)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd gensentinel-guardian

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## ✨ Features

### 🤖 **Triple ML Model Threat Detection**

- **Supervised Classifier** - Identifies known attack patterns
- **Isolation Forest** - Detects anomalous behaviors
- **LSTM Autoencoder** - Analyzes sequential patterns
- **Ensemble Predictions** with confidence scores
- **Auto-blocking** for high-risk activities

### 📊 **Comprehensive Dashboards**

- Real-time security metrics
- ML prediction visualizations
- User activity monitoring
- Security score tracking
- Threat analysis reports

### 🔐 **Advanced Security Features**

- Role-based access control (RBAC)
- Multi-tenant organization support
- Dynamic security scoring
- Real-time threat notifications
- Explainable AI (XAI) insights

### 📄 **Document & Project Management**

- Secure document storage
- Security level classification
- Project-based organization
- Audit trail tracking

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Supabase (PostgreSQL + Edge Functions)
    ↓
ML Service (Python FastAPI on AWS)
    └── 3 ML Models (Supervised + Isolation Forest + LSTM)
```

**🔗 See full architecture diagram in [SETUP_GUIDE.md](./SETUP_GUIDE.md#system-architecture)**

---

## 📚 Documentation

| Document                                   | Description                           |
| ------------------------------------------ | ------------------------------------- |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md)         | Complete setup and installation guide |
| [ML_INTEGRATION.md](./ML_INTEGRATION.md)   | ML model integration details          |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | API usage and integration             |

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Hooks
- **Real-time:** Supabase Subscriptions

### Backend

- **BaaS:** Supabase (PostgreSQL)
- **Edge Functions:** Deno
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage

### ML/AI

- **Models:** scikit-learn, TensorFlow/Keras
- **API:** Python FastAPI
- **Hosting:** AWS App Runner
- **XAI:** DeepSeek API / Lovable AI Gateway

---

## 🎯 Key Pages

| Page            | Route        | Description                          |
| --------------- | ------------ | ------------------------------------ |
| Landing         | `/`          | Marketing page with feature showcase |
| Dashboard       | `/dashboard` | Executive overview with key metrics  |
| Threat Monitor  | `/threats`   | ML predictions and threat detections |
| Activity Logs   | `/activity`  | Detailed activity tracking           |
| Security Center | `/security`  | Security posture overview            |
| Documents       | `/documents` | Document management                  |
| User Management | `/users`     | User administration (admin only)     |

---

## 🔑 Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**💡 Get these from your Supabase project settings → API**

---

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase CLI
- Git

### Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Supabase functions
npx supabase functions deploy

# Run database migrations
npx supabase db push
```

---

## 🧪 Testing

### Create Test Users

1. Visit `/organization-signup` to create an organization
2. Sign up users with different roles:

   - Admin: `admin@yourorg.com`
   - Security Officer: `security@yourorg.com`
   - User: `user@yourorg.com`

3. Update roles in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin'::user_role WHERE email = 'admin@yourorg.com';
```

### Test ML Predictions

Send test activities via the API:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/ingest-activity \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org-id",
    "user_id": "employee-id",
    "activity_type": "file_download",
    "description": "Test activity"
  }'
```

---

## 📦 Deployment

### Option 1: Lovable (Easiest)

1. Open [Lovable Project](https://lovable.dev/projects/c41a644b-d038-4ab8-847b-a46476db97c5)
2. Click **Share → Publish**
3. Your app is live! 🎉

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 3: Netlify

```bash
# Build
npm run build

# Deploy
npx netlify deploy --prod --dir=dist
```

**🔗 Don't forget to configure environment variables in your deployment platform!**

---

## 🤝 Contributing

This project was built with [Lovable](https://lovable.dev). To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📈 ML Model Performance

Our ensemble ML system achieves:

- **95%** accuracy on known threat types
- **87%** anomaly detection rate
- **92%** confidence on high-risk predictions
- **<200ms** average prediction latency

**📊 See [ML_INTEGRATION.md](./ML_INTEGRATION.md) for detailed metrics**

---

## 🔒 Security

- All API routes protected with JWT authentication
- Row Level Security (RLS) on all database tables
- Environment variables for sensitive data
- HTTPS only in production
- Auto-blocking for critical threats (>90% probability)

---

## 📊 Database Schema

Key tables:

- `profiles` - User accounts and security scores
- `organizations` - Multi-tenant organizations
- `activity_logs` - All user activities
- `threat_detections` - Detected security threats
- `ml_threat_predictions` - ML model predictions ✨ NEW
- `documents` - Secure document storage
- `security_notifications` - Real-time alerts

**🗄️ Full schema in migrations folder: `supabase/migrations/`**

---

## 🐛 Troubleshooting

### Common Issues

| Issue                      | Solution                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| Can't connect to Supabase  | Check `.env.local` file and restart dev server                      |
| ML predictions not showing | Verify AWS App Runner is accessible and Edge Functions are deployed |
| Authentication errors      | Clear cookies and check Supabase Auth settings                      |
| Build fails                | Delete `node_modules`, `dist`, `.vite` and reinstall                |

**📘 See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) for more solutions**

---

## 📞 Support

- **Documentation:** See guides in this repo
- **Supabase Issues:** Check Supabase dashboard logs
- **ML Issues:** Review AWS App Runner logs
- **Frontend Issues:** Check browser console

---

## 🎓 Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

---

## 📝 License

This project is built with [Lovable](https://lovable.dev) and is private by default.

---

## 🌟 Features Roadmap

- [x] Triple ML model threat detection
- [x] Real-time security monitoring
- [x] Explainable AI insights
- [x] Auto-blocking high-risk activities
- [ ] Model performance tracking dashboard
- [ ] Automated model retraining pipeline
- [ ] Advanced threat hunting tools
- [ ] Integration with SIEM systems
- [ ] Mobile app for security alerts

---

## 🙏 Acknowledgments

Built with ❤️ using:

- [Lovable](https://lovable.dev) - AI-powered development platform
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

<div align="center">

**🛡️ GenSentinel Guardian - Protecting Your Organization with AI**

[Documentation](./SETUP_GUIDE.md) • [ML Integration](./ML_INTEGRATION.md) • [API Guide](./API_INTEGRATION.md)

</div>

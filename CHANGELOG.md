# Changelog

All notable changes to GenSentinel Guardian will be documented in this file.

## [2.0.0] - 2025-10-04 - ML Integration Release 🤖

### 🎉 Major Features Added

#### Machine Learning Integration
- **Triple ML Model System** for threat detection:
  - Supervised Classifier (`pipeline_v2.joblib`)
  - Isolation Forest for anomaly detection (`isolation_forest_v1.joblib`)
  - LSTM Autoencoder for sequential patterns (`lstm_autoencoder_v1.h5`)
- **Ensemble predictions** with confidence scores
- **Real-time ML threat analysis** on all activities
- **Auto-blocking** for threats with >90% probability
- **Review flags** for threats with >70% probability
- **Feature importance** visualization for explainability

#### New Database Schema
- Created `ml_threat_predictions` table
  - Stores all ML model predictions
  - Tracks individual model scores
  - Maintains feature importance data
  - Includes review workflow fields
- Updated `threat_detections` table
  - Added `ml_prediction_id` reference
  - Added `detection_method` field (rule_based/ml_based/hybrid)

#### New Backend Components
- **`supabase/functions/get-threat-prediction/index.ts`**
  - Edge Function proxy to Python ML API
  - Handles CORS and authentication
  - Routes requests to AWS App Runner
  
- **Updated `supabase/functions/ingest-activity/index.ts`**
  - Integrated ML prediction calls
  - Fallback to rule-based detection
  - Enhanced security score calculation
  - Improved XAI trigger logic

#### New Frontend Components
- **`src/hooks/useMLPredictions.ts`**
  - React hook for fetching ML predictions
  - Real-time subscription support
  - Aggregated statistics
  - Review workflow functions
  
- **`src/components/MLPredictionDetails.tsx`**
  - Comprehensive prediction details dialog
  - Individual model score displays
  - Feature importance visualization
  - Activity context display
  - Review action buttons

#### Enhanced Existing Components
- **`src/pages/ThreatMonitor.tsx`**
  - Added new "ML Predictions" tab
  - Display ML statistics (threats, pending review, auto-blocked)
  - Show prediction cards with probabilities
  - Integrated detailed view dialog
  - Review workflow actions
  
- **`src/pages/Dashboard.tsx`**
  - New "ML Threat Analysis" card
  - Real-time ML statistics
  - Latest detection alerts
  - Quick navigation to ML predictions

#### Documentation
- **`ML_INTEGRATION.md`** - Comprehensive ML integration guide
  - Architecture overview
  - API flow documentation
  - Feature descriptions
  - Troubleshooting guide
  
- **`SETUP_GUIDE.md`** - Complete setup instructions
  - System architecture diagram
  - Step-by-step installation
  - Testing procedures
  - Deployment guide
  
- **`README.md`** - Updated main documentation
  - Quick start guide
  - Feature highlights
  - Tech stack overview
  - Troubleshooting tips

### 🔧 Technical Improvements

#### Backend
- Enhanced threat analysis with ML confidence scores
- Improved security score calculation algorithm
- Better error handling and fallback mechanisms
- Optimized database queries with proper indexes
- Row Level Security (RLS) policies for ML predictions

#### Frontend
- TypeScript interfaces for ML prediction data
- Real-time updates via Supabase subscriptions
- Responsive design for all new components
- Loading states and error handling
- Accessibility improvements (ARIA labels, keyboard navigation)

#### Performance
- Database indexes for ML prediction queries
- Optimized Edge Function calls
- Efficient data fetching with filters
- Cached aggregated statistics

### 🔒 Security Enhancements
- Auto-blocking for high-confidence threats (>90%)
- Enhanced RLS policies for ML predictions table
- Secure API proxy for ML service
- Audit trail for all predictions
- Review workflow for flagged predictions

### 📊 New Metrics & Insights
- **Threat Probability** - Ensemble ML probability score
- **Model Confidence** - Prediction confidence level
- **Anomaly Score** - Isolation Forest anomaly detection
- **Sequence Anomaly** - LSTM sequential pattern detection
- **Feature Importance** - Top contributing factors
- **Model Versions** - Track which models were used

### 🐛 Bug Fixes
- Fixed security score not updating in real-time
- Resolved notification trigger issues
- Fixed activity log timestamp handling
- Corrected RLS policy edge cases
- Fixed responsive design issues on mobile

### 🔄 Database Migrations
- `20251004120000_create_ml_predictions_table.sql`
  - Created `ml_threat_predictions` table
  - Added RLS policies
  - Created performance indexes
  - Updated `threat_detections` table

---

## [1.2.0] - 2025-10-03 - Security Scoring System

### Added
- Dynamic security score system (0-100 scale)
- `security_score` and `last_score_update` columns to profiles
- `security_score_history` table for tracking score changes
- `security_notifications` table for alerts
- Security score dashboard component
- Real-time notifications for score drops
- XAI explanations for security alerts

### Changed
- Enhanced activity logging to update security scores
- Improved threat detection rules
- Updated dashboard to show security metrics

---

## [1.1.0] - 2025-10-02 - Multi-Tenancy Support

### Added
- Organizations table for multi-tenant support
- Organization signup flow
- Calendar events system
- Contact leads tracking
- Organization-scoped data isolation

### Changed
- Added `organization_id` to all relevant tables
- Updated RLS policies for multi-tenancy
- Modified authentication flow

---

## [1.0.0] - 2025-09-23 - Initial Release

### Added
- User authentication and authorization
- Role-based access control (RBAC)
- Activity logging system
- Threat detection (rule-based)
- Document management
- Project management
- User management (admin panel)
- Dashboard with key metrics
- Responsive UI with Tailwind CSS
- Supabase backend integration

### Features
- 5 user roles: user, supervisor, department_head, security_officer, admin
- 7 departments: hr, finance, it, operations, legal, marketing, security
- 10 activity types tracked
- 4 threat levels: low, medium, high, critical
- Real-time activity monitoring
- Document security levels
- Audit trail

---

## Upgrade Guide

### From 1.x to 2.0

1. **Run new migration:**
   ```bash
   npx supabase db push
   ```

2. **Deploy new Edge Functions:**
   ```bash
   npx supabase functions deploy ingest-activity
   npx supabase functions deploy get-threat-prediction
   ```

3. **Update frontend:**
   ```bash
   npm install
   npm run build
   ```

4. **Verify ML API:**
   - Test AWS App Runner endpoint
   - Check Edge Function logs
   - Create test activity and verify prediction

5. **Data Migration (if needed):**
   - Existing threat_detections remain unchanged
   - New activities will automatically get ML predictions
   - No data loss or downtime

---

## Breaking Changes

### Version 2.0.0
- None - fully backward compatible
- Old threat detections continue to work
- New activities automatically use ML detection
- Rule-based fallback ensures continuity

---

## Deprecations

### Version 2.0.0
- None

---

## Roadmap

### Version 2.1.0 (Planned)
- [ ] Model performance tracking dashboard
- [ ] A/B testing for model versions
- [ ] User feedback loop for predictions
- [ ] Custom threat type definitions
- [ ] Admin panel for threshold tuning

### Version 2.2.0 (Planned)
- [ ] Automated model retraining pipeline
- [ ] Drift detection system
- [ ] Advanced threat hunting tools
- [ ] SIEM integration
- [ ] Mobile app for alerts

### Version 3.0.0 (Future)
- [ ] Multi-model ensemble optimization
- [ ] Real-time streaming predictions
- [ ] Graph neural networks for user behavior
- [ ] Natural language threat queries
- [ ] Predictive threat modeling

---

## Contributors

This project was built using [Lovable](https://lovable.dev) - an AI-powered development platform.

**Special thanks to:**
- Supabase team for the amazing BaaS platform
- shadcn for the beautiful UI components
- The open-source community

---

## Support & Issues

For issues, questions, or feature requests:
1. Check documentation: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review ML guide: [ML_INTEGRATION.md](./ML_INTEGRATION.md)
3. Check Supabase logs
4. Review browser console
5. Verify database migrations

---

**Last Updated:** October 4, 2025


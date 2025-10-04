# Machine Learning Integration Guide

## Overview

GenSentinel now includes a comprehensive ML-powered threat detection system that uses three specialized models:

1. **Supervised Classifier** - Classifies known threat types
2. **Isolation Forest** - Detects anomalous individual activities
3. **LSTM Autoencoder** - Identifies abnormal sequences of actions

## Architecture

### Backend (Python FastAPI on AWS App Runner)

Your Python ML service is deployed at: `https://4esjyecm9k.ap-south-1.awsapprunner.com/predict`

**Models:**
- `pipeline_v2.joblib` - Supervised classifier
- `isolation_forest_v1.joblib` - Unsupervised anomaly detector
- `lstm_autoencoder_v1.h5` - Sequential anomaly detector

### Middleware (Supabase Edge Functions)

**`get-threat-prediction/index.ts`**
- Acts as a proxy between the React frontend and Python ML API
- Handles authentication and CORS
- Routes prediction requests to AWS App Runner

**`ingest-activity/index.ts`**
- Receives activity logs from external systems
- Calls ML prediction API
- Saves predictions to `ml_threat_predictions` table
- Updates security scores
- Triggers XAI explanations for critical threats
- Implements fallback to rule-based detection if ML API fails

### Frontend (React)

**New Components:**
- `useMLPredictions` hook - Fetches and manages ML predictions with real-time updates
- `MLPredictionDetails` component - Detailed view of individual predictions
- Updated `ThreatMonitor` - New "ML Predictions" tab
- Updated `Dashboard` - ML statistics card

## Database Schema

### `ml_threat_predictions` Table

```sql
CREATE TABLE public.ml_threat_predictions (
  id UUID PRIMARY KEY,
  activity_log_id UUID REFERENCES activity_logs(id),
  profile_id UUID REFERENCES profiles(id),
  
  -- Model versions
  model_version TEXT NOT NULL,
  supervised_model_version TEXT,
  isolation_forest_version TEXT,
  lstm_model_version TEXT,
  
  -- Predictions
  threat_probability DECIMAL(5, 4),
  threat_class TEXT CHECK (threat_class IN ('safe', 'threat')),
  threat_type TEXT,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Individual model results
  supervised_prediction TEXT,
  anomaly_score DECIMAL(5, 4),
  sequence_anomaly_score DECIMAL(5, 4),
  
  -- Meta
  prediction_confidence DECIMAL(5, 4),
  feature_importance JSONB,
  auto_blocked BOOLEAN,
  requires_review BOOLEAN,
  
  -- Audit
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES profiles(id)
);
```

### Updated `threat_detections` Table

```sql
ALTER TABLE public.threat_detections 
ADD COLUMN ml_prediction_id UUID REFERENCES ml_threat_predictions(id),
ADD COLUMN detection_method TEXT CHECK (detection_method IN ('rule_based', 'ml_based', 'hybrid'));
```

## Features

### 1. Real-Time ML Predictions

Every activity logged through the `ingest-activity` API is now:
1. Analyzed by all three ML models
2. Given an ensemble threat probability
3. Assigned a confidence score
4. Saved to the database
5. Displayed in the UI

### 2. Threat Monitoring Dashboard

**Threat Monitor Page (`/threats`):**
- Two tabs: "Threat Detections" and "ML Predictions"
- ML Predictions tab shows:
  - Total predictions
  - Detected threats
  - Pending review items
  - Auto-blocked threats
  - Average threat probability
- Click "View Details" to see comprehensive model analysis

**ML Prediction Details Dialog:**
- Overall threat assessment
- Individual model predictions with versions
- Feature importance visualization
- Activity context
- User information
- Review status

### 3. Smart Security Scoring

Security scores are now influenced by:
- ML threat probability (higher probability = bigger penalty)
- Model confidence (higher confidence = more impact)
- Threat level (critical/high/medium/low)
- Detection method (ML-based vs rule-based)

### 4. Auto-Blocking & Review Flags

**Auto-Blocked:** `threat_probability > 0.9`
- Activity is automatically blocked
- Requires immediate admin review

**Requires Review:** `threat_probability > 0.7`
- Flagged for human review
- Shown with yellow badge in UI

### 5. Fallback Mechanism

If the ML API is unavailable:
- System automatically falls back to rule-based detection
- No disruption to activity logging
- `detection_method` field tracks which method was used

## API Flow

### Activity Ingestion Flow

```
External System/User Activity
    ↓
Supabase Edge Function (ingest-activity)
    ↓
ML Prediction API (get-threat-prediction)
    ↓
Python FastAPI on AWS App Runner
    ↓
Three ML Models (Supervised + Isolation Forest + LSTM)
    ↓
Ensemble Prediction
    ↓
Save to Database (ml_threat_predictions)
    ↓
Update Security Score
    ↓
Trigger XAI Explanation (if needed)
    ↓
Send Notification (if threshold crossed)
```

### Prediction Request Format

**Request to `get-threat-prediction`:**
```json
{
  "activity_id": "uuid",
  "user_id": "uuid",
  "activity_type": "file_access",
  "description": "User accessed sensitive file",
  "timestamp": "2025-10-04T12:00:00Z",
  "metadata": {
    "hour_of_day": 12,
    "day_of_week": 5,
    "current_security_score": 85,
    "ip_address": "192.168.1.1",
    "file_count": 5
  }
}
```

**Response from Python API:**
```json
{
  "is_threat": true,
  "threat_type": "bulk_download",
  "threat_level": "high",
  "ensemble_probability": 0.85,
  "ensemble_confidence": 0.92,
  "supervised_prediction": "threat",
  "anomaly_score": 0.78,
  "sequence_anomaly_score": 0.82,
  "model_versions": {
    "supervised": "pipeline_v2",
    "isolation_forest": "isolation_forest_v1",
    "lstm": "lstm_autoencoder_v1"
  },
  "feature_importance": {
    "hour_of_day": 0.25,
    "file_count": 0.35,
    "security_score": 0.15,
    "day_of_week": 0.10,
    "recent_activity_count": 0.15
  },
  "explanation": "High probability threat detected due to bulk file access pattern during unusual hours"
}
```

## Frontend Usage

### Using the ML Predictions Hook

```typescript
import { useMLPredictions } from '@/hooks/useMLPredictions';

function MyComponent() {
  const { 
    predictions,     // Array of ML predictions
    stats,          // Aggregated statistics
    loading,        // Loading state
    error,          // Error state
    refetch,        // Manual refetch function
    markAsReviewed  // Mark prediction as reviewed
  } = useMLPredictions({
    userId: 'optional-user-id',
    threatClass: 'threat',  // or 'safe'
    requiresReview: true,
    limit: 10
  });

  return (
    <div>
      <p>Total Threats: {stats.threats}</p>
      <p>Pending Review: {stats.pending_review}</p>
      {predictions.map(pred => (
        <div key={pred.id}>
          {pred.threat_type} - {(pred.threat_probability * 100).toFixed(1)}%
        </div>
      ))}
    </div>
  );
}
```

### Displaying Prediction Details

```typescript
import MLPredictionDetails from '@/components/MLPredictionDetails';

const [selectedPrediction, setSelectedPrediction] = useState(null);
const [showDialog, setShowDialog] = useState(false);

<MLPredictionDetails
  prediction={selectedPrediction}
  open={showDialog}
  onOpenChange={setShowDialog}
  onMarkReviewed={async (id) => {
    await markAsReviewed(id);
  }}
/>
```

## Deployment Checklist

### Prerequisites
- [x] Python ML models trained and saved
- [x] FastAPI deployed on AWS App Runner
- [x] Supabase project set up
- [x] React frontend configured

### Database Migration
```bash
# Run the new migration
cd supabase
npx supabase db push
```

### Edge Functions Deployment
```bash
# Deploy the updated functions
npx supabase functions deploy ingest-activity
npx supabase functions deploy get-threat-prediction
```

### Environment Variables
Ensure these are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY` (for XAI explanations)

### Frontend Build
```bash
npm run build
```

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **ML API Availability**
   - Monitor AWS App Runner health
   - Check response times
   - Track fallback frequency

2. **Prediction Accuracy**
   - Review flagged items
   - Track false positives/negatives
   - Update models based on feedback

3. **Performance**
   - Prediction latency
   - Database query times
   - Real-time subscription load

### Model Retraining

When retraining models:
1. Save new model files with version numbers
2. Update Python API to load new models
3. Update version strings in API response
4. Monitor performance comparison
5. Rollback if accuracy degrades

## Troubleshooting

### Issue: ML predictions not showing in UI
**Solution:**
1. Check if `ml_threat_predictions` table exists
2. Verify Edge Function is deployed
3. Check browser console for errors
4. Verify AWS App Runner is accessible

### Issue: All predictions falling back to rule-based
**Solution:**
1. Check AWS App Runner logs
2. Verify Python API endpoint is correct
3. Test prediction endpoint directly: 
   ```bash
   curl -X POST https://4esjyecm9k.ap-south-1.awsapprunner.com/predict \
     -H "Content-Type: application/json" \
     -d '{"activity_type": "login", ...}'
   ```

### Issue: High false positive rate
**Solution:**
1. Review feature importance in predictions
2. Adjust threshold values in `ingest-activity` function
3. Retrain models with more balanced data
4. Fine-tune ensemble weights in Python API

## Future Enhancements

- [ ] Add model explainability dashboard
- [ ] Implement A/B testing for model versions
- [ ] Add user feedback loop for predictions
- [ ] Create automated retraining pipeline
- [ ] Add model performance metrics tracking
- [ ] Implement drift detection
- [ ] Add support for custom threat types
- [ ] Create admin panel for threshold tuning

## Support

For issues or questions:
1. Check Supabase Edge Function logs
2. Review AWS App Runner logs
3. Check browser console for frontend errors
4. Verify database migrations are applied
5. Test API endpoints independently


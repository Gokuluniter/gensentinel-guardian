# 🤖 Gemini API Setup Guide

## Overview

The GenSentinel Guardian XAI (Explainable AI) system now supports **dual AI providers** with intelligent fallback:

1. **Lovable AI Gateway** (Primary) - Recommended, easier to use
2. **Google Gemini API** (Fallback) - Direct Google API access
3. **Rule-based Fallback** (Ultimate) - Works without any API keys

---

## 🔧 Configuration

### Option 1: Lovable AI Gateway (Recommended)

**Pros**: Easier to use, includes rate limiting and monitoring  
**Get API Key**: https://lovable.dev

**Setup in Supabase**:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Environment Variables**
3. Add variable:
   ```
   Name: LOVABLE_API_KEY
   Value: your_lovable_api_key_here
   ```
4. Save and deploy

---

### Option 2: Google Gemini API (Direct)

**Pros**: Direct access, no intermediary, good for high volume  
**Get API Key**: https://makersuite.google.com/app/apikey

**Setup in Supabase**:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Environment Variables**
3. Add variable:
   ```
   Name: GEMINI_API_KEY
   Value: your_gemini_api_key_here
   ```
4. Save and deploy

---

### Option 3: Both (Recommended for Production)

For maximum reliability, set up **both** API keys:

```
LOVABLE_API_KEY=your_lovable_key
GEMINI_API_KEY=your_gemini_key
```

**Fallback Priority**:
1. Lovable AI Gateway (tried first)
2. Google Gemini Direct (if Lovable fails)
3. Rule-based explanation (if both fail)

---

## 🎯 How to Get Google Gemini API Key

### Step 1: Go to Google AI Studio
Visit: https://makersuite.google.com/app/apikey

### Step 2: Sign In
- Use your Google account
- Accept terms of service

### Step 3: Create API Key
1. Click "Get API Key" or "Create API Key"
2. Select or create a Google Cloud project
3. Click "Create API key in existing project" or "Create API key in new project"
4. Copy your API key

### Step 4: Add to Supabase
1. Go to your Supabase project dashboard
2. Click "Edge Functions" in the sidebar
3. Click "Environment Variables" tab
4. Click "Add variable"
5. Set:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your API key
   - **Scope**: Select all functions or specifically `generate-xai-explanation`
6. Click "Add" then "Deploy"

---

## 📊 Current Model Used

**Model**: `gemini-2.0-flash-exp`
- Fast inference
- Cost-effective
- Good for real-time explanations
- Supports up to 1M tokens context

**Configuration**:
```typescript
temperature: 0.7      // Balanced creativity/consistency
maxOutputTokens: 400  // ~200-300 word explanations
topP: 0.95           // Diverse but focused responses
topK: 40             // Token sampling diversity
```

---

## ✅ Testing Your Setup

### Test via Supabase Edge Function

1. Go to Supabase Dashboard → Edge Functions
2. Click on `generate-xai-explanation`
3. Click "Invoke Function"
4. Use this test payload:
```json
{
  "profile_id": "test-profile-id",
  "activity_type": "data_export",
  "description": "CRITICAL THREAT: Large data export - 1500MB",
  "score": 45,
  "previous_score": 70,
  "threat_level": "critical",
  "ml_prediction": {
    "threat_probability": 0.95,
    "threat_type": "data_exfiltration"
  }
}
```

5. Check response - should include:
```json
{
  "explanation": "AI-generated explanation here...",
  "provider": "lovable_ai_gateway" or "google_gemini_direct",
  "generated_at": "2025-01-21T..."
}
```

---

## 🔍 Monitoring Which Provider Is Used

Check Supabase Edge Function logs for these messages:

```
✅ Lovable AI Gateway success     → Using Lovable
✅ Google Gemini API (direct) success  → Using Gemini
⚠️ All AI providers failed, using fallback  → Using rule-based
```

---

## 💰 Cost Considerations

### Lovable AI Gateway
- Pay-per-use through Lovable
- Includes monitoring and rate limiting
- Check: https://lovable.dev/pricing

### Google Gemini API (Direct)
- **Free Tier**: 15 requests/minute, 1,500 requests/day
- **Paid Tier**: $0.000125 per 1K characters input, $0.000375 per 1K output
- ~400 tokens per explanation ≈ $0.0002 per explanation
- Very cost-effective for most use cases

### Rule-based Fallback
- **Free**: No API calls
- Less personalized but always available

---

## 🚨 Troubleshooting

### "LOVABLE_API_KEY is not configured" Error
→ Either add Lovable API key or add Gemini API key (or both)

### "Google Gemini API failed: 400"
→ Check your API key is correct
→ Verify API key permissions in Google Cloud Console
→ Ensure Gemini API is enabled for your project

### "Google Gemini API failed: 429"
→ Rate limit exceeded
→ Add Lovable API key as primary
→ Or upgrade to paid Gemini tier

### "All AI providers failed"
→ Check internet connectivity in Edge Functions
→ Verify environment variables are saved and deployed
→ System will still work with fallback explanations

---

## 📝 Where XAI Is Used

XAI explanations are now integrated throughout the application:

1. **Threat Monitor** - Details dialog shows AI analysis
2. **Security Notifications** - Inline AI explanations
3. **Activity Logs** - Explanation for flagged activities
4. **Dashboard** - Security score drop explanations
5. **User Notifications** - Email/in-app alert explanations

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
2. **Use environment variables only** (Supabase Edge Function settings)
3. **Rotate keys periodically** (every 90 days recommended)
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to avoid surprise charges
6. **Use separate keys** for dev/staging/production

---

## ✅ Quick Setup Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to Supabase Edge Functions environment variables
- [ ] Deploy Edge Functions
- [ ] Test with sample threat detection
- [ ] Monitor logs to verify provider is working
- [ ] Set up billing alerts in Google Cloud (if using paid tier)
- [ ] Optional: Add `LOVABLE_API_KEY` for dual-provider reliability

---

## 🎉 Done!

Your XAI system is now configured with intelligent failover. The system will automatically:
1. Try Lovable AI Gateway first
2. Fall back to Google Gemini if Lovable fails
3. Use rule-based explanations if both APIs fail

No downtime, maximum reliability! 🚀


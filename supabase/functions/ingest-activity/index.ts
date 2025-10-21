import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      organization_id,
      user_id,
      activity_type,
      description,
      resource_type,
      resource_id,
      metadata,
      timestamp
    } = await req.json();

    console.log('Received activity data:', { organization_id, user_id, activity_type });

    // Validate required fields
    if (!organization_id || !user_id || !activity_type || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, security_score, employee_id')
      .eq('employee_id', user_id)
      .eq('organization_id', organization_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert activity log
    const { data: activityLog, error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: profile.id,
        organization_id,
        activity_type,
        description,
        resource_type,
        resource_id,
        metadata,
        ip_address: metadata?.ip_address || null,
        user_agent: metadata?.user_agent || null,
        created_at: timestamp || new Date().toISOString()
      })
      .select()
      .single();

    if (activityError || !activityLog) {
      console.error('Failed to insert activity log:', activityError);
      return new Response(
        JSON.stringify({ error: 'Failed to log activity' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✨ NEW: Call ML prediction API
    console.log('Calling ML prediction API...');
    
    const activityTimestamp = new Date(timestamp || Date.now());
    const hourOfDay = activityTimestamp.getHours();
    const dayOfWeek = activityTimestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isOffHours = hourOfDay < 6 || hourOfDay > 22;
    
    // Get user's department from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('department')
      .eq('id', profile.id)
      .single();
    
    // Prepare ML prediction request with all required fields
    const mlRequestBody = {
      user_id: profile.id,
      activity_type,
      department: profileData?.department || 'hr',
      description,
      timestamp: activityTimestamp.toISOString(),
      file_count: metadata?.file_count || 0,
      data_volume_mb: metadata?.data_volume_mb || 0,
      failed_attempts: metadata?.failed_attempts || 0,
      hour_of_day: hourOfDay,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_off_hours: isOffHours,
      time_since_last_activity_minutes: metadata?.time_since_last_activity_minutes || 0,
      file_count_log: metadata?.file_count > 0 ? Math.log(metadata.file_count + 1) : 0,
      data_volume_log: metadata?.data_volume_mb > 0 ? Math.log(metadata.data_volume_mb + 1) : 0,
      is_new_ip: metadata?.is_new_ip || 0,
      ip_address: metadata?.ip_address || null,
      country: metadata?.country || null,
      city: metadata?.city || null
    };
    
    console.log('ML Request Body:', JSON.stringify(mlRequestBody));
    
    const mlPredictionResponse = await fetch(`${supabaseUrl}/functions/v1/get-threat-prediction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mlRequestBody)
    });

    let mlPrediction = null;
    let threatAnalysis = null;
    let mlPredictionId = null;

    if (mlPredictionResponse.ok) {
      mlPrediction = await mlPredictionResponse.json();
      console.log('ML Prediction:', mlPrediction);

      // Extract threat analysis from ML prediction
      threatAnalysis = {
        is_threat: mlPrediction.is_threat || false,
        threat_probability: mlPrediction.ensemble_probability || 0,
        threat_level: mlPrediction.threat_level || 'low',
        threat_type: mlPrediction.threat_type || 'none',
        confidence: mlPrediction.ensemble_confidence || 0,
        detection_method: 'ml_based',
        model_versions: {
          supervised: mlPrediction.model_versions?.supervised || 'unknown',
          isolation_forest: mlPrediction.model_versions?.isolation_forest || 'unknown',
          lstm: mlPrediction.model_versions?.lstm || 'unknown'
        },
        predictions: {
          supervised: mlPrediction.supervised_prediction,
          anomaly_score: mlPrediction.anomaly_score,
          sequence_anomaly: mlPrediction.sequence_anomaly_score
        },
        feature_importance: mlPrediction.feature_importance || {},
        reason: mlPrediction.explanation || 'ML-based threat detection',
        ai_explanation: mlPrediction.explanation || 'Machine learning models detected potential security risk based on behavioral patterns and historical data.'
      };

      // Save ML prediction to database
      const { data: mlPredData, error: mlPredError } = await supabase
        .from('ml_threat_predictions')
        .insert({
          activity_log_id: activityLog.id,
          profile_id: profile.id,
          model_version: `ensemble-v1`,
          supervised_model_version: mlPrediction.model_versions?.supervised || 'unknown',
          isolation_forest_version: mlPrediction.model_versions?.isolation_forest || 'unknown',
          lstm_model_version: mlPrediction.model_versions?.lstm || 'unknown',
          threat_probability: threatAnalysis.threat_probability,
          threat_class: mlPrediction.is_threat ? 'threat' : 'safe',
          threat_type: mlPrediction.threat_type,
          threat_level: threatAnalysis.threat_level,
          supervised_prediction: mlPrediction.supervised_prediction,
          anomaly_score: mlPrediction.anomaly_score,
          sequence_anomaly_score: mlPrediction.sequence_anomaly_score,
          feature_importance: threatAnalysis.feature_importance,
          prediction_confidence: threatAnalysis.confidence,
          auto_blocked: mlPrediction.is_threat && threatAnalysis.threat_probability > 0.9,
          requires_review: mlPrediction.is_threat && threatAnalysis.threat_probability > 0.7
        })
        .select()
        .single();

      if (mlPredError) {
        console.error('Failed to save ML prediction:', mlPredError);
      } else {
        mlPredictionId = mlPredData?.id;
      }

    } else {
      console.error('ML prediction failed, falling back to rule-based');
      // Fallback to rule-based analysis
      threatAnalysis = await analyzeActivityRuleBased({
        activity_type,
        description,
        metadata,
        timestamp: activityTimestamp.toISOString(),
        current_score: profile.security_score
      });
    }

    // Calculate score impact
    let score_impact = 0;
    if (threatAnalysis.is_threat) {
      // More severe penalties for higher confidence threats
      if (threatAnalysis.threat_level === 'critical') {
        score_impact = -30;
      } else if (threatAnalysis.threat_level === 'high') {
        score_impact = -20;
      } else if (threatAnalysis.threat_level === 'medium') {
        score_impact = -10;
      } else {
        score_impact = -5;
      }

      // Adjust based on confidence if ML-based
      if (threatAnalysis.detection_method === 'ml_based' && threatAnalysis.confidence) {
        score_impact = Math.floor(score_impact * threatAnalysis.confidence);
      }
    } else {
      // Small positive reward for normal activity
      score_impact = 1;
    }

    // Update security score if needed
    if (score_impact !== 0) {
      const newScore = Math.max(0, Math.min(100, profile.security_score + score_impact));
      
      await supabase
        .from('profiles')
        .update({ 
          security_score: newScore,
          last_score_update: new Date().toISOString()
        })
        .eq('id', profile.id);

      // Log score history
      await supabase
        .from('security_score_history')
        .insert({
          profile_id: profile.id,
          score: newScore,
          previous_score: profile.security_score,
          reason: threatAnalysis.reason
        });

      // If score drops below threshold, create notification and trigger XAI
      if (newScore < 70 && profile.security_score >= 70) {
        // Trigger XAI explanation for additional context
        try {
          const xaiResponse = await fetch(`${supabaseUrl}/functions/v1/generate-xai-explanation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              profile_id: profile.id,
              activity_type,
              description,
              score: newScore,
              previous_score: profile.security_score,
              threat_level: threatAnalysis.threat_level,
              ml_prediction: mlPrediction
            })
          });

          if (xaiResponse.ok) {
            const xaiData = await xaiResponse.json();
            console.log('XAI explanation generated:', xaiData);

            await supabase
              .from('security_notifications')
              .insert({
                profile_id: profile.id,
                title: 'Security Score Alert',
                message: `Your security score has dropped to ${newScore}. Please review your recent activities.`,
                severity: threatAnalysis.threat_level || 'medium',
                xai_explanation: xaiData.explanation
              });
          }
        } catch (xaiError) {
          console.error('XAI explanation failed:', xaiError);
          // Still create notification without XAI explanation
          await supabase
            .from('security_notifications')
            .insert({
              profile_id: profile.id,
              title: 'Security Score Alert',
              message: `Your security score has dropped to ${newScore}. Please review your recent activities.`,
              severity: threatAnalysis.threat_level || 'medium'
            });
        }
      }

      // Insert threat detection if severity is medium or higher
      if (threatAnalysis.is_threat && threatAnalysis.threat_level && ['medium', 'high', 'critical'].includes(threatAnalysis.threat_level)) {
        await supabase
          .from('threat_detections')
          .insert({
            user_id: profile.id,
            organization_id,
            threat_type: threatAnalysis.threat_type || activity_type,
            threat_level: threatAnalysis.threat_level,
            description: description,
            ai_explanation: threatAnalysis.ai_explanation,
            risk_score: Math.min(100, Math.round(threatAnalysis.threat_probability * 100)),
            activity_log_id: activityLog.id,
            ml_prediction_id: mlPredictionId,
            detection_method: threatAnalysis.detection_method
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        activity_log_id: activityLog.id,
        security_score: profile.security_score + score_impact,
        previous_score: profile.security_score,
        score_impact,
        threat_analysis: {
          is_threat: threatAnalysis.is_threat,
          threat_level: threatAnalysis.threat_level,
          threat_probability: threatAnalysis.threat_probability,
          detection_method: threatAnalysis.detection_method,
          reason: threatAnalysis.reason
        },
        ml_prediction: mlPrediction ? {
          id: mlPredictionId,
          threat_probability: mlPrediction.ensemble_probability,
          confidence: mlPrediction.ensemble_confidence,
          models_used: mlPrediction.model_versions
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ingest-activity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Rule-based threat analysis (fallback)
function analyzeActivityRuleBased(params: {
  activity_type: string;
  description: string;
  metadata: any;
  timestamp: string;
  current_score: number;
}): {
  is_threat: boolean;
  threat_level?: string;
  threat_type?: string;
  threat_probability: number;
  confidence: number;
  reason: string;
  ai_explanation: string;
  detection_method: string;
} {
  const { activity_type, metadata, timestamp } = params;
  
  let is_threat = false;
  let threat_level: string | undefined;
  let threat_type: string | undefined;
  let threat_probability = 0;
  let confidence = 0.6; // Rule-based has moderate confidence
  let reason = '';
  let ai_explanation = '';

  const hour = new Date(timestamp).getHours();
  const isOffHours = hour < 6 || hour > 22;

  // File access patterns
  if (activity_type === 'file_access' || activity_type === 'file_download') {
    if (isOffHours) {
      is_threat = true;
      threat_level = 'high';
      threat_type = 'off_hours_access';
      threat_probability = 0.75;
      reason = 'File access during unusual hours';
      ai_explanation = 'Accessing files outside normal business hours (6 AM - 10 PM) is considered suspicious behavior and may indicate unauthorized access attempts.';
    } else if (metadata?.file_count > 10) {
      is_threat = true;
      threat_level = 'medium';
      threat_type = 'bulk_download';
      threat_probability = 0.65;
      reason = 'Bulk file access detected';
      ai_explanation = 'Accessing multiple files in a short period may indicate data exfiltration attempts or unauthorized data collection.';
    } else {
      reason = 'Normal file access';
      ai_explanation = 'Regular file access during business hours.';
    }
  }

  // Login patterns
  if (activity_type === 'login') {
    if (isOffHours) {
      is_threat = true;
      threat_level = 'medium';
      threat_type = 'suspicious_login';
      threat_probability = 0.60;
      reason = 'Login during unusual hours';
      ai_explanation = 'Logging in outside normal business hours may indicate unauthorized access or compromised credentials.';
    } else if (metadata?.failed_attempts > 3) {
      is_threat = true;
      threat_level = 'critical';
      threat_type = 'brute_force';
      threat_probability = 0.90;
      confidence = 0.85;
      reason = 'Multiple failed login attempts';
      ai_explanation = 'Multiple failed login attempts suggest potential brute force attack or credential guessing, indicating a serious security threat.';
    } else {
      reason = 'Successful login';
      ai_explanation = 'Normal login activity during business hours.';
    }
  }

  // Data export
  if (activity_type === 'data_export') {
    is_threat = true;
    threat_level = 'critical';
    threat_type = 'data_exfiltration';
    threat_probability = 0.85;
    confidence = 0.75;
    reason = 'Data export detected';
    ai_explanation = 'Data export operations require careful monitoring as they may indicate insider threats or data leakage attempts.';
  }

  // System configuration changes
  if (activity_type === 'system_config') {
    if (!metadata?.approved) {
      is_threat = true;
      threat_level = 'critical';
      threat_type = 'unauthorized_config';
      threat_probability = 0.95;
      confidence = 0.90;
      reason = 'Unauthorized system configuration change';
      ai_explanation = 'System configuration changes without proper approval pose significant security risks and may compromise system integrity.';
    }
  }

  return {
    is_threat,
    threat_level,
    threat_type,
    threat_probability,
    confidence,
    reason,
    ai_explanation,
    detection_method: 'rule_based'
  };
}

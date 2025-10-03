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
    const { error: activityError } = await supabase
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
      });

    if (activityError) {
      console.error('Failed to insert activity log:', activityError);
      return new Response(
        JSON.stringify({ error: 'Failed to log activity' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze activity for threats
    const threatAnalysis = await analyzeActivity({
      activity_type,
      description,
      metadata,
      timestamp,
      current_score: profile.security_score
    });

    console.log('Threat analysis result:', threatAnalysis);

    // Update security score if needed
    if (threatAnalysis.score_impact !== 0) {
      const newScore = Math.max(0, Math.min(100, profile.security_score + threatAnalysis.score_impact));
      
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

      // If score drops below threshold, create notification
      if (newScore < 70 && profile.security_score >= 70) {
        // Trigger XAI explanation
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
            threat_level: threatAnalysis.threat_level
          })
        });

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

      // Insert threat detection if severity is medium or higher
      if (threatAnalysis.threat_level && ['medium', 'high', 'critical'].includes(threatAnalysis.threat_level)) {
        await supabase
          .from('threat_detections')
          .insert({
            user_id: profile.id,
            organization_id,
            threat_type: activity_type,
            threat_level: threatAnalysis.threat_level,
            description: description,
            ai_explanation: threatAnalysis.ai_explanation,
            risk_score: Math.abs(threatAnalysis.score_impact) * 10
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        security_score: profile.security_score + threatAnalysis.score_impact,
        threat_analysis: threatAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ingest-activity:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple rule-based threat analysis
function analyzeActivity(params: {
  activity_type: string;
  description: string;
  metadata: any;
  timestamp: string;
  current_score: number;
}): { score_impact: number; threat_level?: string; reason: string; ai_explanation: string } {
  const { activity_type, metadata, timestamp } = params;
  
  let score_impact = 0;
  let threat_level: string | undefined;
  let reason = '';
  let ai_explanation = '';

  const hour = new Date(timestamp).getHours();
  const isOffHours = hour < 6 || hour > 22;

  // File access patterns
  if (activity_type === 'file_access' || activity_type === 'file_download') {
    if (isOffHours) {
      score_impact = -15;
      threat_level = 'high';
      reason = 'File access during unusual hours';
      ai_explanation = 'Accessing files outside normal business hours (6 AM - 10 PM) is considered suspicious behavior.';
    } else if (metadata?.file_count > 10) {
      score_impact = -10;
      threat_level = 'medium';
      reason = 'Bulk file access detected';
      ai_explanation = 'Accessing multiple files in a short period may indicate data exfiltration attempts.';
    } else {
      score_impact = -2;
      reason = 'Normal file access';
      ai_explanation = 'Regular file access during business hours.';
    }
  }

  // Login patterns
  if (activity_type === 'login') {
    if (isOffHours) {
      score_impact = -8;
      threat_level = 'medium';
      reason = 'Login during unusual hours';
      ai_explanation = 'Logging in outside normal business hours may indicate unauthorized access.';
    } else if (metadata?.failed_attempts > 3) {
      score_impact = -20;
      threat_level = 'critical';
      reason = 'Multiple failed login attempts';
      ai_explanation = 'Multiple failed login attempts suggest potential brute force attack or credential guessing.';
    } else {
      score_impact = 1;
      reason = 'Successful login';
      ai_explanation = 'Normal login activity during business hours.';
    }
  }

  // Data export
  if (activity_type === 'data_export') {
    score_impact = -25;
    threat_level = 'critical';
    reason = 'Data export detected';
    ai_explanation = 'Data export operations require careful monitoring as they may indicate insider threats or data leakage.';
  }

  // System configuration changes
  if (activity_type === 'system_config') {
    if (!metadata?.approved) {
      score_impact = -30;
      threat_level = 'critical';
      reason = 'Unauthorized system configuration change';
      ai_explanation = 'System configuration changes without proper approval pose significant security risks.';
    }
  }

  return { score_impact, threat_level, reason, ai_explanation };
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MLPrediction {
  id: string;
  activity_log_id: string;
  profile_id: string;
  model_version: string;
  supervised_model_version: string;
  isolation_forest_version: string;
  lstm_model_version: string;
  threat_probability: number;
  threat_class: 'safe' | 'threat';
  threat_type: string | null;
  threat_level: 'low' | 'medium' | 'high' | 'critical' | null;
  supervised_prediction: string | null;
  anomaly_score: number | null;
  sequence_anomaly_score: number | null;
  prediction_confidence: number | null;
  feature_importance: Record<string, number> | null;
  auto_blocked: boolean;
  requires_review: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  activity?: {
    activity_type: string;
    description: string;
    created_at: string;
  };
  profile?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
  };
}

export interface MLPredictionStats {
  total: number;
  threats: number;
  safe: number;
  pending_review: number;
  auto_blocked: number;
  high_confidence: number;
  avg_threat_probability: number;
}

export const useMLPredictions = (filters?: {
  userId?: string;
  threatClass?: 'safe' | 'threat';
  requiresReview?: boolean;
  limit?: number;
}) => {
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [stats, setStats] = useState<MLPredictionStats>({
    total: 0,
    threats: 0,
    safe: 0,
    pending_review: 0,
    auto_blocked: 0,
    high_confidence: 0,
    avg_threat_probability: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'security_officer';

  useEffect(() => {
    if (profile) {
      fetchPredictions();
      setupRealtimeSubscription();
    }
  }, [profile, filters]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any type to bypass Supabase type checking issues
      let query: any = (supabase as any)
        .from('ml_threat_predictions')
        .select(`
          *,
          activity:activity_logs(
            activity_type,
            description,
            created_at
          ),
          profile:profiles(
            first_name,
            last_name,
            employee_id,
            department
          )
        `);

      // Apply filters
      if (!isAdmin && !filters?.userId) {
        query = query.eq('profile_id', profile!.id);
      } else if (filters?.userId) {
        query = query.eq('profile_id', filters.userId);
      }

      if (filters?.threatClass) {
        query = query.eq('threat_class', filters.threatClass);
      }

      if (filters?.requiresReview !== undefined) {
        query = query.eq('requires_review', filters.requiresReview);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPredictions(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Error fetching ML predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: MLPrediction[]) => {
    const threats = data.filter(p => p.threat_class === 'threat');
    const highConfidence = data.filter(p => (p.prediction_confidence || 0) > 0.8);
    const avgProbability = data.length > 0
      ? data.reduce((sum, p) => sum + p.threat_probability, 0) / data.length
      : 0;

    setStats({
      total: data.length,
      threats: threats.length,
      safe: data.filter(p => p.threat_class === 'safe').length,
      pending_review: data.filter(p => p.requires_review && !p.reviewed_at).length,
      auto_blocked: data.filter(p => p.auto_blocked).length,
      high_confidence: highConfidence.length,
      avg_threat_probability: avgProbability
    });
  };

  const setupRealtimeSubscription = () => {
    if (!profile) return;

    const channel = supabase
      .channel('ml-predictions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ml_threat_predictions',
          filter: isAdmin ? undefined : `profile_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('ML prediction change:', payload);
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsReviewed = async (predictionId: string, notes?: string) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('ml_threat_predictions')
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile!.id
        })
        .eq('id', predictionId);

      if (updateError) throw updateError;

      await fetchPredictions();
      return { success: true };
    } catch (err) {
      console.error('Error marking prediction as reviewed:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update prediction'
      };
    }
  };

  return {
    predictions,
    stats,
    loading,
    error,
    refetch: fetchPredictions,
    markAsReviewed
  };
};

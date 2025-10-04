-- Create ML threat predictions table
CREATE TABLE IF NOT EXISTS public.ml_threat_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_log_id UUID REFERENCES public.activity_logs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Model versions used
  model_version TEXT NOT NULL,
  supervised_model_version TEXT,
  isolation_forest_version TEXT,
  lstm_model_version TEXT,
  
  -- Prediction results
  threat_probability DECIMAL(5, 4) NOT NULL CHECK (threat_probability >= 0 AND threat_probability <= 1),
  threat_class TEXT NOT NULL CHECK (threat_class IN ('safe', 'threat')),
  threat_type TEXT,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Individual model predictions
  supervised_prediction TEXT,
  anomaly_score DECIMAL(5, 4),
  sequence_anomaly_score DECIMAL(5, 4),
  
  -- Confidence and feature importance
  prediction_confidence DECIMAL(5, 4),
  feature_importance JSONB,
  
  -- Action flags
  auto_blocked BOOLEAN DEFAULT false,
  requires_review BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on ml_threat_predictions
ALTER TABLE public.ml_threat_predictions ENABLE ROW LEVEL SECURITY;

-- Admins and security officers can view all ML predictions
CREATE POLICY "Admins can view all ML predictions"
ON public.ml_threat_predictions
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'security_officer')
  )
);

-- Users can view their own ML predictions
CREATE POLICY "Users can view their own ML predictions"
ON public.ml_threat_predictions
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- System can insert ML predictions (service role)
CREATE POLICY "Service role can insert ML predictions"
ON public.ml_threat_predictions
FOR INSERT
WITH CHECK (true);

-- Admins can update ML predictions (for review)
CREATE POLICY "Admins can update ML predictions"
ON public.ml_threat_predictions
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'security_officer')
  )
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ml_predictions_profile ON public.ml_threat_predictions(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_activity ON public.ml_threat_predictions(activity_log_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_threat ON public.ml_threat_predictions(threat_class, threat_probability DESC) WHERE threat_class = 'threat';
CREATE INDEX IF NOT EXISTS idx_ml_predictions_review ON public.ml_threat_predictions(requires_review, reviewed_at) WHERE requires_review = true;

-- Add ML prediction reference to threat_detections table
ALTER TABLE public.threat_detections 
ADD COLUMN IF NOT EXISTS ml_prediction_id UUID REFERENCES public.ml_threat_predictions(id),
ADD COLUMN IF NOT EXISTS detection_method TEXT DEFAULT 'rule_based' CHECK (detection_method IN ('rule_based', 'ml_based', 'hybrid'));

-- Create index on detection_method
CREATE INDEX IF NOT EXISTS idx_threat_detections_method ON public.threat_detections(detection_method, created_at DESC);
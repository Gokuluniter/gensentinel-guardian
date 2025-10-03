-- Add security_score column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN security_score integer DEFAULT 100 CHECK (security_score >= 0 AND security_score <= 100),
ADD COLUMN last_score_update timestamp with time zone DEFAULT now();

-- Create table to track security score history
CREATE TABLE public.security_score_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL,
  score integer NOT NULL,
  previous_score integer,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS on security_score_history
ALTER TABLE public.security_score_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all score history
CREATE POLICY "Admins can view all score history"
ON public.security_score_history
FOR SELECT
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'security_officer'::user_role]));

-- Users can view their own score history only when below threshold
CREATE POLICY "Users can view their own score history when alerted"
ON public.security_score_history
FOR SELECT
USING (
  profile_id = get_current_user_profile_id() AND
  score < 70
);

-- System can insert score history
CREATE POLICY "System can insert score history"
ON public.security_score_history
FOR INSERT
WITH CHECK (true);

-- Create table for security notifications
CREATE TABLE public.security_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  xai_explanation text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS on security_notifications
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.security_notifications
FOR SELECT
USING (profile_id = get_current_user_profile_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.security_notifications
FOR UPDATE
USING (profile_id = get_current_user_profile_id());

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.security_notifications
FOR INSERT
WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.security_notifications
FOR SELECT
USING (get_current_user_role() = ANY(ARRAY['admin'::user_role, 'security_officer'::user_role]));

-- Create index for faster queries
CREATE INDEX idx_security_score_history_profile ON public.security_score_history(profile_id, created_at DESC);
CREATE INDEX idx_security_notifications_profile ON public.security_notifications(profile_id, is_read, created_at DESC);
CREATE INDEX idx_profiles_security_score ON public.profiles(security_score) WHERE security_score < 70;
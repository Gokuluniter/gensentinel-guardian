-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  primary_contact_email TEXT NOT NULL,
  primary_contact_name TEXT NOT NULL,
  primary_contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact leads table for "Contact Sales" form
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to profiles table
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to other tables for multi-tenancy
ALTER TABLE public.documents ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.activity_logs ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.threat_detections ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
ON public.organizations FOR SELECT
USING (id = get_current_user_organization());

CREATE POLICY "Users can update their own organization"
ON public.organizations FOR UPDATE
USING (
  id = get_current_user_organization() 
  AND get_current_user_role() IN ('admin', 'security_officer')
);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view events in their organization"
ON public.calendar_events FOR SELECT
USING (organization_id = get_current_user_organization());

CREATE POLICY "Users can create events in their organization"
ON public.calendar_events FOR INSERT
WITH CHECK (
  organization_id = get_current_user_organization()
  AND created_by = get_current_user_profile_id()
);

CREATE POLICY "Users can update events in their organization"
ON public.calendar_events FOR UPDATE
USING (
  organization_id = get_current_user_organization()
  AND (created_by = get_current_user_profile_id() OR get_current_user_role() IN ('admin', 'security_officer'))
);

CREATE POLICY "Users can delete events in their organization"
ON public.calendar_events FOR DELETE
USING (
  organization_id = get_current_user_organization()
  AND (created_by = get_current_user_profile_id() OR get_current_user_role() IN ('admin', 'security_officer'))
);

-- RLS Policies for contact_leads (only admins of GenSentinel can view)
CREATE POLICY "System admins can view contact leads"
ON public.contact_leads FOR SELECT
USING (get_current_user_role() IN ('admin', 'security_officer'));

CREATE POLICY "Anyone can create contact leads"
ON public.contact_leads FOR INSERT
WITH CHECK (true);

-- Update existing RLS policies to include organization filtering
DROP POLICY IF EXISTS "documents_select_access" ON public.documents;
CREATE POLICY "documents_select_access"
ON public.documents FOR SELECT
USING (
  organization_id = get_current_user_organization()
  AND (
    get_current_user_role() IN ('admin', 'security_officer')
    OR (department = get_current_user_department() AND security_level <= get_current_user_security_clearance())
  )
);

DROP POLICY IF EXISTS "activity_logs_select_access" ON public.activity_logs;
CREATE POLICY "activity_logs_select_access"
ON public.activity_logs FOR SELECT
USING (
  organization_id = get_current_user_organization()
  AND (
    get_current_user_role() IN ('admin', 'security_officer')
    OR (get_current_user_role() = 'department_head' AND user_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.department = get_current_user_department()
    ))
    OR user_id = get_current_user_profile_id()
  )
);

DROP POLICY IF EXISTS "projects_select_access" ON public.projects;
CREATE POLICY "projects_select_access"
ON public.projects FOR SELECT
USING (
  organization_id = get_current_user_organization()
  AND (
    get_current_user_role() IN ('admin', 'security_officer')
    OR (get_current_user_role() = 'department_head' AND department = get_current_user_department())
    OR manager_id = get_current_user_profile_id()
  )
);

-- Update triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
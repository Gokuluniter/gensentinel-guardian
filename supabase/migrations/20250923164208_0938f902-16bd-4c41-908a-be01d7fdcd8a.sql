-- Create enum types for roles and departments
CREATE TYPE public.user_role AS ENUM ('user', 'supervisor', 'department_head', 'security_officer', 'admin');
CREATE TYPE public.department AS ENUM ('hr', 'finance', 'it', 'operations', 'legal', 'marketing', 'security');
CREATE TYPE public.threat_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.activity_type AS ENUM ('login', 'logout', 'file_access', 'file_download', 'file_upload', 'document_view', 'report_generate', 'user_management', 'system_config', 'data_export');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  department department NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  security_clearance INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name department NOT NULL UNIQUE,
  description TEXT,
  head_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department department NOT NULL,
  manager_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  department department NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  security_level INTEGER DEFAULT 1,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  resource_id UUID,
  resource_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create threat_detections table
CREATE TABLE public.threat_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  threat_level threat_level NOT NULL,
  threat_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_explanation TEXT NOT NULL,
  activity_log_id UUID REFERENCES public.activity_logs(id),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on threat_detections
ALTER TABLE public.threat_detections ENABLE ROW LEVEL SECURITY;

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  permission_type TEXT NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, department, employee_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'department')::department, 'it'),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', 'EMP' || EXTRACT(epoch FROM now())::text)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Create RLS policies for projects
CREATE POLICY "Users can view projects in their department" ON public.projects
  FOR SELECT USING (
    department IN (
      SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Create RLS policies for documents
CREATE POLICY "Users can view documents they have access to" ON public.documents
  FOR SELECT USING (
    (department IN (
      SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()
    ) AND security_level <= (
      SELECT security_clearance FROM public.profiles WHERE user_id = auth.uid()
    )) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer', 'supervisor', 'department_head')
    )
  );

-- Create RLS policies for threat_detections
CREATE POLICY "Security officers and admins can view threat detections" ON public.threat_detections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer', 'department_head')
    )
  );

-- Insert some default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('threat_detection_enabled', 'true', 'Enable/disable threat detection system'),
  ('security_alert_threshold', '70', 'Minimum risk score to trigger security alerts'),
  ('session_timeout_minutes', '60', 'Session timeout in minutes'),
  ('max_failed_login_attempts', '5', 'Maximum failed login attempts before account lockout'),
  ('email_notifications_enabled', 'true', 'Enable/disable email notifications');

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
  ('hr', 'Human Resources Department'),
  ('finance', 'Finance and Accounting Department'),
  ('it', 'Information Technology Department'),
  ('operations', 'Operations Department'),
  ('legal', 'Legal Affairs Department'),
  ('marketing', 'Marketing and Communications Department'),
  ('security', 'Security and Compliance Department');
-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Create RLS policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all permissions" ON public.user_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

CREATE POLICY "Admins can manage permissions" ON public.user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Create RLS policies for system_settings
CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Add missing INSERT/UPDATE/DELETE policies for profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Add missing INSERT/UPDATE/DELETE policies for projects
CREATE POLICY "Department users can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    department IN (
      SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer', 'department_head')
    )
  );

CREATE POLICY "Project managers can update their projects" ON public.projects
  FOR UPDATE USING (
    manager_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Add missing INSERT/UPDATE/DELETE policies for documents
CREATE POLICY "Users can upload documents to their department" ON public.documents
  FOR INSERT WITH CHECK (
    uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    department IN (
      SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can update their documents" ON public.documents
  FOR UPDATE USING (
    uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer')
    )
  );

-- Add INSERT policy for activity_logs
CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Add INSERT/UPDATE policies for threat_detections
CREATE POLICY "System can insert threat detections" ON public.threat_detections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Security officers can update threat detections" ON public.threat_detections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'security_officer', 'department_head')
    )
  );
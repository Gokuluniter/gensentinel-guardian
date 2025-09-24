import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useActivityLogger = () => {
  const { profile } = useAuth();

  const logActivity = async (
    activityType: 'login' | 'logout' | 'file_access' | 'file_download' | 'file_upload' | 'document_view' | 'report_generate' | 'user_management' | 'system_config' | 'data_export',
    description: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ) => {
    if (!profile) return;

    try {
      const { error } = await supabase.rpc('log_activity', {
        p_user_id: profile.id,
        p_activity_type: activityType,
        p_description: description,
        p_resource_type: resourceType || null,
        p_resource_id: resourceId || null,
        p_metadata: metadata || null
      });

      if (error) {
        console.error('Activity logging error:', error);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Info, 
  XCircle, 
  CheckCircle,
  Bell,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: string;
  xai_explanation: string;
  is_read: boolean;
  created_at: string;
}

const SecurityNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();

      // Set up realtime subscription
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_notifications',
            filter: `profile_id=eq.${profile.id}`
          },
          (payload) => {
            console.log('New notification:', payload);
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('security_notifications')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <Info className="h-5 w-5 text-warning" />;
      default:
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "destructive" | "secondary" | "default"> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'default'
    };
    return variants[severity] || 'default';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Notifications...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Security Alerts</CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} New</Badge>
          )}
        </div>
        <CardDescription>
          Important security notifications and explanations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>All Clear</AlertTitle>
            <AlertDescription>
              No security alerts at this time. Keep up the good work!
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Alert
                  key={notification.id}
                  className={`relative ${!notification.is_read ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(notification.severity)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <AlertTitle className="flex items-center gap-2">
                            {notification.title}
                            <Badge variant={getSeverityBadge(notification.severity)}>
                              {notification.severity}
                            </Badge>
                          </AlertTitle>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(notification.created_at), 'PPp')}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                      <AlertDescription className="space-y-2">
                        <p>{notification.message}</p>
                        {notification.xai_explanation && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm font-semibold mb-1">🤖 AI Explanation:</p>
                            <p className="text-sm">{notification.xai_explanation}</p>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityNotifications;
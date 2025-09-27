import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Trash2,
  Mail,
  MessageSquare,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'security',
      title: 'High Risk Threat Detected',
      message: 'Suspicious file access detected from user John Doe. Immediate action required.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'system',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on Sunday at 2:00 AM EST. Expected downtime: 2 hours.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'user',
      title: 'New User Registration',
      message: 'Jane Smith has requested access to the HR department documents.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'security',
      title: 'Failed Login Attempts',
      message: 'Multiple failed login attempts detected for user account: admin@company.com',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'info',
      title: 'Security Score Updated',
      message: 'Your organization security score has improved to 85%. Great job!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'low'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    userActivity: false,
    maintenanceAlerts: true,
    threatAlerts: true,
    loginAlerts: false,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-5 w-5 text-destructive" />;
      case 'system': return <Settings className="h-5 w-5 text-info" />;
      case 'user': return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'info': return <Info className="h-5 w-5 text-success" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / (24 * 60))} days ago`;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== id)
    );
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "All Read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Manage alerts and notification preferences</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest alerts and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read 
                        ? 'bg-background hover:bg-muted/50' 
                        : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="outline" className="text-xs">New</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Delivery Methods
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Alerts
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <Switch
                      id="security-alerts"
                      checked={settings.securityAlerts}
                      onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threat-alerts">Threat Alerts</Label>
                    <Switch
                      id="threat-alerts"
                      checked={settings.threatAlerts}
                      onCheckedChange={(checked) => handleSettingChange('threatAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-alerts">Login Alerts</Label>
                    <Switch
                      id="login-alerts"
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  System Updates
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <Switch
                      id="system-updates"
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
                    <Switch
                      id="maintenance-alerts"
                      checked={settings.maintenanceAlerts}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-activity">User Activity</Label>
                    <Switch
                      id="user-activity"
                      checked={settings.userActivity}
                      onCheckedChange={(checked) => handleSettingChange('userActivity', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Unread</span>
                <Badge variant="destructive">{unreadCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Priority</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.priority === 'high').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
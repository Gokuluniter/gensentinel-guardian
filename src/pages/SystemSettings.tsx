import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Users,
  Lock,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const SystemSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState({
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: 30,
    passwordComplexity: true,
    enableAuditLogging: true,
    
    // Threat Detection Settings
    threatScanningEnabled: true,
    realTimeMonitoring: true,
    autoThreatResponse: false,
    threatSensitivity: 'medium',
    
    // Notification Settings
    emailNotifications: true,
    smsAlerts: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
    
    // System Settings
    maintenanceMode: false,
    systemBackups: true,
    dataRetentionDays: 365,
    maxLoginAttempts: 5,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      enableTwoFactor: true,
      sessionTimeout: 30,
      passwordComplexity: true,
      enableAuditLogging: true,
      threatScanningEnabled: true,
      realTimeMonitoring: true,
      autoThreatResponse: false,
      threatSensitivity: 'medium',
      emailNotifications: true,
      smsAlerts: false,
      pushNotifications: true,
      notificationFrequency: 'immediate',
      maintenanceMode: false,
      systemBackups: true,
      dataRetentionDays: 365,
      maxLoginAttempts: 5,
    });
    setHasChanges(false);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure security, monitoring, and system preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure authentication and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all user accounts
                </p>
              </div>
              <Switch
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Complexity</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce strong password requirements
                </p>
              </div>
              <Switch
                checked={settings.passwordComplexity}
                onCheckedChange={(checked) => handleSettingChange('passwordComplexity', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all security-related events
                </p>
              </div>
              <Switch
                checked={settings.enableAuditLogging}
                onCheckedChange={(checked) => handleSettingChange('enableAuditLogging', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Threat Detection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Threat Detection
            </CardTitle>
            <CardDescription>
              Configure AI-powered threat detection and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-time Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Enable continuous threat scanning
                </p>
              </div>
              <Switch
                checked={settings.realTimeMonitoring}
                onCheckedChange={(checked) => handleSettingChange('realTimeMonitoring', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Threat Scanning</Label>
                <p className="text-sm text-muted-foreground">
                  Scan files and activities for threats
                </p>
              </div>
              <Switch
                checked={settings.threatScanningEnabled}
                onCheckedChange={(checked) => handleSettingChange('threatScanningEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Response</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically respond to threats
                </p>
              </div>
              <Switch
                checked={settings.autoThreatResponse}
                onCheckedChange={(checked) => handleSettingChange('autoThreatResponse', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Detection Sensitivity</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={settings.threatSensitivity}
                onChange={(e) => handleSettingChange('threatSensitivity', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure system and security notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send critical alerts via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsAlerts}
                onCheckedChange={(checked) => handleSettingChange('smsAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Browser push notifications
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={settings.notificationFrequency}
                onChange={(e) => handleSettingChange('notificationFrequency', e.target.value)}
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              General system and maintenance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable system maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable daily system backups
                </p>
              </div>
              <Switch
                checked={settings.systemBackups}
                onCheckedChange={(checked) => handleSettingChange('systemBackups', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Retention (days)</Label>
              <Input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                min="30"
                max="2555"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <Card className="border-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Unsaved Changes</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemSettings;
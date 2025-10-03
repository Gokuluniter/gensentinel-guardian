import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SecurityNotifications from '@/components/SecurityNotifications';
import { Shield } from 'lucide-react';

const Notifications = () => {
  return (
    <DashboardLayout
      title="Security Notifications"
      actions={
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">Real-time alerts</span>
        </div>
      }
    >
      <SecurityNotifications />
    </DashboardLayout>
  );
};

export default Notifications;
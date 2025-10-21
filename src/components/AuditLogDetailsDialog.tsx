import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  User,
  Calendar,
  Globe,
  FileText,
  Shield,
  Clock,
} from 'lucide-react';

interface AuditLogDetailsDialogProps {
  log: {
    id: string;
    activity_type: string;
    description: string;
    resource_type?: string;
    resource_id?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
    created_at: string;
    profiles?: {
      first_name: string;
      last_name: string;
      employee_id: string;
      department: string;
      role: string;
      email: string;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuditLogDetailsDialog: React.FC<AuditLogDetailsDialogProps> = ({
  log,
  open,
  onOpenChange,
}) => {
  if (!log) return null;

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-500',
      logout: 'bg-gray-500',
      file_access: 'bg-blue-500',
      data_export: 'bg-red-500',
      user_management: 'bg-purple-500',
      system_config: 'bg-orange-500',
      document_view: 'bg-cyan-500',
      report_generate: 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Audit Log Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this audit event
              </DialogDescription>
            </div>
            <Badge className={getActivityTypeColor(log.activity_type)}>
              {log.activity_type.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{log.description}</p>
                </div>
                
                {log.resource_type && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Resource Type</label>
                      <p className="text-sm mt-1">{log.resource_type.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>
                    {log.resource_id && (
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Resource ID</label>
                        <p className="text-sm mt-1 font-mono text-xs">{log.resource_id}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            {log.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                      <p className="text-sm mt-1">
                        {log.profiles.first_name} {log.profiles.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Employee ID</label>
                      <p className="text-sm mt-1">{log.profiles.employee_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Department</label>
                      <p className="text-sm mt-1">{log.profiles.department.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Role</label>
                      <p className="text-sm mt-1">
                        <Badge variant="outline">
                          {log.profiles.role.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-muted-foreground">Email</label>
                      <p className="text-sm mt-1">{log.profiles.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timestamp
                    </label>
                    <p className="text-sm mt-1">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Event ID
                    </label>
                    <p className="text-sm mt-1 font-mono text-xs">{log.id}</p>
                  </div>
                </div>

                {log.ip_address && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      IP Address
                    </label>
                    <p className="text-sm mt-1 font-mono">{log.ip_address}</p>
                  </div>
                )}

                {log.user_agent && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      User Agent
                    </label>
                    <p className="text-sm mt-1 text-muted-foreground break-all">
                      {log.user_agent}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Additional Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetailsDialog;


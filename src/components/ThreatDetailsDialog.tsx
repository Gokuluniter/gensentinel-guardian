import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  User,
  Calendar,
  Activity,
  Brain,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { generateThreatReport } from '@/lib/reportGenerator';
import { toast } from '@/hooks/use-toast';

interface ThreatDetailsDialogProps {
  threat: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThreatDetailsDialog: React.FC<ThreatDetailsDialogProps> = ({
  threat,
  open,
  onOpenChange,
}) => {
  if (!threat) return null;

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Threat Detection Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this security threat
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const fileName = generateThreatReport(threat);
                  toast({
                    title: "Report Downloaded",
                    description: `${fileName} has been saved to your downloads folder.`,
                  });
                } catch (error) {
                  console.error('Error generating report:', error);
                  toast({
                    title: "Error",
                    description: "Failed to generate report. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Status and Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getThreatLevelColor(threat.threat_level)}>
                  {threat.threat_level?.toUpperCase()} THREAT
                </Badge>
                <Badge variant={threat.is_resolved ? 'default' : 'destructive'}>
                  {threat.is_resolved ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Active
                    </>
                  )}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Risk Score: {threat.risk_score}/100
              </div>
            </div>

            <Separator />

            {/* Threat Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Threat Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    Threat Type
                  </label>
                  <p className="text-base mt-1">{threat.threat_type || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    Description
                  </label>
                  <p className="text-base mt-1">{threat.description}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    Detection Method
                  </label>
                  <p className="text-base mt-1 capitalize">
                    {threat.detection_method?.replace('_', ' ') || 'Automated'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            {threat.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">
                        Name
                      </label>
                      <p className="text-base mt-1">
                        {threat.user.first_name} {threat.user.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">
                        Employee ID
                      </label>
                      <p className="text-base mt-1">{threat.user.employee_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">
                        Department
                      </label>
                      <p className="text-base mt-1 capitalize">
                        {threat.user.department}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Explanation */}
            {threat.ai_explanation && (
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Brain className="h-4 w-4" />
                    AI Explanation (XAI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {threat.ai_explanation.split('\n').map((line: string, idx: number) => (
                      <p key={idx} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Threat Detected</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(threat.created_at)}
                    </p>
                  </div>
                </div>
                {threat.is_resolved && threat.resolved_at && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                    <div>
                      <p className="font-semibold text-sm">Resolved</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(threat.resolved_at)}
                      </p>
                      {threat.resolver && (
                        <p className="text-sm text-muted-foreground">
                          by {threat.resolver.first_name} {threat.resolver.last_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Notes */}
            {threat.resolution_notes && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                    <FileText className="h-4 w-4" />
                    Resolution Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base whitespace-pre-wrap">
                    {threat.resolution_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Raw Data (for debugging) */}
            {threat.ml_prediction_id && (
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  <p>Threat ID: {threat.id}</p>
                  {threat.activity_log_id && (
                    <p>Activity Log ID: {threat.activity_log_id}</p>
                  )}
                  {threat.ml_prediction_id && (
                    <p>ML Prediction ID: {threat.ml_prediction_id}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ThreatDetailsDialog;


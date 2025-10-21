import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ResolveThreatDialogProps {
  threat: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}

const ResolveThreatDialog: React.FC<ResolveThreatDialogProps> = ({
  threat,
  open,
  onOpenChange,
  onResolved,
}) => {
  const { profile } = useAuth();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast({
        title: 'Resolution notes required',
        description: 'Please provide notes explaining how this threat was resolved.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setResolving(true);

      const { error } = await supabase
        .from('threat_detections')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: profile?.id,
          resolution_notes: resolutionNotes,
        })
        .eq('id', threat.id);

      if (error) throw error;

      toast({
        title: 'Threat resolved',
        description: 'The threat has been marked as resolved successfully.',
      });

      // Reset form
      setResolutionNotes('');
      onResolved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error resolving threat:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve threat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResolving(false);
    }
  };

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

  if (!threat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Resolve Threat
          </DialogTitle>
          <DialogDescription>
            Mark this threat as resolved and provide resolution notes for audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Threat Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getThreatLevelColor(threat.threat_level)}>
                {threat.threat_level?.toUpperCase()} THREAT
              </Badge>
              <span className="text-sm text-muted-foreground">
                Risk Score: {threat.risk_score}/100
              </span>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-muted-foreground">
                Threat Type
              </label>
              <p className="text-base">{threat.threat_type || 'Unknown'}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground">
                Description
              </label>
              <p className="text-base">{threat.description}</p>
            </div>

            {threat.user && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Affected User
                </label>
                <p className="text-base">
                  {threat.user.first_name} {threat.user.last_name} ({threat.user.employee_id})
                </p>
              </div>
            )}
          </div>

          {/* Resolution Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="resolution-notes" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Resolution Notes <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="resolution-notes"
              placeholder="Describe how this threat was investigated and resolved. Include:&#10;• Actions taken to address the threat&#10;• Root cause analysis&#10;• Preventive measures implemented&#10;• Any follow-up required"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be recorded in the audit trail and available for compliance reviews.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resolving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={resolving || !resolutionNotes.trim()}
          >
            {resolving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolveThreatDialog;


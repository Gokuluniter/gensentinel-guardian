import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  Brain,
  Activity,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import { MLPrediction } from '@/hooks/useMLPredictions';

interface MLPredictionDetailsProps {
  prediction: MLPrediction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkReviewed?: (predictionId: string) => void;
}

const MLPredictionDetails: React.FC<MLPredictionDetailsProps> = ({
  prediction,
  open,
  onOpenChange,
  onMarkReviewed
}) => {
  const getThreatLevelColor = (level: string | null) => {
    switch (level) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-success text-success-foreground';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const formatProbability = (prob: number) => {
    return `${(prob * 100).toFixed(2)}%`;
  };

  const renderFeatureImportance = () => {
    if (!prediction.feature_importance) return null;

    const features = Object.entries(prediction.feature_importance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <div className="space-y-3">
        {features.map(([feature, importance]) => (
          <div key={feature} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
              <span className="text-muted-foreground">
                {(importance * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={importance * 100} className="h-2" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            ML Threat Prediction Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis from multiple machine learning models
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Threat Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Threat Classification</p>
                  <Badge className={`${getThreatLevelColor(prediction.threat_level)} text-lg px-4 py-2`}>
                    {prediction.threat_class === 'threat' ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        THREAT DETECTED
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        SAFE
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Threat Level</p>
                  <Badge className={getThreatLevelColor(prediction.threat_level)}>
                    {prediction.threat_level?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Threat Probability</p>
                  <div className="flex items-center gap-2">
                    <Progress value={prediction.threat_probability * 100} className="flex-1" />
                    <span className="font-bold">{formatProbability(prediction.threat_probability)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Model Confidence</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(prediction.prediction_confidence || 0) * 100}
                      className="flex-1"
                    />
                    <span className={`font-bold ${getConfidenceColor(prediction.prediction_confidence || 0)}`}>
                      {formatProbability(prediction.prediction_confidence || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {prediction.threat_type && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Threat Type</p>
                  <Badge variant="outline" className="text-base">
                    {prediction.threat_type.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2">
                {prediction.auto_blocked && (
                  <Badge className="bg-red-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Auto-Blocked
                  </Badge>
                )}
                {prediction.requires_review && !prediction.reviewed_at && (
                  <Badge className="bg-yellow-600 text-white">
                    <Eye className="h-3 w-3 mr-1" />
                    Requires Review
                  </Badge>
                )}
                {prediction.reviewed_at && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reviewed
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Individual Model Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Individual Model Predictions
              </CardTitle>
              <CardDescription>
                Results from each specialized ML model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supervised Classifier */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Supervised Classifier</h4>
                    <p className="text-sm text-muted-foreground">
                      Version: {prediction.supervised_model_version}
                    </p>
                  </div>
                  {prediction.supervised_prediction && (
                    <Badge variant="outline">{prediction.supervised_prediction}</Badge>
                  )}
                </div>
                <p className="text-sm">
                  Trained on labeled threat data to classify known attack patterns
                </p>
              </div>

              {/* Isolation Forest (Anomaly Detection) */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Anomaly Detector</h4>
                    <p className="text-sm text-muted-foreground">
                      Version: {prediction.isolation_forest_version}
                    </p>
                  </div>
                  {prediction.anomaly_score !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Anomaly Score</p>
                      <Badge variant={prediction.anomaly_score > 0.7 ? 'destructive' : 'outline'}>
                        {prediction.anomaly_score.toFixed(3)}
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-sm">
                  Detects unusual patterns that deviate from normal behavior
                </p>
              </div>

              {/* LSTM Sequential Anomaly Detector */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Sequential Anomaly Detector</h4>
                    <p className="text-sm text-muted-foreground">
                      Version: {prediction.lstm_model_version}
                    </p>
                  </div>
                  {prediction.sequence_anomaly_score !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Sequence Score</p>
                      <Badge variant={prediction.sequence_anomaly_score > 0.7 ? 'destructive' : 'outline'}>
                        {prediction.sequence_anomaly_score.toFixed(3)}
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-sm">
                  Analyzes sequences of actions to detect multi-step attack patterns
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Importance */}
          {prediction.feature_importance && Object.keys(prediction.feature_importance).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Contributing Factors
                </CardTitle>
                <CardDescription>
                  Features that most influenced this prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFeatureImportance()}
              </CardContent>
            </Card>
          )}

          {/* Activity Context */}
          {prediction.activity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Activity Type</p>
                  <p className="font-medium">{prediction.activity.activity_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{prediction.activity.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {new Date(prediction.activity.created_at).toLocaleString()}
                  </p>
                </div>
                {prediction.profile && (
                  <div>
                    <p className="text-sm text-muted-foreground">User</p>
                    <p className="font-medium">
                      {prediction.profile.first_name} {prediction.profile.last_name} ({prediction.profile.employee_id})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Department: {prediction.profile.department}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {onMarkReviewed && prediction.requires_review && !prediction.reviewed_at && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onMarkReviewed(prediction.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MLPredictionDetails;


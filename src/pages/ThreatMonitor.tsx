import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Activity,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMLPredictions } from '@/hooks/useMLPredictions';
import MLPredictionDetails from '@/components/MLPredictionDetails';
import ThreatDetailsDialog from '@/components/ThreatDetailsDialog';
import ResolveThreatDialog from '@/components/ResolveThreatDialog';
import { generateThreatReport, generateMultipleThreatReport } from '@/lib/reportGenerator';

const ThreatMonitor = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showPredictionDialog, setShowPredictionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('threats');
  
  // Threat details and resolve dialogs
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showThreatDetails, setShowThreatDetails] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  
  // ML Predictions hook
  const { 
    predictions, 
    stats: mlStats, 
    loading: mlLoading, 
    markAsReviewed 
  } = useMLPredictions();

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('threat_detections')
        .select(`
          *,
          user:profiles!threat_detections_user_id_fkey(first_name, last_name, department, employee_id),
          resolver:profiles!threat_detections_resolved_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreats(data || []);
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast({
        title: "Error",
        description: "Failed to load threat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-threat-critical text-white';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.threat_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || threat.threat_level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'resolved' && threat.is_resolved) ||
                         (selectedStatus === 'active' && !threat.is_resolved);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const stats = {
    total: threats.length,
    active: threats.filter(t => !t.is_resolved).length,
    resolved: threats.filter(t => t.is_resolved).length,
    critical: threats.filter(t => t.threat_level === 'critical' && !t.is_resolved).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Threat Monitor</h1>
            <p className="text-muted-foreground">Real-time security threat detection and monitoring</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Threat Monitor
          </h1>
          <p className="text-muted-foreground">AI-powered security threat detection and monitoring</p>
        </div>
        <Button
          onClick={() => {
            try {
              const fileName = generateMultipleThreatReport(
                filteredThreats,
                'Threat Detection Summary Report'
              );
              toast({
                title: "Report Generated",
                description: `${fileName} has been downloaded successfully.`,
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
          disabled={filteredThreats.length === 0}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Tabs for Threats and ML Predictions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="threats">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Threat Detections
          </TabsTrigger>
          <TabsTrigger value="ml-predictions">
            <Brain className="h-4 w-4 mr-2" />
            ML Predictions
            {mlStats.pending_review > 0 && (
              <Badge className="ml-2 bg-yellow-600" variant="secondary">
                {mlStats.pending_review}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-threat-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-threat-critical">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats by description or type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Threat Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Threats List */}
      <div className="space-y-4">
        {filteredThreats.map((threat) => (
          <Card key={threat.id} className={threat.threat_level === 'critical' ? 'border-destructive' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getThreatLevelColor(threat.threat_level)}>
                      {getThreatIcon(threat.threat_level)}
                      <span className="ml-1">{threat.threat_level?.toUpperCase()}</span>
                    </Badge>
                    <span className="font-semibold text-lg">{threat.threat_type}</span>
                    {threat.is_resolved && (
                      <Badge variant="outline" className="bg-success text-success-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground">{threat.description}</p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">AI Analysis:</p>
                    <p className="text-sm text-muted-foreground">{threat.ai_explanation}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {threat.user && (
                      <span>
                        User: {threat.user.first_name} {threat.user.last_name} 
                        ({threat.user.employee_id})
                      </span>
                    )}
                    <span>•</span>
                    <span>Risk Score: {threat.risk_score}/10</span>
                    <span>•</span>
                    <span>{new Date(threat.created_at).toLocaleString()}</span>
                  </div>
                  
                  {threat.resolution_notes && (
                    <div className="bg-success/10 p-3 rounded-lg border-l-4 border-success">
                      <p className="text-sm font-medium text-success mb-1">Resolution Notes:</p>
                      <p className="text-sm">{threat.resolution_notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedThreat(threat);
                      setShowThreatDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {!threat.is_resolved && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedThreat(threat);
                        setShowResolveDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredThreats.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No threats found</h3>
            <p className="text-muted-foreground">Your environment is secure or try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="ml-predictions" className="space-y-6 mt-6">
          {/* ML Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mlStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{mlStats.threats}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Eye className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{mlStats.pending_review}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Blocked</CardTitle>
                <Shield className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mlStats.auto_blocked}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Threat Prob.</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mlStats.avg_threat_probability * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Predictions List */}
          <div className="space-y-4">
            {mlLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : predictions.length > 0 ? (
              predictions.map((pred) => (
                <Card 
                  key={pred.id}
                  className={pred.threat_class === 'threat' ? 'border-destructive/50' : ''}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            className={
                              pred.threat_class === 'threat' 
                                ? getThreatLevelColor(pred.threat_level || 'medium')
                                : 'bg-success text-success-foreground'
                            }
                          >
                            {pred.threat_class === 'threat' ? (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                THREAT
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                SAFE
                              </>
                            )}
                          </Badge>

                          {pred.threat_type && (
                            <Badge variant="outline">
                              {pred.threat_type.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          )}

                          {pred.auto_blocked && (
                            <Badge className="bg-red-600 text-white">
                              <Shield className="h-3 w-3 mr-1" />
                              Auto-Blocked
                            </Badge>
                          )}

                          {pred.requires_review && !pred.reviewed_at && (
                            <Badge className="bg-yellow-600 text-white">
                              <Eye className="h-3 w-3 mr-1" />
                              Needs Review
                            </Badge>
                          )}

                          {pred.reviewed_at && (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </Badge>
                          )}
                        </div>

                        {pred.activity && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Activity</p>
                            <p className="font-medium">{pred.activity.description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 bg-muted/30 p-3 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Threat Probability</p>
                            <p className="font-bold text-lg">
                              {(pred.threat_probability * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="font-bold text-lg">
                              {((pred.prediction_confidence || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Anomaly Score</p>
                            <p className="font-bold text-lg">
                              {pred.anomaly_score?.toFixed(3) || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {pred.profile && (
                            <span>
                              User: {pred.profile.first_name} {pred.profile.last_name} ({pred.profile.employee_id})
                            </span>
                          )}
                          <span>•</span>
                          <span>{new Date(pred.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPrediction(pred);
                            setShowPredictionDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {pred.requires_review && !pred.reviewed_at && (
                          <Button 
                            size="sm"
                            onClick={async () => {
                              const result = await markAsReviewed(pred.id);
                              if (result.success) {
                                toast({
                                  title: "Marked as Reviewed",
                                  description: "Prediction has been marked as reviewed.",
                                });
                              } else {
                                toast({
                                  title: "Error",
                                  description: result.error || "Failed to update prediction",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Reviewed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No ML predictions yet</h3>
                  <p className="text-muted-foreground">
                    Machine learning predictions will appear here as activities are analyzed
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ML Prediction Details Dialog */}
      {selectedPrediction && (
        <MLPredictionDetails
          prediction={selectedPrediction}
          open={showPredictionDialog}
          onOpenChange={setShowPredictionDialog}
          onMarkReviewed={markAsReviewed}
        />
      )}

      {/* Threat Details Dialog */}
      {selectedThreat && (
        <ThreatDetailsDialog
          threat={selectedThreat}
          open={showThreatDetails}
          onOpenChange={setShowThreatDetails}
        />
      )}

      {/* Resolve Threat Dialog */}
      {selectedThreat && (
        <ResolveThreatDialog
          threat={selectedThreat}
          open={showResolveDialog}
          onOpenChange={setShowResolveDialog}
          onResolved={() => {
            fetchThreats(); // Refresh threats list
            toast({
              title: "Success",
              description: "Threat resolved successfully",
            });
          }}
        />
      )}
    </div>
  );
};

export default ThreatMonitor;
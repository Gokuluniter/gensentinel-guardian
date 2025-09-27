import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SecurityCenter = () => {
  const [securityData, setSecurityData] = useState({
    overallScore: 85,
    activeThreats: 0,
    resolvedThreats: 0,
    vulnerabilities: 0,
    secureUsers: 0,
    totalUsers: 0,
    secureDocuments: 0,
    totalDocuments: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch security-related data
      const [threatsData, usersData, documentsData, activitiesData] = await Promise.all([
        supabase.from('threat_detections').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('activity_logs').select('*, profiles(first_name, last_name)')
          .order('created_at', { ascending: false }).limit(10)
      ]);

      const threats = threatsData.data || [];
      const users = usersData.data || [];
      const documents = documentsData.data || [];

      const activeThreats = threats.filter(t => !t.is_resolved).length;
      const resolvedThreats = threats.filter(t => t.is_resolved).length;
      const secureUsers = users.filter(u => u.is_active && u.security_clearance >= 2).length;
      const secureDocuments = documents.filter(d => d.security_level >= 2).length;

      // Calculate overall security score
      const baseScore = 100;
      const threatPenalty = activeThreats * 5;
      const securityBonus = (secureUsers / users.length) * 10;
      const overallScore = Math.max(50, Math.min(100, baseScore - threatPenalty + securityBonus));

      setSecurityData({
        overallScore: Math.round(overallScore),
        activeThreats,
        resolvedThreats,
        vulnerabilities: Math.floor(Math.random() * 3), // Mock data
        secureUsers,
        totalUsers: users.length,
        secureDocuments,
        totalDocuments: documents.length,
      });

      setRecentEvents(activitiesData.data || []);

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { text: 'Good', variant: 'secondary' as const };
    return { text: 'Needs Attention', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Center</h1>
            <p className="text-muted-foreground">Monitor and manage security posture</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const scoreBadge = getScoreBadge(securityData.overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Security Center
          </h1>
          <p className="text-muted-foreground">Monitor and manage security posture</p>
        </div>
        <Button onClick={fetchSecurityData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Score Overview */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Score
            </span>
            <Badge variant={scoreBadge.variant}>{scoreBadge.text}</Badge>
          </CardTitle>
          <CardDescription>
            Overall security posture of your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-bold ${getScoreColor(securityData.overallScore)}`}>
                {securityData.overallScore}%
              </span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target: 95%</p>
                <p className="text-xs text-muted-foreground">
                  {securityData.overallScore >= 90 ? 'Exceeds requirements' : 'Room for improvement'}
                </p>
              </div>
            </div>
            <Progress value={securityData.overallScore} className="w-full" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Last updated</p>
                <p className="font-medium">Just now</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trend</p>
                <p className="font-medium text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% this week
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{securityData.activeThreats}</div>
            <p className="text-xs text-muted-foreground">
              {securityData.resolvedThreats} resolved this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <Eye className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{securityData.vulnerabilities}</div>
            <p className="text-xs text-muted-foreground">
              Potential security gaps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure Users</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {securityData.secureUsers}/{securityData.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              High security clearance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Documents</CardTitle>
            <Lock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {securityData.secureDocuments}/{securityData.totalDocuments}
            </div>
            <p className="text-xs text-muted-foreground">
              High security level
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Security Recommendations
            </CardTitle>
            <CardDescription>
              Actions to improve your security posture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border-l-4 border-success">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium">Enable Multi-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Improve account security for all users
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Review Document Access</p>
                <p className="text-xs text-muted-foreground">
                  Some documents may have overly broad access
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-info/10 rounded-lg border-l-4 border-info">
              <TrendingUp className="h-4 w-4 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium">Update Security Policies</p>
                <p className="text-xs text-muted-foreground">
                  Review and update access control policies
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-4 border-muted">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Conduct Security Training</p>
                <p className="text-xs text-muted-foreground">
                  Schedule regular security awareness sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Security Events
            </CardTitle>
            <CardDescription>
              Latest security-related activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.slice(0, 6).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.profiles && (
                          <>
                            <span>
                              {event.profiles.first_name} {event.profiles.last_name}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{new Date(event.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent security events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityCenter;
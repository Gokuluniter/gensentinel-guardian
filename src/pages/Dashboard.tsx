import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; 
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    activeThreats: 0,
    resolvedThreats: 0,
    todayActivities: 0,
    securityScore: 85,
  });
  const [recentThreats, setRecentThreats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats based on user role
      const statsPromises = [];
      
      if (profile?.role === 'admin' || profile?.role === 'security_officer') {
        // Admin/Security can see all stats
        statsPromises.push(
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('documents').select('id', { count: 'exact' }),
          supabase.from('threat_detections').select('id', { count: 'exact' }).eq('is_resolved', false),
          supabase.from('threat_detections').select('id', { count: 'exact' }).eq('is_resolved', true),
          supabase.from('activity_logs').select('id', { count: 'exact' }).gte('created_at', new Date().toDateString())
        );
      } else {
        // Regular users see limited stats
        statsPromises.push(
          supabase.from('documents').select('id', { count: 'exact' }).eq('department', profile?.department),
          supabase.from('activity_logs').select('id', { count: 'exact' }).eq('user_id', profile?.id)
        );
      }

      const results = await Promise.all(statsPromises);

      if (profile?.role === 'admin' || profile?.role === 'security_officer') {
        setStats({
          totalUsers: results[0].count || 0,
          totalDocuments: results[1].count || 0,
          activeThreats: results[2].count || 0,
          resolvedThreats: results[3].count || 0,
          todayActivities: results[4].count || 0,
          securityScore: Math.max(85 - (results[2].count || 0) * 5, 50), // Dynamic security score
        });

        // Fetch recent threats
        const { data: threats } = await supabase
          .from('threat_detections')
          .select(`
            *,
            profiles(first_name, last_name, department)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentThreats(threats || []);
      } else {
        setStats(prev => ({
          ...prev,
          totalDocuments: results[0].count || 0,
          todayActivities: results[1].count || 0,
        }));
      }

      // Fetch recent activities (filtered by role)
      let activityQuery = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles(first_name, last_name, department, role)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (profile?.role !== 'admin' && profile?.role !== 'security_officer') {
        activityQuery = activityQuery.eq('user_id', profile?.id);
      }

      const { data: activities } = await activityQuery;
      setRecentActivities(activities || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-threat-critical text-white';
      case 'high': return 'bg-threat-high text-white';
      case 'medium': return 'bg-threat-medium text-black';
      case 'low': return 'bg-threat-low text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'logout': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'file_access': return <FileText className="h-4 w-4 text-info" />;
      case 'file_download': return <TrendingUp className="h-4 w-4 text-warning" />;
      default: return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const isAdminOrSecurity = profile?.role === 'admin' || profile?.role === 'security_officer';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-white animate-scale-in hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {profile?.first_name}!
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                {profile?.department?.toUpperCase()} • {profile?.role?.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-primary-foreground/80 text-sm mt-2">
                GenSentinel is actively monitoring your corporate environment for security threats.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.securityScore}%</div>
              <div className="text-sm text-primary-foreground/80">Security Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdminOrSecurity && (
            <>
              <Card className="hover:scale-[1.02] transition-transform duration-200 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Active employees</p>
                </CardContent>
              </Card>

              <Card className="hover:scale-[1.02] transition-transform duration-200 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.activeThreats}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="hover:scale-[1.02] transition-transform duration-200 animate-scale-in" style={{ animationDelay: isAdminOrSecurity ? '0.3s' : '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {isAdminOrSecurity ? 'Total documents' : 'Your department'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200 animate-scale-in" style={{ animationDelay: isAdminOrSecurity ? '0.4s' : '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayActivities}</div>
              <p className="text-xs text-muted-foreground">Actions logged</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Score */}
          <Card className="hover:shadow-lg transition-shadow duration-200 animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Score
              </CardTitle>
              <CardDescription>
                Overall security posture of your environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.securityScore}%</span>
                <Badge variant={stats.securityScore >= 80 ? "default" : "destructive"}>
                  {stats.securityScore >= 80 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={stats.securityScore} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {stats.securityScore >= 80 
                  ? "Your security posture is strong. Keep monitoring for threats."
                  : "Security score is below optimal. Review active threats and take action."
                }
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-shadow duration-200 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover:scale-[1.02] transition-transform duration-200">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-[1.02] transition-transform duration-200">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              {isAdminOrSecurity && (
                <>
                  <Button variant="outline" className="w-full justify-start hover:scale-[1.02] transition-transform duration-200">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-[1.02] transition-transform duration-200">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Threats
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Threats (Admin/Security only) */}
          {isAdminOrSecurity && (
            <Card className="hover:shadow-lg transition-shadow duration-200 animate-scale-in" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Recent Threats
                </CardTitle>
                <CardDescription>
                  Latest security threats detected by GenSentinel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : recentThreats.length > 0 ? (
                  <div className="space-y-4">
                    {recentThreats.slice(0, 5).map((threat: any) => (
                      <div key={threat.id} className="flex items-start justify-between p-3 border rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getThreatLevelColor(threat.threat_level)}>
                              {threat.threat_level?.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{threat.threat_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {threat.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(threat.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent threats detected</p>
                    <p className="text-sm">Your environment is secure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="hover:shadow-lg transition-shadow duration-200 animate-scale-in" style={{ animationDelay: isAdminOrSecurity ? '0.8s' : '0.7s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {isAdminOrSecurity ? 'System-wide activity log' : 'Your recent activity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 8).map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01]">
                      {getActivityIcon(activity.activity_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {isAdminOrSecurity && activity.profiles && (
                            <>
                              <span>
                                {activity.profiles.first_name} {activity.profiles.last_name}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span>{new Date(activity.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
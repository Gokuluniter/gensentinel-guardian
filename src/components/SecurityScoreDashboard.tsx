import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserScore {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
  security_score: number;
  last_score_update: string;
  department: string;
}

const SecurityScoreDashboard = () => {
  const { profile } = useAuth();
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertUsers, setAlertUsers] = useState<UserScore[]>([]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'security_officer';

  useEffect(() => {
    fetchSecurityScores();
    
    // Set up realtime subscription for admins
    if (isAdmin) {
      const channel = supabase
        .channel('security-scores')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `organization_id=eq.${profile?.organization_id}`
          },
          (payload) => {
            console.log('Security score updated:', payload);
            fetchSecurityScores();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.organization_id, isAdmin]);

  const fetchSecurityScores = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, employee_id, security_score, last_score_update, department')
        .eq('organization_id', profile.organization_id)
        .order('security_score', { ascending: true });

      if (error) throw error;

      setUserScores(data || []);
      setAlertUsers((data || []).filter(u => u.security_score < 70));
    } catch (error) {
      console.error('Error fetching security scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Good', variant: 'default' as const };
    if (score >= 60) return { text: 'Fair', variant: 'secondary' as const };
    return { text: 'At Risk', variant: 'destructive' as const };
  };

  if (!isAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Monitoring Active</AlertTitle>
        <AlertDescription>
          Your security score is being monitored. You'll be notified if any unusual activity is detected.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Security Scores...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const avgScore = userScores.length > 0 
    ? Math.round(userScores.reduce((acc, u) => acc + u.security_score, 0) / userScores.length)
    : 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
            <Progress value={avgScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alertUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Score below 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userScores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Being monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {userScores.filter(u => u.security_score >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Score 80+</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Users - Priority Section */}
      {alertUsers.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Users Requiring Immediate Attention
            </CardTitle>
            <CardDescription>
              These users have security scores below the safe threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {alertUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-destructive text-destructive-foreground">
                          {user.first_name[0]}{user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.department} • {user.employee_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(user.security_score)}`}>
                        {user.security_score}
                      </div>
                      <Badge variant="destructive" className="mt-1">
                        At Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* All Users - Sorted by Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All User Security Scores
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {userScores.map((user) => {
                const badge = getScoreBadge(user.security_score);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.first_name[0]}{user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.department} • {user.employee_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`text-2xl font-bold ${getScoreColor(user.security_score)}`}>
                        {user.security_score}
                      </div>
                      <Badge variant={badge.variant}>
                        {badge.text}
                      </Badge>
                      <div className="w-32">
                        <Progress value={user.security_score} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityScoreDashboard;
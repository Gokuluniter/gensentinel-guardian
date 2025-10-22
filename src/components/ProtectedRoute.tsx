import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  allowRestrictedAccess?: boolean; // Allow access even with low security score
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowRestrictedAccess = false 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-primary rounded-xl">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">GenSentinel</h3>
                <p className="text-muted-foreground">Authenticating...</p>
              </div>
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if profile exists - if user is authenticated but no profile, sign out
  if (user && !profile && !loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg border-destructive shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="p-4 bg-destructive/10 rounded-xl mx-auto w-fit">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-destructive">Profile Not Found</h3>
                <p className="text-lg text-muted-foreground mt-2">
                  Your user profile could not be loaded
                </p>
              </div>
              <div className="text-left bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ What happened?
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your account exists but your profile data is missing or has been removed. This can happen if your account was recently deleted or there was an issue with your profile creation.
                </p>
              </div>
              <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📞 What should I do?
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Sign out and sign back in</li>
                  <li>Contact your system administrator</li>
                  <li>Request a new account to be created</li>
                </ul>
              </div>
              <Button 
                variant="default"
                onClick={async () => {
                  // Force sign out and redirect
                  const { supabase } = await import('@/integrations/supabase/client');
                  await supabase.auth.signOut();
                  window.location.href = '/auth';
                }}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check security score - block access if score < 30 (except for dashboard)
  const SECURITY_THRESHOLD = 30;
  const isSecurityRestricted = profile && profile.security_score < SECURITY_THRESHOLD;
  const isDashboardPage = location.pathname === '/dashboard';
  
  if (isSecurityRestricted && !isDashboardPage && !allowRestrictedAccess) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg border-destructive shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="p-4 bg-destructive/10 rounded-xl mx-auto w-fit">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-destructive">Access Restricted</h3>
                <p className="text-lg text-muted-foreground mt-2">
                  Your account access has been limited due to low security score
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Current Security Score</p>
                <div className="text-4xl font-bold text-destructive">
                  {profile.security_score}/100
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Minimum required: {SECURITY_THRESHOLD}
                </p>
              </div>
              <div className="text-left bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Why is my access restricted?
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Multiple suspicious activities have been detected on your account, causing your security score to drop below the safe threshold. For security reasons, your access to certain features has been temporarily restricted.
                </p>
              </div>
              <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📞 What should I do?
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Contact your system administrator immediately</li>
                  <li>Review recent activity logs on your dashboard</li>
                  <li>Report any suspicious activities you didn't perform</li>
                  <li>Change your password if you suspect unauthorized access</li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.location.pathname = '/dashboard';
                  }}
                >
                  Return to Dashboard
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    window.location.pathname = '/notifications';
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  View Security Alerts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role permissions
  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-3 bg-destructive rounded-xl mx-auto w-fit">
                <Shield className="h-8 w-8 text-destructive-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-muted-foreground">
                  You don't have the required permissions to access this area.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Current role: <span className="font-medium">{profile.role}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Required: <span className="font-medium">{requiredRole.join(', ')}</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  window.location.pathname = '/dashboard';
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
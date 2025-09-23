import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Activity,
  Lock,
  Database,
  Mail,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getNavItems = () => {
    const baseItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Documents', url: '/documents', icon: FileText },
      { title: 'Projects', url: '/projects', icon: FolderOpen },
      { title: 'Reports', url: '/reports', icon: BarChart3 },
      { title: 'Messages', url: '/messages', icon: MessageSquare },
      { title: 'Calendar', url: '/calendar', icon: Calendar },
    ];

    const adminItems = [
      { title: 'User Management', url: '/users', icon: Users },
      { title: 'Threat Monitor', url: '/threats', icon: AlertTriangle },
      { title: 'Activity Logs', url: '/activity', icon: Activity },
      { title: 'System Settings', url: '/settings', icon: Settings },
    ];

    const securityItems = [
      { title: 'Security Center', url: '/security', icon: Lock },
      { title: 'Audit Trail', url: '/audit', icon: Database },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ];

    if (profile?.role === 'admin' || profile?.role === 'security_officer') {
      return [...baseItems, ...adminItems, ...securityItems];
    }

    if (profile?.role === 'department_head' || profile?.role === 'supervisor') {
      return [...baseItems, ...securityItems.slice(0, 2)]; // Security Center and Audit Trail only
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'security_officer': return 'bg-warning text-warning-foreground';
      case 'department_head': return 'bg-info text-info-foreground';
      case 'supervisor': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-sidebar-primary">GenSentinel</h2>
              <p className="text-xs text-sidebar-foreground/60">Security Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoleBadgeColor(profile.role)}`}
                    >
                      {profile.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
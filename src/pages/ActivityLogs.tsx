import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Search, Filter, Download, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ActivityLogs = () => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            department,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'document_access': return 'bg-blue-100 text-blue-800';
      case 'document_upload': return 'bg-purple-100 text-purple-800';
      case 'project_create': return 'bg-indigo-100 text-indigo-800';
      case 'project_update': return 'bg-blue-100 text-blue-800';
      case 'report_generate': return 'bg-orange-100 text-orange-800';
      case 'message_send': return 'bg-pink-100 text-pink-800';
      case 'calendar_event': return 'bg-yellow-100 text-yellow-800';
      case 'settings_change': return 'bg-red-100 text-red-800';
      case 'user_management': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || activity.activity_type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const exportLogs = () => {
    toast({
      title: "Export Started",
      description: "Activity logs export has been initiated",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading activity logs...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">Monitor user activities and system events</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Activities</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="document_access">Document Access</option>
          <option value="document_upload">Document Upload</option>
          <option value="project_create">Project Create</option>
          <option value="project_update">Project Update</option>
          <option value="report_generate">Report Generate</option>
          <option value="message_send">Message Send</option>
          <option value="calendar_event">Calendar Event</option>
          <option value="settings_change">Settings Change</option>
          <option value="user_management">User Management</option>
        </select>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{activities.length}</div>
                <div className="text-xs text-muted-foreground">Total Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.activity_type === 'document_access').length}
                </div>
                <div className="text-xs text-muted-foreground">Document Access</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {activities.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
                </div>
                <div className="text-xs text-muted-foreground">Today's Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(activities.map(a => a.user_id)).size}
                </div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {activity.profiles?.first_name} {activity.profiles?.last_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {activity.profiles?.department}
                      </Badge>
                      <Badge className={getActivityTypeColor(activity.activity_type)}>
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.resource_type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resource: {activity.resource_type}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </div>
                  {activity.ip_address && (
                    <div className="text-xs text-muted-foreground">
                      IP: {activity.ip_address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No activities recorded yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
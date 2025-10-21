import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Database,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { exportAuditTrailToCSV } from '@/lib/csvExporter';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles(first_name, last_name, department, role, employee_id)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit trail",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-success text-success-foreground';
      case 'logout': return 'bg-muted text-muted-foreground';
      case 'file_access': return 'bg-info text-info-foreground';
      case 'file_download': return 'bg-warning text-warning-foreground';
      case 'user_created': return 'bg-primary text-primary-foreground';
      case 'user_updated': return 'bg-accent text-accent-foreground';
      case 'threat_detected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'file_access':
      case 'file_download':
        return <FileText className="h-4 w-4" />;
      case 'threat_detected':
        return <Shield className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getRiskLevel = (activity: any) => {
    if (activity.activity_type === 'threat_detected') return 'high';
    if (activity.activity_type === 'file_download') return 'medium';
    if (activity.activity_type === 'login' && activity.metadata?.failed_attempts > 3) return 'medium';
    return 'low';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
      case 'medium': return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case 'low': return <Badge variant="outline">Low Risk</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filterByDate = (log: any) => {
    if (selectedDate === 'all') return true;
    
    const logDate = new Date(log.created_at);
    const now = new Date();
    
    switch (selectedDate) {
      case 'today':
        return logDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.profiles?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || log.activity_type === selectedType;
    const matchesDate = filterByDate(log);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const exportAuditLog = () => {
    try {
      if (filteredLogs.length === 0) {
        toast({
          title: "No Data",
          description: "No audit logs to export. Try adjusting your filters.",
          variant: "destructive",
        });
        return;
      }

      // Convert activity logs format to audit trail format
      const auditEntries = filteredLogs.map((log: any) => ({
        ...log,
        action: log.activity_type,
        resource_type: log.resource_type || 'activity',
        resource_id: log.resource_id,
        changes: log.metadata,
        ip_address: log.ip_address,
        user_agent: log.metadata?.user_agent,
      }));

      const filename = exportAuditTrailToCSV(auditEntries);

      toast({
        title: "Export Successful",
        description: `${filename} has been downloaded with ${filteredLogs.length} records.`,
      });
    } catch (error) {
      console.error('Error exporting audit log:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Trail</h1>
            <p className="text-muted-foreground">Comprehensive audit log of all system activities</p>
          </div>
        </div>
        <div className="space-y-4">
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
            <Database className="h-8 w-8" />
            Audit Trail
          </h1>
          <p className="text-muted-foreground">Comprehensive audit log of all system activities</p>
        </div>
        <Button onClick={exportAuditLog}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {auditLogs.filter(log => getRiskLevel(log) === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => filterByDate(log) && selectedDate !== 'today' ? 
                new Date(log.created_at).toDateString() === new Date().toDateString() : false).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(auditLogs.map(log => log.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, user name, or employee ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="file_access">File Access</SelectItem>
                <SelectItem value="file_download">File Download</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="user_updated">User Updated</SelectItem>
                <SelectItem value="threat_detected">Threat Detected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {log.profiles?.first_name?.charAt(0)}{log.profiles?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActivityTypeColor(log.activity_type)}>
                        {getActivityIcon(log.activity_type)}
                        <span className="ml-1">{log.activity_type.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      {getRiskBadge(getRiskLevel(log))}
                    </div>
                    
                    <p className="text-sm font-medium">{log.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {log.profiles && (
                        <span>
                          User: {log.profiles.first_name} {log.profiles.last_name} 
                          ({log.profiles.employee_id})
                        </span>
                      )}
                      <span>•</span>
                      <span>Department: {log.profiles?.department?.toUpperCase()}</span>
                      <span>•</span>
                      <span>Role: {log.profiles?.role?.replace('_', ' ').toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    
                    {log.ip_address && (
                      <div className="text-xs text-muted-foreground">
                        IP: {log.ip_address}
                        {log.user_agent && (
                          <span className="ml-2">
                            • Agent: {log.user_agent.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                    )}
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="bg-muted/50 p-2 rounded text-xs">
                        <span className="font-medium">Metadata: </span>
                        {JSON.stringify(log.metadata, null, 2).substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or date filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrail;
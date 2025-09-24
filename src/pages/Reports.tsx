import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileBarChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    {
      id: 'activity-summary',
      title: 'Activity Summary',
      description: 'Overview of user activities and system usage',
      type: 'dashboard',
      lastGenerated: '2024-01-15',
      icon: BarChart3
    },
    {
      id: 'security-report',
      title: 'Security Report',
      description: 'Security incidents and threat analysis',
      type: 'security',
      lastGenerated: '2024-01-14',
      icon: FileBarChart
    },
    {
      id: 'department-performance',
      title: 'Department Performance',
      description: 'Performance metrics by department',
      type: 'performance',
      lastGenerated: '2024-01-13',
      icon: TrendingUp
    },
    {
      id: 'document-access',
      title: 'Document Access Log',
      description: 'Document viewing and download statistics',
      type: 'audit',
      lastGenerated: '2024-01-12',
      icon: FileBarChart
    },
    {
      id: 'project-status',
      title: 'Project Status Report',
      description: 'Current status of all active projects',
      type: 'project',
      lastGenerated: '2024-01-11',
      icon: BarChart3
    },
    {
      id: 'user-engagement',
      title: 'User Engagement',
      description: 'User login patterns and platform usage',
      type: 'analytics',
      lastGenerated: '2024-01-10',
      icon: TrendingUp
    }
  ];

  const handleGenerateReport = async (reportId: string, reportTitle: string) => {
    await logActivity('report_generate', `Generated report: ${reportTitle}`, 'report', reportId);
    toast({
      title: "Report Generated",
      description: `${reportTitle} has been generated successfully`,
    });
  };

  const handleDownloadReport = async (reportId: string, reportTitle: string) => {
    await logActivity('report_generate', `Downloaded report: ${reportTitle}`, 'report', reportId);
    toast({
      title: "Report Downloaded",
      description: `${reportTitle} has been downloaded`,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-green-100 text-green-800';
      case 'audit': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view business intelligence reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {report.description}
                </p>
                
                <div className="text-xs text-muted-foreground mb-4">
                  Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleGenerateReport(report.id, report.title)}
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport(report.id, report.title)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Preview Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">247</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">89</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 bg-orange-500/5 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1,432</div>
              <div className="text-sm text-muted-foreground">Activities Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
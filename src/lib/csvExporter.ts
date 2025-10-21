/**
 * CSV Export Utility
 * Export activity logs and audit trails to CSV format
 */

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    role: string;
  };
}

interface AuditTrailEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    role: string;
  };
}

/**
 * Convert data to CSV format
 */
function arrayToCSV(headers: string[], rows: string[][]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of rows) {
    const csvRow = row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvRows.push(csvRow.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export Activity Logs to CSV
 */
export function exportActivityLogsToCSV(activities: ActivityLog[]): string {
  const headers = [
    'Date & Time',
    'User Name',
    'Employee ID',
    'Department',
    'Role',
    'Activity Type',
    'Description',
    'Resource Type',
    'Resource ID',
    'IP Address',
  ];

  const rows = activities.map(activity => [
    new Date(activity.created_at).toLocaleString(),
    activity.profiles ? `${activity.profiles.first_name} ${activity.profiles.last_name}` : 'Unknown User',
    activity.profiles?.employee_id || 'N/A',
    activity.profiles?.department || 'N/A',
    activity.profiles?.role || 'N/A',
    activity.activity_type.replace(/_/g, ' ').toUpperCase(),
    activity.description,
    activity.resource_type || 'N/A',
    activity.resource_id || 'N/A',
    activity.ip_address || 'N/A',
  ]);

  const csvContent = arrayToCSV(headers, rows);
  const filename = `Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(filename, csvContent);
  
  return filename;
}

/**
 * Export Audit Trail to CSV
 */
export function exportAuditTrailToCSV(entries: AuditTrailEntry[]): string {
  const headers = [
    'Date & Time',
    'User Name',
    'Employee ID',
    'Department',
    'Role',
    'Action',
    'Resource Type',
    'Resource ID',
    'Changes',
    'IP Address',
    'User Agent',
  ];

  const rows = entries.map(entry => [
    new Date(entry.created_at).toLocaleString(),
    entry.profiles ? `${entry.profiles.first_name} ${entry.profiles.last_name}` : 'Unknown User',
    entry.profiles?.employee_id || 'N/A',
    entry.profiles?.department || 'N/A',
    entry.profiles?.role || 'N/A',
    entry.action.replace(/_/g, ' ').toUpperCase(),
    entry.resource_type.replace(/_/g, ' ').toUpperCase(),
    entry.resource_id || 'N/A',
    entry.changes ? JSON.stringify(entry.changes) : 'N/A',
    entry.ip_address || 'N/A',
    entry.user_agent || 'N/A',
  ]);

  const csvContent = arrayToCSV(headers, rows);
  const filename = `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(filename, csvContent);
  
  return filename;
}

/**
 * Export filtered Activity Logs to CSV
 */
export function exportFilteredActivityLogs(
  activities: ActivityLog[],
  filterInfo: { searchTerm?: string; activityType?: string }
): string {
  let filename = 'Activity_Logs';
  
  if (filterInfo.searchTerm) {
    filename += `_Search_${filterInfo.searchTerm.substring(0, 20)}`;
  }
  
  if (filterInfo.activityType && filterInfo.activityType !== 'all') {
    filename += `_${filterInfo.activityType}`;
  }
  
  filename += `_${new Date().toISOString().split('T')[0]}.csv`;

  const headers = [
    'Date & Time',
    'User Name',
    'Employee ID',
    'Department',
    'Activity Type',
    'Description',
    'Resource Type',
    'IP Address',
  ];

  const rows = activities.map(activity => [
    new Date(activity.created_at).toLocaleString(),
    activity.profiles ? `${activity.profiles.first_name} ${activity.profiles.last_name}` : 'Unknown User',
    activity.profiles?.employee_id || 'N/A',
    activity.profiles?.department || 'N/A',
    activity.activity_type.replace(/_/g, ' ').toUpperCase(),
    activity.description,
    activity.resource_type || 'N/A',
    activity.ip_address || 'N/A',
  ]);

  const csvContent = arrayToCSV(headers, rows);
  downloadCSV(filename, csvContent);
  
  return filename;
}


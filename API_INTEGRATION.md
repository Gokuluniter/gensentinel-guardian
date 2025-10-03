# GenSentinel API Integration Guide

## Overview
GenSentinel provides a real-time API for companies to send activity logs and receive AI-powered threat analysis with explainable intelligence (XAI).

## Base URL
```
https://boomcddxjyuyytmlpvtw.supabase.co/functions/v1
```

## Authentication
All API requests require your organization API key in the Authorization header:
```
Authorization: Bearer YOUR_API_KEY
```

## Endpoint: Ingest Activity

### POST /ingest-activity

Send employee activity data for real-time threat analysis.

**Request Body:**
```json
{
  "organization_id": "uuid",
  "user_id": "employee_id_or_email",
  "activity_type": "login|logout|file_access|file_download|file_upload|document_view|data_export|system_config",
  "description": "Human readable description of the activity",
  "resource_type": "file|document|system|database",
  "resource_id": "optional_resource_identifier",
  "timestamp": "ISO 8601 timestamp (optional, defaults to now)",
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "file_count": 5,
    "failed_attempts": 0,
    "approved": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "security_score": 85,
  "threat_analysis": {
    "score_impact": -10,
    "threat_level": "medium",
    "reason": "File access during unusual hours",
    "ai_explanation": "Accessing files outside normal business hours..."
  }
}
```

### Activity Types

- **login** - User authentication events
- **logout** - User logout events
- **file_access** - File or document access
- **file_download** - File downloads
- **file_upload** - File uploads
- **document_view** - Document viewing
- **data_export** - Data export operations (HIGH RISK)
- **system_config** - System configuration changes (HIGH RISK)
- **user_management** - User management actions
- **report_generate** - Report generation

### Threat Analysis Rules

GenSentinel uses AI-powered analysis combined with rule-based detection:

1. **Time-based Analysis**: Activities during off-hours (10 PM - 6 AM) are flagged
2. **Volume Analysis**: Bulk operations (>10 files) trigger alerts
3. **Pattern Analysis**: Multiple failed attempts, unusual IP addresses
4. **Risk Scoring**: Each activity impacts the user's security score (0-100)

### Security Score System

- **100-80**: Healthy - Normal behavior
- **79-70**: Fair - Some suspicious activity
- **69-50**: At Risk - Multiple suspicious activities
- **49-0**: Critical - Immediate action required

When a user's score drops below 70, they receive:
- Real-time notification
- XAI explanation of why the alert was triggered
- Recommended actions to take

Admins see all user scores in real-time with automatic highlighting of at-risk users.

## Example Integration

### Python
```python
import requests
import json
from datetime import datetime

def send_activity(user_id, activity_type, description, metadata=None):
    url = "https://boomcddxjyuyytmlpvtw.supabase.co/functions/v1/ingest-activity"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    payload = {
        "organization_id": "YOUR_ORG_ID",
        "user_id": user_id,
        "activity_type": activity_type,
        "description": description,
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": metadata or {}
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# Example: Log file download
result = send_activity(
    user_id="john.doe@company.com",
    activity_type="file_download",
    description="Downloaded quarterly_report.pdf",
    metadata={
        "ip_address": "192.168.1.100",
        "file_count": 1,
        "file_size": 2048000
    }
)

print(f"Security Score: {result['security_score']}")
print(f"Threat Level: {result['threat_analysis']['threat_level']}")
```

### JavaScript/Node.js
```javascript
async function sendActivity(userId, activityType, description, metadata = {}) {
  const response = await fetch(
    'https://boomcddxjyuyytmlpvtw.supabase.co/functions/v1/ingest-activity',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        organization_id: 'YOUR_ORG_ID',
        user_id: userId,
        activity_type: activityType,
        description: description,
        timestamp: new Date().toISOString(),
        metadata: metadata
      })
    }
  );
  
  return await response.json();
}

// Example: Log login attempt
const result = await sendActivity(
  'john.doe@company.com',
  'login',
  'User logged in from new device',
  {
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    device_type: 'mobile'
  }
);

console.log(`Security Score: ${result.security_score}`);
```

## Best Practices

1. **Real-time Integration**: Send activities as they occur for immediate threat detection
2. **Include Metadata**: More context = better AI analysis
3. **Monitor Scores**: Set up webhooks to receive alerts when scores drop
4. **Batch Operations**: For historical data, send activities in chronological order
5. **Error Handling**: Implement retry logic for failed requests

## Rate Limits

- 1000 requests per minute per organization
- Burst limit: 100 requests per second
- Contact support@gensentinel.com for higher limits

## Support

- Email: support@gensentinel.com
- Documentation: https://docs.gensentinel.com
- Status: https://status.gensentinel.com

## Security

- All data is encrypted in transit (TLS 1.3)
- Data is encrypted at rest (AES-256)
- SOC 2 Type II compliant
- GDPR and CCPA compliant

---

**Note**: This is a B2B API. Each organization gets their own isolated workspace with complete data segregation.
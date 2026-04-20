# Analytics & Reporting - Legal Hub

Complete analytics system for tracking productivity and performance.

---

## Overview

The analytics system provides:
- Real-time dashboard metrics
- Historical trend analysis
- Document performance tracking
- Case completion metrics
- Team productivity statistics
- CSV export functionality

---

## API Endpoints

### Dashboard Metrics

**Get all key metrics**

```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Dashboard metrics retrieved",
  "metrics": {
    "documents": {
      "total": 145,
      "signed": 142,
      "pending": 3,
      "byType": {
        "proposal": 35,
        "contract": 45,
        "power_of_attorney": 32,
        "financial_aid_declaration": 33
      },
      "averageTimeToSign": 2.34,
      "signatureSuccessRate": 97.93
    },
    "cases": {
      "total": 87,
      "active": 53,
      "completed": 34,
      "averageCompletionTime": 18.5,
      "byArea": {
        "civil": 28,
        "family": 35,
        "labor": 24
      }
    },
    "team": {
      "totalDocumentsGenerated": 145,
      "averageDocumentsPerDay": 4.8,
      "peakDay": "Tuesday",
      "documentsThisMonth": 145,
      "documentsThisWeek": 32
    },
    "clients": {
      "total": 62,
      "active": 58,
      "averageDocumentsPerClient": 2.34,
      "averageCasesPerClient": 1.40
    },
    "recentActivity": [
      {
        "type": "document",
        "description": "Documento contract - signed",
        "timestamp": "2024-03-19T14:30:00Z"
      }
    ]
  }
}
```

---

### Document Trends

**Get 30-day document trends**

```http
GET /api/analytics/trends/documents?days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response:**
```json
{
  "message": "Document trends retrieved",
  "days": 30,
  "data": [
    {
      "date": "2024-02-19",
      "generated": 3,
      "signed": 3,
      "pending": 0
    },
    {
      "date": "2024-02-20",
      "generated": 5,
      "signed": 5,
      "pending": 0
    }
  ]
}
```

---

### Document Type Breakdown

**Get document statistics by type**

```http
GET /api/analytics/breakdown/document-types
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Document type breakdown retrieved",
  "data": [
    {
      "type": "proposal",
      "count": 35,
      "percentage": 24.14,
      "averageTimeToSign": 1.82
    },
    {
      "type": "contract",
      "count": 45,
      "percentage": 31.03,
      "averageTimeToSign": 2.51
    },
    {
      "type": "power_of_attorney",
      "count": 32,
      "percentage": 22.07,
      "averageTimeToSign": 2.15
    },
    {
      "type": "financial_aid_declaration",
      "count": 33,
      "percentage": 22.76,
      "averageTimeToSign": 2.68
    }
  ]
}
```

---

### Case Completion by Area

**Get case completion rates by legal area**

```http
GET /api/analytics/breakdown/case-completion
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Case completion by area retrieved",
  "data": [
    {
      "area": "civil",
      "completed": 15,
      "total": 28,
      "completionRate": 53.57
    },
    {
      "area": "family",
      "completed": 12,
      "total": 35,
      "completionRate": 34.29
    },
    {
      "area": "labor",
      "completed": 7,
      "total": 24,
      "completionRate": 29.17
    }
  ]
}
```

---

### Monthly Metrics

**Get metrics for specific month**

```http
GET /api/analytics/monthly?month=3&year=2024
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional): Month number (1-12), defaults to current
- `year` (optional): Year, defaults to current

**Response:**
```json
{
  "message": "Monthly metrics retrieved",
  "metrics": {
    "month": 3,
    "year": 2024,
    "documentsGenerated": 145,
    "documentsSigned": 142,
    "casesCreated": 28,
    "casesCompleted": 12,
    "newClients": 8,
    "averageDocumentsPerClient": 2.34
  }
}
```

---

### Export Metrics

**Download metrics as CSV**

```http
GET /api/analytics/export/csv
Authorization: Bearer <token>
```

**Response:** CSV file (text/csv content type)

**Example CSV Content:**
```
Legal Hub Analytics Report
Generated: 2024-03-19 14:30:00

=== DOCUMENT METRICS ===
Total Documents,145
Signed Documents,142
Pending Documents,3
Signature Success Rate,%,97.93
Average Time to Sign,days,2.34

=== CASE METRICS ===
Total Cases,87
Active Cases,53
Completed Cases,34
Average Completion Time,days,18.5

=== TEAM METRICS ===
Total Documents Generated,145
Documents This Month,145
Documents This Week,32
Average Documents Per Day,4.8
Peak Day,Tuesday

=== CLIENT METRICS ===
Total Clients,62
Active Clients,58
Average Documents Per Client,2.34
Average Cases Per Client,1.40

=== DOCUMENT TYPE BREAKDOWN ===
Type,Count,Percentage,Avg Time to Sign (days)
proposal,35,24.14,1.82
contract,45,31.03,2.51
power_of_attorney,32,22.07,2.15
financial_aid_declaration,33,22.76,2.68

=== CASE COMPLETION BY AREA ===
Area,Completed,Total,Completion Rate %
civil,15,28,53.57
family,12,35,34.29
labor,7,24,29.17
```

---

## Frontend Integration

### Using the Dashboard

```typescript
import Dashboard from './pages/Dashboard';

// Add to router
<Route path="/dashboard" element={<Dashboard />} />
```

### Accessing Analytics via API

```typescript
import api from './services/api';

// Get dashboard metrics
const metrics = await api.getDashboardMetrics();
console.log(metrics.metrics);

// Get 30-day trends
const trends = await api.getDocumentTrends(30);
console.log(trends.data);

// Get document type breakdown
const types = await api.getDocumentTypeBreakdown();
console.log(types.data);

// Get case completion by area
const completion = await api.getCaseCompletionByArea();
console.log(completion.data);

// Get monthly metrics
const monthly = await api.getMonthlyMetrics(3, 2024);
console.log(monthly.metrics);

// Export CSV
const csv = await api.exportMetricsCSV();
// Download file
```

---

## Key Metrics Explained

### Average Time to Sign
- Calculation: Sum of (signature date - send date) / number of signed documents
- Unit: Days
- Interpretation: Higher = slower signature process

### Signature Success Rate
- Calculation: (Signed documents / Total documents) × 100
- Unit: Percentage (0-100%)
- Interpretation: Higher = more successful signatures

### Document Type Analysis
- Shows distribution of each document type
- Includes success metrics per type
- Helps identify which documents are most used

### Case Completion Rate
- Calculation: (Completed cases / Total cases) × 100
- Per legal area
- Helps identify which areas complete cases faster

### Team Productivity
- Documents per day = total / days since first document
- Peak day = day with most documents created
- Monthly/weekly = filtered by date range

---

## Metrics Calculation Examples

### Example: Average Signing Time

Documents:
- Document A: Sent Jan 1, Signed Jan 3 = 2 days
- Document B: Sent Jan 2, Signed Jan 5 = 3 days
- Document C: Sent Jan 5, Signed Jan 6 = 1 day

Average = (2 + 3 + 1) / 3 = **2 days**

### Example: Document Type Distribution

Total documents: 145
- Proposals: 35 = 24.14%
- Contracts: 45 = 31.03%
- POA: 32 = 22.07%
- Declarations: 33 = 22.76%

Most used: **Contracts (31%)**

### Example: Case Completion Rate by Area

Civil:
- Completed: 15
- Total: 28
- Rate: (15 / 28) × 100 = **53.57%**

---

## Best Practices

### Dashboard Review
- Review dashboard daily for quick overview
- Check trends weekly for patterns
- Compare monthly for growth

### Document Analysis
- Monitor average signing time
- Identify slow document types
- Optimize based on data

### Case Analysis
- Track completion rates by area
- Identify bottleneck areas
- Plan resource allocation

### Reporting
- Export monthly reports
- Share with stakeholders
- Track progress over time

### Alerts & Thresholds
- Monitor if signing time > 5 days
- Alert if success rate < 95%
- Review if completion < 50%

---

## Troubleshooting

### No data showing
- Verify records exist in database
- Check authentication token
- Ensure dates are correct

### Metrics seem incorrect
- Verify document status updates
- Check database timestamps
- Review data consistency

### Export fails
- Verify write permissions
- Check disk space
- Review file path

### Performance slow
- Check query performance
- Verify indexes exist
- Consider caching

---

## Performance Optimization

### Caching Strategy
- Dashboard: 5 minute cache
- Trends: 5 minute cache
- Breakdown: 5 minute cache
- Monthly: No cache (real-time)

### Database Queries
- Use indexes on status, type, area
- Optimize date range queries
- Consider materialized views for complex calculations

### Frontend Performance
- Lazy load charts
- Virtualize long lists
- Debounce refresh

---

## Security & Privacy

### Data Access
- All endpoints require authentication
- Metrics calculated from user data only
- No cross-user data leakage

### Export Privacy
- CSV files generated on demand
- No storage of exports
- Timestamps for audit trail

### Sensitive Information
- Don't include full CPF in metrics
- Aggregate personal data
- Protect client information

---

## Future Enhancements

- Custom date ranges
- Predictive analytics
- Automated email reports
- Slack notifications
- Multi-team analytics
- Historical comparisons
- Real-time updates
- Performance alerts

---

**Last Updated:** March 2024  
**Version:** 1.0.0  
**Status:** Production Ready

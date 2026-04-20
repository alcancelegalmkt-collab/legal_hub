# Case Progress Tracker - Complete Setup Guide

---

## Overview

The Case Progress Tracker adds comprehensive case management with:
- Real-time progress monitoring
- Google Calendar integration  
- Automated deadline alerts
- Client update emails
- Timeline visualization
- Document tracking

---

## Backend Installation

### Step 1: Install Google API Library

```bash
cd backend
npm install googleapis
```

### Step 2: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI:
   ```
   https://your-domain.com/api/case-progress/calendar/callback
   ```
6. Copy Client ID and Client Secret

### Step 3: Configure Environment Variables

```bash
# backend/.env

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=https://your-domain.com/api/case-progress/calendar/callback

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Legal Hub <noreply@yourdomain.com>
```

### Step 4: Mount Routes

In your main `app.ts`:

```typescript
import caseProgressRoutes from './routes/caseProgressRoutes';

// Mount routes
app.use('/api/case-progress', caseProgressRoutes);
```

### Step 5: Database Tables (Optional)

```sql
-- Store case update history
CREATE TABLE case_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  type VARCHAR(50),
  description TEXT,
  importance VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- Store generated summaries
CREATE TABLE client_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  active_cases INT,
  completed_cases INT,
  pending_documents INT,
  signed_documents INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Track calendar syncs
CREATE TABLE calendar_syncs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  calendar_event_id VARCHAR(255),
  calendar_id VARCHAR(255),
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

---

## Frontend Installation

### Step 1: Update API Service

In `frontend/src/services/api.ts`, add methods:

```typescript
// Case Progress
async getCaseProgress(caseId: number): Promise<any> {
  const { data } = await this.api.get(`/case-progress/cases/${caseId}`);
  return data;
}

async getClientCasesProgress(clientId: number): Promise<any> {
  const { data } = await this.api.get(`/case-progress/clients/${clientId}/cases`);
  return data;
}

async getOpenCasesWithDeadlines(): Promise<any> {
  const { data } = await this.api.get('/case-progress/deadlines/open');
  return data;
}

async getOverdueDeadlines(): Promise<any> {
  const { data } = await this.api.get('/case-progress/deadlines/overdue');
  return data;
}

async getClientSummary(clientId: number): Promise<any> {
  const { data } = await this.api.get(`/case-progress/clients/${clientId}/summary`);
  return data;
}

async generateClientEmail(clientId: number): Promise<any> {
  const { data } = await this.api.get(`/case-progress/clients/${clientId}/email`);
  return data;
}

async sendClientUpdate(clientId: number): Promise<any> {
  const { data } = await this.api.post(`/case-progress/clients/${clientId}/send-update`);
  return data;
}

async syncToGoogleCalendar(caseId: number, calendarId: string): Promise<any> {
  const { data } = await this.api.post('/case-progress/sync-calendar', {
    caseId,
    calendarId,
  });
  return data;
}
```

### Step 2: Create CaseTracker Component

Create `frontend/src/components/CaseTracker.tsx` with:
- Case list with progress bars
- Case details panel
- Document status
- Timeline visualization
- Deadline alerts

### Step 3: Add Routes

In your router:

```typescript
import CaseTracker from './components/CaseTracker';

<Route path="/cases/track" element={<CaseTracker />} />
<Route path="/clients/:clientId/track" element={<CaseTracker clientId={clientId} />} />
```

---

## Testing

### Test Case Progress API

```bash
# Get case progress
curl -X GET http://localhost:3000/api/case-progress/cases/1 \
  -H "Authorization: Bearer <token>"

# Get client cases
curl -X GET http://localhost:3000/api/case-progress/clients/1/cases \
  -H "Authorization: Bearer <token>"

# Get open cases with deadlines
curl -X GET http://localhost:3000/api/case-progress/deadlines/open \
  -H "Authorization: Bearer <token>"

# Get overdue deadlines
curl -X GET http://localhost:3000/api/case-progress/deadlines/overdue \
  -H "Authorization: Bearer <token>"

# Get client summary
curl -X GET http://localhost:3000/api/case-progress/clients/1/summary \
  -H "Authorization: Bearer <token>"
```

### Test Google Calendar Sync

```bash
# Sync case to calendar
curl -X POST http://localhost:3000/api/case-progress/sync-calendar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": 1,
    "calendarId": "primary"
  }'

# Get upcoming deadlines
curl -X GET "http://localhost:3000/api/case-progress/calendar/upcoming-deadlines?calendarId=primary" \
  -H "Authorization: Bearer <token>"
```

### Test Email Generation

```bash
# Generate email
curl -X GET http://localhost:3000/api/case-progress/clients/1/email \
  -H "Authorization: Bearer <token>"

# Send email (requires email service configured)
curl -X POST http://localhost:3000/api/case-progress/clients/1/send-update \
  -H "Authorization: Bearer <token>"
```

---

## Integration with n8n

### Workflow: Auto-Send Weekly Updates

Create workflow that triggers every Monday at 9 AM:

```json
{
  "name": "Weekly Client Updates",
  "trigger": "Schedule (cron)",
  "nodes": [
    {
      "name": "Get All Active Clients",
      "type": "HTTP Request",
      "url": "{{ $env.API_BASE_URL }}/clients?status=active",
      "method": "GET"
    },
    {
      "name": "Loop Through Clients",
      "type": "Loop",
      "steps": [
        {
          "name": "Generate Summary",
          "type": "HTTP Request",
          "url": "{{ $env.API_BASE_URL }}/case-progress/clients/{{ $item.id }}/email",
          "method": "GET"
        },
        {
          "name": "Send Email",
          "type": "SendGrid",
          "to": "{{ $item.email }}",
          "subject": "{{ $json.subject }}",
          "html": "{{ $json.htmlContent }}"
        }
      ]
    }
  ]
}
```

### Workflow: Sync Case Deadline to Calendar

Trigger when case deadline added:

```json
{
  "name": "Sync Deadline to Calendar",
  "trigger": "Webhook (case.deadline.created)",
  "nodes": [
    {
      "name": "Get Case Progress",
      "type": "HTTP Request",
      "url": "{{ $env.API_BASE_URL }}/case-progress/cases/{{ $json.caseId }}"
    },
    {
      "name": "Sync to Calendar",
      "type": "HTTP Request",
      "url": "{{ $env.API_BASE_URL }}/case-progress/sync-calendar",
      "method": "POST",
      "body": {
        "caseId": "{{ $json.caseId }}",
        "calendarId": "primary"
      }
    },
    {
      "name": "Slack Notification",
      "type": "Slack",
      "text": "Deadline synced: {{ $json.caseName }}"
    }
  ]
}
```

---

## Email Service Integration

### Option 1: SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
// services/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  await sgMail.send({
    to: options.to,
    from: process.env.SMTP_FROM || 'noreply@legal-hub.com',
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
```

### Option 2: Nodemailer

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
```

---

## Scheduling Automated Updates

### Option 1: Node-Cron

```bash
npm install node-cron
```

```typescript
import cron from 'node-cron';
import clientUpdateService from './services/clientUpdateService';
import emailService from './services/emailService';

// Every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Sending weekly client updates...');
  const sent = await clientUpdateService.scheduleWeeklyUpdates(emailService);
  console.log(`Sent ${sent} updates`);
});

// Daily deadline check at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Checking overdue deadlines...');
  // Send alerts for overdue deadlines
});
```

### Option 2: Bull (Recommended for Scaling)

```bash
npm install bull redis
```

```typescript
import Queue from 'bull';

const updateQueue = new Queue('client-updates', {
  redis: process.env.REDIS_URL,
});

// Schedule job every week
updateQueue.process(async (job) => {
  const sent = await clientUpdateService.scheduleWeeklyUpdates(emailService);
  return { sent };
});

// Repeating job
updateQueue.add({}, {
  repeat: {
    cron: '0 9 * * 1', // Monday 9 AM
  },
});
```

---

## Monitoring

### Key Metrics to Track

```typescript
// Log case progress updates
logger.info('Case progress updated', {
  caseId: 1,
  completionPercentage: 75,
  timestamp: new Date(),
});

// Log calendar syncs
logger.info('Calendar sync', {
  caseId: 1,
  success: true,
  duration: 1200,
});

// Log email sends
logger.info('Email sent', {
  clientId: 1,
  type: 'weekly_update',
  success: true,
});
```

### Dashboard Queries

```sql
-- Cases needing attention
SELECT c.*, COUNT(d.id) as document_count
FROM cases c
LEFT JOIN documents d ON c.id = d.case_id
WHERE c.status IN ('new', 'in_progress')
AND c.expected_closure_date < DATE_ADD(NOW(), INTERVAL 7 DAY)
ORDER BY c.expected_closure_date ASC;

-- Client update history
SELECT c.*, COUNT(*) as update_count
FROM client_summaries cs
JOIN clients c ON cs.client_id = c.id
GROUP BY c.id
ORDER BY cs.generated_at DESC;

-- Calendar sync status
SELECT c.title, cs.calendar_event_id, cs.synced_at
FROM calendar_syncs cs
JOIN cases c ON cs.case_id = c.id
ORDER BY cs.synced_at DESC;
```

---

## Troubleshooting

### Issue: Case Progress Not Calculating Correctly

**Solution:**
- Verify documents are properly linked to case
- Check document status values match expected ('pending', 'in_progress', 'signed')
- Clear any caching

### Issue: Google Calendar Sync Fails

**Solution:**
- Verify OAuth credentials in environment
- Check calendar ID is valid (use 'primary' for default)
- Ensure API is enabled in Google Cloud
- Review error logs for specific error

### Issue: Email Not Sending

**Solution:**
- Verify email service credentials
- Check SMTP port (usually 587 for TLS)
- Test with simple email first
- Review mail service logs

### Issue: Performance Slow

**Solution:**
- Add database indexes on frequently queried fields
- Implement caching for case progress
- Use pagination for large result sets
- Monitor database query performance

---

## Security Checklist

- [ ] Google OAuth credentials secured in environment
- [ ] Email credentials not in code
- [ ] All endpoints require authentication
- [ ] Case data filtered by user access
- [ ] Database queries parameterized
- [ ] HTTPS enabled for calendar sync
- [ ] SMTP connection uses TLS/SSL
- [ ] No sensitive data in email preview
- [ ] Rate limiting on email sends
- [ ] Audit log for case updates

---

**Last Updated:** March 2024  
**Status:** Production Ready  
**Version:** 1.0.0

# PWA Setup Guide - Legal Hub

Complete guide to setting up Progressive Web App features.

---

## Prerequisites

- Node.js 14+
- npm or yarn
- HTTPS enabled (required for PWA)
- Modern browser with PWA support

---

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications.

```bash
# Install web-push globally
npm install -g web-push

# Generate keys
web-push generate-vapid-keys

# Output:
# Public Key: <base64-string>
# Private Key: <base64-string>
```

Save these keys securely.

---

## Step 2: Configure Backend

### Update .env

```bash
# backend/.env

# Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your-email@example.com

# HTTPS Configuration
NODE_ENV=production
SECURE_COOKIE=true
```

### Install Dependencies

```bash
cd backend
npm install web-push
```

### Mount Notification Routes

In your main app file (e.g., `app.ts`):

```typescript
import notificationsRoutes from './routes/notificationsRoutes';

// Mount routes
app.use('/api/notifications', notificationsRoutes);

// Ensure all responses are sent with proper headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
```

---

## Step 3: Configure Frontend

### Update .env

```bash
# frontend/.env

REACT_APP_VAPID_PUBLIC_KEY=your_public_key_here
REACT_APP_API_URL=https://your-domain.com/api
```

### Initialize Service Worker

In your main `App.tsx` or `index.tsx`:

```typescript
import { useEffect } from 'react';
import pushNotificationService from './services/pushNotificationService';
import offlineService from './services/offlineService';

function App() {
  useEffect(() => {
    // Initialize PWA services
    const initPWA = async () => {
      // Initialize service worker
      await pushNotificationService.initialize();
      
      // Initialize offline storage
      await offlineService.initialize();
      
      // Request notification permission
      const isSupported = await pushNotificationService.isPushNotificationSupported();
      if (isSupported) {
        await pushNotificationService.requestNotificationPermission();
      }
    };

    initPWA();
  }, []);

  return (
    // Your app components
  );
}
```

### Verify Service Worker Registration

In browser DevTools:
1. Open Application tab
2. Check Service Workers section
3. Should show "activated and running"

---

## Step 4: HTTPS Configuration

PWA requires HTTPS in production.

### Option 1: Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate path
/etc/letsencrypt/live/your-domain.com/
```

### Option 2: Self-Signed (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Step 5: Manifest Configuration

The `manifest.json` is already created in `/frontend/public/manifest.json`.

Customize icons:
```json
{
  "icons": [
    {
      "src": "/logo-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add your actual logo images to `public/` directory.

---

## Step 6: Service Worker Configuration

The service worker is located at `/frontend/public/service-worker.js`.

### Customize Cache Strategy

```javascript
// In service-worker.js

const CACHE_VERSION = 'legal-hub-v1'; // Update version to bust cache

const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add critical assets
  '/styles/main.css',
  '/scripts/app.js',
];
```

### Cache Retention

```javascript
// Adjust cache expiration in fetch event
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

if (Date.now() - response.date > CACHE_MAX_AGE) {
  cache.delete(request);
}
```

---

## Step 7: Testing

### Test Service Worker

```bash
# Open DevTools
# Go to Application → Service Workers
# Should show "activated and running"

# Test offline
# Application → Conditions → Offline
# App should still work
```

### Test Push Notifications

```bash
# In browser console
navigator.serviceWorkerContainer.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Subscription:', subscription);
  });
});
```

### Test Installation

```bash
# Chrome/Edge
# Address bar → Install button

# Android Chrome
# Menu → Add to Home screen

# Desktop
# Command+Shift+M or Ctrl+Shift+M
```

---

## Step 8: Monitoring

### Check Notification Subscriptions

```bash
# Backend monitoring
curl http://localhost:3000/api/notifications/stats \
  -H "Authorization: Bearer <token>"
```

### Monitor Service Worker

```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => {
      console.log('Service Worker:', reg);
      console.log('State:', reg.installing || reg.waiting || reg.active);
    });
  });
```

### Check Storage Usage

```javascript
// In browser console
navigator.storage.estimate().then(estimate => {
  console.log('Storage used:', estimate.usage, 'bytes');
  console.log('Storage quota:', estimate.quota, 'bytes');
});
```

---

## Step 9: Deployment

### Environment Setup

```bash
# Production environment
NODEJS_VERSION=18.x
NODE_ENV=production
LOG_LEVEL=info
```

### Database Setup

```sql
-- Create notification subscriptions table (if needed)
CREATE TABLE notification_subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  endpoint VARCHAR(1000) NOT NULL UNIQUE,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Docker Deployment

```dockerfile
# Dockerfile for PWA backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

## Step 10: Troubleshooting

### Service Worker Not Installing

```javascript
// Clear service workers
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });

// Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Push Notifications Not Working

```bash
# Check VAPID keys
echo $VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY

# Test notification manually
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test",
    "body": "Test notification"
  }'
```

### Offline Mode Not Working

```javascript
// Check IndexedDB
const db = await new Promise((resolve, reject) => {
  const req = indexedDB.open('LegalHubDB');
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

db.objectStoreNames; // Check object stores
```

### Cache Issues

```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

## Performance Checklist

- [ ] HTTPS enabled
- [ ] Service Worker registered
- [ ] Manifest valid
- [ ] Icons present (192px, 512px)
- [ ] Offline functionality tested
- [ ] Push notifications working
- [ ] IndexedDB storage verified
- [ ] Network-first strategy for APIs
- [ ] Cache-first strategy for assets
- [ ] Notification permissions working
- [ ] PWA installable
- [ ] Performance metrics < 3s load

---

## Security Checklist

- [ ] HTTPS certificate valid
- [ ] VAPID keys stored securely
- [ ] JWT tokens verified
- [ ] CSP headers set
- [ ] XSS protections enabled
- [ ] CSRF tokens implemented
- [ ] IndexedDB data encrypted
- [ ] Sensitive data not cached
- [ ] Storage quota monitored
- [ ] Service Worker HTTPS only

---

## Production Deployment Checklist

- [ ] All environment variables set
- [ ] HTTPS configured
- [ ] Database backed up
- [ ] Monitoring enabled
- [ ] Logs configured
- [ ] Error tracking setup
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Rate limiting enabled
- [ ] DDoS protection enabled
- [ ] SSL certificate auto-renewal
- [ ] Backup procedure documented

---

**Last Updated:** March 2024  
**Version:** 1.0.0  
**Status:** Production Ready

# PWA Update System Documentation

## Overview

The ConsolatrixConnect PWA now includes an automatic update detection system that notifies users when a new version is available. Users can then update the app with a single click.

## How It Works

### 1. **Update Detection**
- Service worker checks for updates every 30 minutes
- When a new service worker is installed, it notifies all open windows/tabs
- Uses both direct messaging and BroadcastChannel for cross-tab communication

### 2. **User Notification**
- A blue banner appears at the top of the app with "New version available!"
- Banner includes:
  - Download icon
  - Description of the update
  - "Update" button
  - "Dismiss" button (X)

### 3. **Update Process**
When user clicks "Update":
1. App gets all service worker registrations
2. Activates the waiting service worker
3. Sends `SKIP_WAITING` message to activate immediately
4. Listens for controller change
5. Reloads the page with new version
6. User gets the latest features and bug fixes

## Files Involved

### New Files
- **`components/pwa-update-banner.tsx`** - Update notification banner component
- **`docs/PWA_UPDATE_SYSTEM.md`** - This documentation

### Modified Files
- **`public/service-worker.js`** - Updated to v5 with update notifications
- **`components/service-worker-register.tsx`** - Enhanced update detection
- **`app/layout.tsx`** - Added PWAUpdateBanner component

## Key Features

✅ **Automatic Detection** - Checks for updates every 30 minutes
✅ **Cross-Tab Communication** - Notifies all open windows of updates
✅ **User Control** - Users can dismiss or update at their convenience
✅ **Seamless Update** - No data loss, offline data persists
✅ **Loading State** - Shows spinner while updating
✅ **Fallback Reload** - Reloads if controller doesn't change within 1 second

## Update Flow

```
┌─────────────────────────────────────────┐
│  New Service Worker Installed           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Service Worker Sends UPDATE_AVAILABLE  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  PWAUpdateBanner Shows Blue Banner      │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   Update      Dismiss
      │             │
      ▼             ▼
  Activate      Banner
  New SW        Dismissed
      │
      ▼
  Reload Page
      │
      ▼
  New Version
  Loaded
```

## Cache Version Management

When deploying a new version:
1. Update your code/assets
2. The service worker automatically detects changes
3. Cache version increments (currently at v5)
4. Old caches are cleaned up automatically

## Testing the Update System

### Local Testing
1. Make changes to your app
2. Increment `CACHE_NAME` in `service-worker.js`
3. Refresh the page
4. You should see the update banner

### Production Testing
1. Deploy new version to Render
2. The service worker will detect the change
3. Users will see the update banner
4. Click "Update" to get the latest version

## User Experience

### For End Users
1. User opens the app
2. Service worker checks for updates in background
3. If new version found, blue banner appears
4. User can click "Update" to get latest version immediately
5. Or dismiss the banner and update later

### For Developers
1. Deploy new version to production
2. Service worker automatically detects changes
3. No manual cache busting needed
4. Users get notified automatically

## Troubleshooting

### Update Banner Not Appearing
- Check browser console for errors
- Ensure service worker is registered
- Try clearing browser cache and reloading
- Check if BroadcastChannel is supported

### Update Fails
- Check browser console for errors
- Ensure new service worker is properly deployed
- Try manual page refresh
- Clear service worker cache and re-register

### Users Stuck on Old Version
- Remind users to click "Update" when banner appears
- Users can also clear app cache and reload
- On mobile, reinstalling the PWA forces latest version

## Browser Support

- ✅ Chrome/Chromium (v40+)
- ✅ Firefox (v44+)
- ✅ Safari (v11.1+)
- ✅ Edge (v17+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## Performance Impact

- Minimal: Update check runs every 30 minutes
- No impact on app performance
- Update process is non-blocking
- Users can continue using app while update is available

## Security

- Updates are served over HTTPS only
- Service worker validates all cached content
- No sensitive data is exposed during updates
- Users maintain full control over when to update

## Future Enhancements

Potential improvements:
- Scheduled updates at specific times
- Automatic update after timeout
- Update progress indicator
- Rollback capability
- Update changelogs/release notes

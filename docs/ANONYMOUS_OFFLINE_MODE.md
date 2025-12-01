# Anonymous Offline Mode - Implementation Guide

## Overview

This document describes the anonymous offline mode feature that allows users to browse the ConsolatrixConnect app offline without logging in. When offline, users can click "Continue Anonymously" on the login page to access limited features.

## Features

### What Users Can Access in Anonymous Offline Mode

Users in anonymous offline mode can access the following pages and features:

- **Dashboards**
  - Basic Education Dashboard
  - College Dashboard

- **Static Content**
  - About Us
  - History
  - Core Values
  - Vision & Mission
  - Consolarician Values
  - Institutional Objectives
  - School Seal
  - Basic Education Department
  - College Department
  - Sections
  - Records
  - Profile (View Only)
  - Foreword
  - AR Foundresses
  - Handbook Revision Process
  - Letter to Students
  - Courses

### What Users CANNOT Access in Anonymous Offline Mode

The following features require an internet connection and will show a "This page requires internet connection" message:

- Violations
- Chats
- Admin Panel
- Announcements
- Profile Edit
- Login/Signup

## User Flow

### Step 1: User Goes Offline
When a user loses internet connection while on the login page, they will see:
- A blue notification banner: "⚠️ No internet connection detected. You can browse static content offline without logging in."
- A "Continue Anonymously" button

### Step 2: Click Continue Anonymously
When the user clicks "Continue Anonymously":
1. The app enables anonymous offline mode
2. The user is redirected to `/basic-education-dashboard`
3. An orange indicator appears at the top: "📱 Offline Mode (Anonymous) - Limited features available..."

### Step 3: Browse Offline Content
Users can browse all offline-accessible pages. When they try to access an online-only feature:
- A yellow notification appears: "This feature requires internet connection"
- The feature is disabled/hidden
- A message explains they need to connect to the internet

### Step 4: Go Back Online
When the user reconnects to the internet:
- The offline indicator disappears
- All features become accessible
- They can log in normally

## Implementation Details

### Files Modified/Created

1. **lib/offline-auth.ts** - Enhanced with:
   - `enableAnonymousMode()` - Enable anonymous offline mode
   - `isAnonymousMode()` - Check if in anonymous mode
   - `disableAnonymousMode()` - Disable anonymous mode
   - `isFeatureOnlineOnly()` - Check if feature requires internet
   - `isFeatureOfflineAccessible()` - Check if feature is accessible offline
   - Feature lists: `ONLINE_ONLY_FEATURES`, `OFFLINE_ACCESSIBLE_FEATURES`

2. **app/login/page.tsx** - Updated:
   - Import `enableAnonymousMode` function
   - `handleContinueAnonymously()` now redirects to dashboard instead of home
   - Calls `enableAnonymousMode()` before redirect

3. **components/offline-detector.tsx** - Updated:
   - Import `isAnonymousMode` function
   - Allow anonymous users to access dashboards and offline pages
   - Redirect to fallback for online-only features

4. **components/offline-feature-guard.tsx** - NEW:
   - Component that guards features requiring internet
   - Shows "needs internet connection" message for blocked features
   - Can be wrapped around any feature component

5. **hooks/use-offline-mode.ts** - NEW:
   - Custom hook to check offline mode status
   - Provides `canAccessFeature()` method
   - Returns: `isOffline`, `isAnonymous`, `isAuthenticated`, `canAccessFeature`

6. **components/anonymous-offline-indicator.tsx** - NEW:
   - Shows orange indicator when in anonymous offline mode
   - Displays at top of page
   - Only visible when offline AND in anonymous mode

7. **app/layout.tsx** - Updated:
   - Added `AnonymousOfflineIndicator` component

8. **public/service-worker.js** - Updated:
   - Cache version bumped to v2
   - Added `ANONYMOUS_OFFLINE_PAGES` list
   - Ensures dashboard pages are cached

## Usage in Components

### Using OfflineFeatureGuard

```tsx
import { OfflineFeatureGuard } from '@/components/offline-feature-guard'

export function ViolationsPage() {
  return (
    <OfflineFeatureGuard feature="violations">
      {/* Your violations content */}
    </OfflineFeatureGuard>
  )
}
```

### Using useOfflineMode Hook

```tsx
import { useOfflineMode } from '@/hooks/use-offline-mode'

export function MyComponent() {
  const { isOffline, isAnonymous, canAccessFeature } = useOfflineMode()

  if (!canAccessFeature('chats')) {
    return <div>This feature requires internet connection</div>
  }

  return <div>Chats content</div>
}
```

## Testing

### Test Scenario 1: Anonymous Offline Mode
1. Open the app in a browser
2. Go to DevTools > Network tab
3. Check "Offline" to simulate offline mode
4. Navigate to `/login`
5. Click "Continue Anonymously"
6. Verify you're redirected to dashboard
7. Verify orange indicator appears
8. Try accessing a page that requires internet (e.g., `/violations`)
9. Verify "needs internet" message appears

### Test Scenario 2: Authenticated Offline Mode
1. Log in while online
2. Go offline (DevTools > Network > Offline)
3. Refresh the page
4. Verify you're redirected to dashboard
5. Verify you can access all offline-accessible features
6. Verify orange indicator does NOT appear (only for anonymous mode)

### Test Scenario 3: Online Mode
1. Go online
2. Verify all features are accessible
3. Verify indicators disappear

## Storage

Anonymous mode status is stored in `localStorage`:
- Key: `anonymousOfflineMode`
- Value: `'true'` or removed when disabled

This persists across page refreshes while offline.

## Security Considerations

- Anonymous offline mode only allows access to static/read-only content
- No sensitive data is exposed
- Users cannot perform actions that require authentication
- When online, users must log in to access authenticated features
- Anonymous mode is automatically disabled when user logs in

## Future Enhancements

1. Add ability to queue actions while offline and sync when online
2. Implement offline data caching for specific features
3. Add sync status indicator
4. Implement conflict resolution for offline changes
5. Add offline-first search functionality

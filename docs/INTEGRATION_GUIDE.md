# Integration Guide - Anonymous Offline Mode

## Quick Start

This guide shows how to integrate the anonymous offline mode feature into your existing dashboard and feature pages.

## 1. Protecting Online-Only Features

### Option A: Using OfflineFeatureGuard Component

Wrap any feature that requires internet with the `OfflineFeatureGuard` component:

```tsx
"use client"

import { OfflineFeatureGuard } from '@/components/offline-feature-guard'

export default function ViolationsPage() {
  return (
    <OfflineFeatureGuard feature="violations">
      <div>
        {/* Your violations content here */}
      </div>
    </OfflineFeatureGuard>
  )
}
```

### Option B: Using useOfflineMode Hook

For more granular control, use the `useOfflineMode` hook:

```tsx
"use client"

import { useOfflineMode } from '@/hooks/use-offline-mode'

export default function ChatsPage() {
  const { isOffline, isAnonymous, canAccessFeature } = useOfflineMode()

  if (!canAccessFeature('chats')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          This feature requires internet connection
        </h3>
        <p className="text-gray-600">
          You're currently browsing offline in anonymous mode. 
          Please connect to the internet to access this feature.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Your chats content here */}
    </div>
  )
}
```

## 2. Conditional Feature Rendering in Dashboards

### Example: Basic Education Dashboard with Offline Support

```tsx
"use client"

import { useOfflineMode } from '@/hooks/use-offline-mode'
import { OfflineFeatureGuard } from '@/components/offline-feature-guard'

export default function BasicEducationDashboard() {
  const { isOffline, isAnonymous, canAccessFeature } = useOfflineMode()

  return (
    <div className="p-6">
      <h1>Basic Education Dashboard</h1>

      {/* Always accessible offline */}
      <section className="mb-6">
        <h2>Sections</h2>
        {/* Sections content */}
      </section>

      {/* Conditionally show based on online status */}
      {canAccessFeature('violations') ? (
        <section className="mb-6">
          <h2>Violations</h2>
          {/* Violations content */}
        </section>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Violations feature requires internet connection
          </p>
        </div>
      )}

      {/* Or use the guard component */}
      <OfflineFeatureGuard feature="announcements">
        <section className="mb-6">
          <h2>Announcements</h2>
          {/* Announcements content */}
        </section>
      </OfflineFeatureGuard>
    </div>
  )
}
```

## 3. Navigation Menu - Show/Hide Items

```tsx
"use client"

import Link from 'next/link'
import { useOfflineMode } from '@/hooks/use-offline-mode'

export function NavigationMenu() {
  const { canAccessFeature } = useOfflineMode()

  return (
    <nav>
      <Link href="/basic-education-dashboard">Dashboard</Link>
      <Link href="/sections">Sections</Link>
      <Link href="/records">Records</Link>

      {/* Only show if accessible */}
      {canAccessFeature('violations') && (
        <Link href="/violations">Violations</Link>
      )}

      {/* Show disabled state if not accessible */}
      {!canAccessFeature('chats') && (
        <span className="opacity-50 cursor-not-allowed" title="Requires internet">
          Chats
        </span>
      )}
      {canAccessFeature('chats') && (
        <Link href="/chats">Chats</Link>
      )}
    </nav>
  )
}
```

## 4. Buttons and Actions

```tsx
"use client"

import { useOfflineMode } from '@/hooks/use-offline-mode'

export function ActionButtons() {
  const { canAccessFeature } = useOfflineMode()

  return (
    <div className="flex gap-4">
      <button className="btn btn-primary">
        View Profile
      </button>

      <button
        disabled={!canAccessFeature('violations')}
        className={`btn ${canAccessFeature('violations') ? 'btn-primary' : 'btn-disabled'}`}
        title={!canAccessFeature('violations') ? 'Requires internet connection' : ''}
      >
        Report Violation
      </button>

      <button
        disabled={!canAccessFeature('chats')}
        className={`btn ${canAccessFeature('chats') ? 'btn-primary' : 'btn-disabled'}`}
        title={!canAccessFeature('chats') ? 'Requires internet connection' : ''}
      >
        Send Message
      </button>
    </div>
  )
}
```

## 5. API Calls - Handle Offline Scenarios

```tsx
"use client"

import { useOfflineMode } from '@/hooks/use-offline-mode'

export function DataFetcher() {
  const { isOffline, canAccessFeature } = useOfflineMode()

  const handleFetchViolations = async () => {
    if (!canAccessFeature('violations')) {
      alert('This feature requires internet connection')
      return
    }

    try {
      const response = await fetch('/api/violations')
      // Handle response
    } catch (error) {
      if (isOffline) {
        alert('You are offline. This feature requires internet connection.')
      } else {
        alert('Error fetching violations')
      }
    }
  }

  return (
    <button onClick={handleFetchViolations}>
      Fetch Violations
    </button>
  )
}
```

## 6. Offline Accessible Features List

These features are accessible in anonymous offline mode:

```
- basic-education-dashboard
- college-dashboard
- about-us
- history
- core-values
- vision-mission
- consolarician-values
- institutional-objectives
- school-seal
- basic-education-department
- college-department
- sections
- records
- profile (view only)
- foreword
- ar-foundresses
- handbook-revision-process
- letter-to-students
- courses
```

## 7. Online-Only Features List

These features require internet connection:

```
- violations
- chats
- admin
- announcements
- profile-edit
- login
- signup
```

## 8. Testing Your Integration

### Test Checklist

- [ ] Feature is hidden/disabled when offline in anonymous mode
- [ ] Feature is visible/enabled when online
- [ ] Feature is visible/enabled when authenticated offline
- [ ] Appropriate error message is shown
- [ ] No console errors
- [ ] Navigation works correctly
- [ ] Buttons are properly disabled/enabled

### Manual Testing Steps

1. **Test Offline Anonymous Mode:**
   ```
   1. DevTools > Network > Offline
   2. Navigate to /login
   3. Click "Continue Anonymously"
   4. Try accessing /violations
   5. Verify message appears
   ```

2. **Test Online Mode:**
   ```
   1. DevTools > Network > Online
   2. Refresh page
   3. Verify all features are accessible
   ```

3. **Test Authenticated Offline:**
   ```
   1. Log in while online
   2. Go offline
   3. Verify all offline-accessible features work
   4. Verify no "needs internet" messages appear
   ```

## 9. Common Patterns

### Pattern 1: Feature Section with Fallback

```tsx
<section>
  <h2>Feature Name</h2>
  <OfflineFeatureGuard 
    feature="feature-name"
    fallback={
      <div className="alert alert-warning">
        This section requires internet connection
      </div>
    }
  >
    {/* Feature content */}
  </OfflineFeatureGuard>
</section>
```

### Pattern 2: Conditional Rendering

```tsx
const { canAccessFeature } = useOfflineMode()

{canAccessFeature('feature-name') ? (
  <FeatureComponent />
) : (
  <OfflineMessage />
)}
```

### Pattern 3: Disabled State

```tsx
const { canAccessFeature } = useOfflineMode()

<button disabled={!canAccessFeature('feature-name')}>
  Action
</button>
```

## Support

For issues or questions, refer to `ANONYMOUS_OFFLINE_MODE.md` for detailed documentation.

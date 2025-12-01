# Anonymous Offline Mode - Quick Reference

## 🎯 What It Does

Users can click "Continue Anonymously" when offline to access the dashboard with limited features.

## 📍 Key Files

| File | Purpose |
|------|---------|
| `lib/offline-auth.ts` | Core offline auth functions |
| `components/offline-feature-guard.tsx` | Guard online-only features |
| `hooks/use-offline-mode.ts` | Check offline permissions |
| `components/anonymous-offline-indicator.tsx` | Show offline status |
| `docs/ANONYMOUS_OFFLINE_MODE.md` | Full documentation |
| `docs/INTEGRATION_GUIDE.md` | Integration examples |

## 🔧 How to Use

### Protect a Feature

```tsx
import { OfflineFeatureGuard } from '@/components/offline-feature-guard'

<OfflineFeatureGuard feature="violations">
  {/* Your content */}
</OfflineFeatureGuard>
```

### Check Permission

```tsx
import { useOfflineMode } from '@/hooks/use-offline-mode'

const { canAccessFeature } = useOfflineMode()

if (!canAccessFeature('chats')) {
  return <div>Requires internet</div>
}
```

## ✅ Accessible Offline (Anonymous Mode)

- Basic Education Dashboard
- College Dashboard
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

## ❌ Requires Internet (Online-Only)

- Violations
- Chats
- Admin Panel
- Announcements
- Profile Edit
- Login/Signup

## 🧪 Quick Test

1. DevTools → Network → Offline
2. Go to `/login`
3. Click "Continue Anonymously"
4. Should see dashboard with orange indicator
5. Try accessing `/violations` → should show "needs internet" message

## 📚 Functions

### From `lib/offline-auth.ts`

```tsx
enableAnonymousMode()           // Enable anonymous mode
isAnonymousMode()               // Check if anonymous
disableAnonymousMode()          // Disable anonymous mode
isFeatureOnlineOnly(feature)    // Check if requires internet
isFeatureOfflineAccessible(f)   // Check if accessible offline
isOnline()                      // Check if online
isOfflineAuthenticated()        // Check if authenticated offline
getOfflineUser()                // Get stored user data
```

### From `hooks/use-offline-mode.ts`

```tsx
const {
  isOffline,        // boolean
  isAnonymous,      // boolean
  isAuthenticated,  // boolean
  canAccessFeature  // (feature: string) => boolean
} = useOfflineMode()
```

## 🎨 Components

### OfflineFeatureGuard

```tsx
<OfflineFeatureGuard 
  feature="violations"
  fallback={<CustomMessage />}
>
  {/* Content */}
</OfflineFeatureGuard>
```

### AnonymousOfflineIndicator

Automatically shown at top when offline + anonymous. No props needed.

```tsx
<AnonymousOfflineIndicator />
```

## 💾 Storage

- `anonymousOfflineMode` - localStorage key for anonymous mode status
- `currentUser` - localStorage key for user data
- `pwa_auth_token` - localStorage key for auth token

## 🔄 User Flow

```
Offline → Login Page → Click "Continue Anonymously"
  ↓
Dashboard (with orange indicator)
  ↓
Can access: dashboards, static content
Cannot access: violations, chats, admin, announcements
  ↓
Go Online → All features accessible
```

## 📝 Common Patterns

### Pattern 1: Conditional Rendering

```tsx
{canAccessFeature('violations') ? (
  <ViolationsComponent />
) : (
  <OfflineMessage />
)}
```

### Pattern 2: Disabled Button

```tsx
<button disabled={!canAccessFeature('chats')}>
  Send Message
</button>
```

### Pattern 3: Guarded Section

```tsx
<OfflineFeatureGuard feature="announcements">
  <AnnouncementsSection />
</OfflineFeatureGuard>
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Indicator not showing | Check `isAnonymousMode()` returns true |
| Feature still accessible offline | Wrap with `OfflineFeatureGuard` |
| Can't access dashboard offline | Check service worker cache |
| Anonymous mode not persisting | Check localStorage is enabled |

## 📞 Need Help?

- See `docs/ANONYMOUS_OFFLINE_MODE.md` for detailed docs
- See `docs/INTEGRATION_GUIDE.md` for examples
- See `docs/IMPLEMENTATION_SUMMARY.md` for overview

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Production Ready ✅

// Offline authentication utilities for PWA

export interface StoredUser {
  id: string
  firstName: string
  lastName: string
  email: string
  studentId: string
  department: string
  yearLevel: string
  role: string
  section?: string | null
  strand?: string | null
  course?: string | null
  profilePicture?: string | null
  profilePictureName?: string | null
  loginToken?: string
  loginTimestamp?: number
}

const TOKEN_KEY = 'pwa_auth_token'
const USER_KEY = 'currentUser'
const ANONYMOUS_MODE_KEY = 'anonymousOfflineMode'
const SESSION_KEY = 'pwa_session_token'
const TOKEN_EXPIRY_DAYS = 30 // Token valid for 30 days
const SESSION_EXPIRY_DAYS = 365 // Session valid for 1 year (persistent login)

// Features that require internet connection
export const ONLINE_ONLY_FEATURES = [
  'violations',
  'chats',
  'admin',
  'announcements',
  'profile-edit',
  'login',
  'signup'
]

// Features accessible offline
export const OFFLINE_ACCESSIBLE_FEATURES = [
  'basic-education-dashboard',
  'college-dashboard',
  'about-us',
  'history',
  'core-values',
  'vision-mission',
  'consolarician-values',
  'institutional-objectives',
  'school-seal',
  'basic-education-department',
  'college-department',
  'college-courses-offered',
  'historical-background',
  'sections',
  'records',
  'profile',
  'foreword',
  'ar-foundresses',
  'handbook-revision-process',
  'letter-to-students',
  'courses'
]

/**
 * Save authentication token and user data for offline use
 */
export function saveOfflineAuth(user: StoredUser, token?: string): void {
  if (typeof window === 'undefined') return

  try {
    // Store user data (already stored by login, but ensure it's complete)
    localStorage.setItem(USER_KEY, JSON.stringify({
      ...user,
      loginToken: token || generateSimpleToken(user.id),
      loginTimestamp: Date.now()
    }))

    // Store token separately for quick access
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.setItem(TOKEN_KEY, generateSimpleToken(user.id))
    }
  } catch (error) {
    console.error('Error saving offline auth:', error)
  }
}

/**
 * Check if user is authenticated offline
 */
export function isOfflineAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  try {
    // Check for token (new PWA auth) or currentUser (existing auth)
    const token = localStorage.getItem(TOKEN_KEY)
    let userData = localStorage.getItem(USER_KEY)
    
    // Fallback to currentUser for backward compatibility
    if (!userData) {
      userData = localStorage.getItem('currentUser')
    }

    if (!userData) {
      return false
    }

    // If we have currentUser but no token, create one (for existing users)
    if (!token && userData) {
      try {
        const user = JSON.parse(userData) as StoredUser
        if (user.id && user.email) {
          // Generate token for existing user
          const newToken = generateSimpleToken(user.id)
          localStorage.setItem(TOKEN_KEY, newToken)
          // Update user data with token info
          const updatedUser = {
            ...user,
            loginToken: newToken,
            loginTimestamp: user.loginTimestamp || Date.now()
          }
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
          return true
        }
      } catch (e) {
        return false
      }
    }

    // Check if token is expired (using SESSION_EXPIRY_DAYS for persistent login)
    const user = JSON.parse(userData) as StoredUser
    if (user.loginTimestamp) {
      const daysSinceLogin = (Date.now() - user.loginTimestamp) / (1000 * 60 * 60 * 24)
      if (daysSinceLogin > SESSION_EXPIRY_DAYS) {
        clearOfflineAuth()
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error checking offline auth:', error)
    return false
  }
}

/**
 * Get stored user data for offline use
 */
export function getOfflineUser(): StoredUser | null {
  if (typeof window === 'undefined') return null

  try {
    let userData = localStorage.getItem(USER_KEY)
    
    // Fallback to currentUser for backward compatibility
    if (!userData) {
      userData = localStorage.getItem('currentUser')
    }
    
    if (!userData) return null

    const user = JSON.parse(userData) as StoredUser
    
    // Validate user data
    if (!user.id || !user.email) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting offline user:', error)
    return null
  }
}

/**
 * Clear offline authentication data
 */
export function clearOfflineAuth(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOKEN_KEY)
    // Note: We don't remove currentUser here as it might be used by online mode
    // Only remove it on explicit logout
  } catch (error) {
    console.error('Error clearing offline auth:', error)
  }
}

/**
 * Generate a simple token for offline authentication
 * In production, you might want to use a more secure token from the server
 */
function generateSimpleToken(userId: string): string {
  return btoa(`${userId}:${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '')
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Get the appropriate dashboard URL based on user department
 */
export function getDashboardUrl(user: StoredUser | null): string {
  if (!user) return '/basic-education-dashboard'

  if (user.role === 'admin') {
    return '/admin'
  } else if (user.department === 'College') {
    return '/college-dashboard'
  } else {
    return '/basic-education-dashboard'
  }
}

/**
 * Enable anonymous offline mode
 */
export function enableAnonymousMode(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ANONYMOUS_MODE_KEY, 'true')
  } catch (error) {
    console.error('Error enabling anonymous mode:', error)
  }
}

/**
 * Check if anonymous offline mode is enabled
 */
export function isAnonymousMode(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(ANONYMOUS_MODE_KEY) === 'true'
  } catch (error) {
    console.error('Error checking anonymous mode:', error)
    return false
  }
}

/**
 * Disable anonymous offline mode
 */
export function disableAnonymousMode(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ANONYMOUS_MODE_KEY)
  } catch (error) {
    console.error('Error disabling anonymous mode:', error)
  }
}

/**
 * Check if a feature requires internet connection
 */
export function isFeatureOnlineOnly(feature: string): boolean {
  return ONLINE_ONLY_FEATURES.some(f => feature.includes(f))
}

/**
 * Check if a feature is accessible offline
 */
export function isFeatureOfflineAccessible(feature: string): boolean {
  return OFFLINE_ACCESSIBLE_FEATURES.some(f => feature.includes(f))
}

/**
 * Create a persistent session for auto-login
 */
export function createPersistentSession(user: StoredUser, token?: string): void {
  if (typeof window === 'undefined') return

  try {
    const sessionToken = token || generateSimpleToken(user.id)
    const sessionData = {
      userId: user.id,
      email: user.email,
      sessionToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  } catch (error) {
    console.error('Error creating persistent session:', error)
  }
}

/**
 * Get persistent session data
 */
export function getPersistentSession(): { userId: string; email: string; sessionToken: string } | null {
  if (typeof window === 'undefined') return null

  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null

    const session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearPersistentSession()
      return null
    }

    return {
      userId: session.userId,
      email: session.email,
      sessionToken: session.sessionToken
    }
  } catch (error) {
    console.error('Error getting persistent session:', error)
    return null
  }
}

/**
 * Clear persistent session
 */
export function clearPersistentSession(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Error clearing persistent session:', error)
  }
}

/**
 * Check if user has a valid persistent session
 */
export function hasValidSession(): boolean {
  return getPersistentSession() !== null
}


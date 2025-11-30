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
const TOKEN_EXPIRY_DAYS = 30 // Token valid for 30 days

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

    // Check if token is expired
    const user = JSON.parse(userData) as StoredUser
    if (user.loginTimestamp) {
      const daysSinceLogin = (Date.now() - user.loginTimestamp) / (1000 * 60 * 60 * 24)
      if (daysSinceLogin > TOKEN_EXPIRY_DAYS) {
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


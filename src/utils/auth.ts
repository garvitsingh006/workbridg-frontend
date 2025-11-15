/**
 * Utility functions for handling authentication tokens
 */

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

/**
 * Get the access token from cookies or localStorage
 */
export function getAccessToken(): string | null {
    // First try to get from cookies (preferred)
    const cookieToken = getCookie('accessToken');
    if (cookieToken) return cookieToken;
    
    // Fall back to localStorage
    return localStorage.getItem('token');
}

/**
 * Get the refresh token from cookies or localStorage
 */
export function getRefreshToken(): string | null {
    // First try to get from cookies (preferred)
    const cookieToken = getCookie('refreshToken');
    if (cookieToken) return cookieToken;
    
    // Fall back to localStorage
    return localStorage.getItem('refreshToken');
}

/**
 * Check if user is authenticated based on token presence
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken() || !!getRefreshToken();
}

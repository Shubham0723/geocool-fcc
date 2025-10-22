import { cookies } from 'next/headers';

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, timestamp] = decoded.split(':');
    
    // Check if token is not expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return tokenAge < maxAge;
  } catch (error) {
    return false;
  }
}

export function getUserEmail(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    return email;
  } catch (error) {
    return null;
  }
}

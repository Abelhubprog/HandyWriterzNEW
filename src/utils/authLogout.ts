import { useAuth as useClerkAuth } from '@clerk/clerk-react';

export async function performLogout() {
  try {
    // Clear client-side storage
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}

    // Clear caches if available
    if (typeof caches !== 'undefined') {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        // ignore
      }
    }

    // Call Clerk signOut if available
    // Note: import is dynamic to avoid hooking Clerk in non-React contexts
    try {
      const clerk = await import('@clerk/clerk-react');
      const auth = clerk.useAuth ? clerk.useAuth() : null;
      if (auth && auth.signOut) {
        await auth.signOut({ redirectUrl: '/' } as any);
        return;
      }
    } catch (e) {
      // fallback to global signOut if not available
      if ((window as any).Clerk && typeof (window as any).Clerk.signOut === 'function') {
        await (window as any).Clerk.signOut();
        return;
      }
    }

    // If all else fails, force a redirect
    window.location.href = '/';
  } catch (err) {
    window.location.href = '/';
  }
}

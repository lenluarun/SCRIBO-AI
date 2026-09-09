// Service Worker Registration Helper for Scribo AI

export function registerServiceWorker(onSuccess?: () => void) {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // In some sandboxed iframes, service workers might be blocked; wrap in try-catch
      try {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[Scribo PWA] ServiceWorker registered with scope:', registration.scope);
            if (onSuccess) onSuccess();
          })
          .catch((error) => {
            // Expected in restricted iframe environments
            console.info('[Scribo PWA] ServiceWorker registration skipped or restricted in container:', error.message);
          });
      } catch (err) {
        console.info('[Scribo PWA] ServiceWorker setup:', err);
      }
    });
  }
}

// Guarded service-worker registration.
// Never registers in dev mode or in Lovable preview contexts, where a
// cached app shell could serve stale code. Only registers on the
// published production domain.
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  const host = window.location.hostname;
  const isPreview =
    host.includes("id-preview--") ||
    host.endsWith(".lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";
  if (isPreview) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is a progressive enhancement; ignore failures.
    });
  });
}

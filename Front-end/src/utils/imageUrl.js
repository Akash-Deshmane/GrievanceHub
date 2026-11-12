/**
 * Resolves a stored image path or external URL to a browser-accessible URL.
 * Uses relative paths in production (same-origin on Vercel) unless VITE_API_URL is set.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : (import.meta.env.PROD ? '' : 'http://localhost:5000');
  return `${baseUrl}/${url.replace(/^\/+/, '')}`;
};

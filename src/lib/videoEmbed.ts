export function getVideoEmbedUrl(url: string): string | null {
  if (!url.trim()) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;

  // Instagram
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;

  // Facebook video / reel / watch
  const fbMatch = url.match(/facebook\.com\/.+\/(videos|reel|watch)/);
  if (fbMatch) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;

  // Fallback: if it looks like a valid URL, try to embed it directly
  // (covers other platforms like Vimeo, Loom, etc.)
  try {
    const u = new URL(url);
    if (u.hostname.includes('vimeo.com')) {
      const vimeoId = u.pathname.replace('/', '');
      if (/^\d+$/.test(vimeoId)) return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } catch {
    // not a valid URL
  }

  return null;
}

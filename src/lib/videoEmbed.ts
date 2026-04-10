function parseUrl(input: string): URL | null {
  const value = input.trim();
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
}

function cleanHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
}

function extractYouTubeId(url: URL): string | null {
  const hostname = cleanHostname(url.hostname);

  if (hostname === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  }

  if (hostname === "youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }

  return null;
}

function extractTikTokId(url: URL): string | null {
  const hostname = cleanHostname(url.hostname);
  if (!hostname.endsWith("tiktok.com")) return null;

  const match = url.pathname.match(/\/@[^/]+\/video\/(\d+)/);
  return match?.[1] ?? null;
}

function extractInstagramCode(url: URL): string | null {
  const hostname = cleanHostname(url.hostname);
  if (!hostname.endsWith("instagram.com")) return null;

  const match = url.pathname.match(/^\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function extractVimeoId(url: URL): string | null {
  const hostname = cleanHostname(url.hostname);
  if (!(hostname === "vimeo.com" || hostname === "player.vimeo.com")) return null;

  const match = url.pathname.match(/(?:\/video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function extractLoomId(url: URL): string | null {
  const hostname = cleanHostname(url.hostname);
  if (hostname !== "loom.com") return null;

  const match = url.pathname.match(/^\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

function isFacebookVideoUrl(url: URL): boolean {
  const hostname = cleanHostname(url.hostname);

  if (hostname === "fb.watch") return true;
  if (!hostname.endsWith("facebook.com")) return false;

  return Boolean(
    url.pathname.match(/\/(?:[^/]+\/videos\/|reel\/|watch\/|share\/(?:r|v)\/)/) ||
      (url.pathname === "/watch" && url.searchParams.get("v"))
  );
}

export function getVideoEmbedUrl(input: string): string | null {
  const url = parseUrl(input);
  if (!url) return null;

  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;

  const tikTokId = extractTikTokId(url);
  if (tikTokId) return `https://www.tiktok.com/embed/v2/${tikTokId}`;

  const instagramCode = extractInstagramCode(url);
  if (instagramCode) return `https://www.instagram.com/p/${instagramCode}/embed`;

  if (isFacebookVideoUrl(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false`;
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;

  const loomId = extractLoomId(url);
  if (loomId) return `https://www.loom.com/embed/${loomId}`;

  return null;
}

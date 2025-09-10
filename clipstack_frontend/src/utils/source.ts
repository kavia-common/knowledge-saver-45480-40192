export function detectSource(url: string): 'reddit' | 'x' | 'youtube' | 'web' {
  try {
    const u = new URL(url);
    if (u.hostname.includes('reddit.com')) return 'reddit';
    if (u.hostname.includes('x.com') || u.hostname.includes('twitter.com')) return 'x';
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) return 'youtube';
    return 'web';
  } catch {
    return 'web';
  }
}

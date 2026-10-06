import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// AI search and assistant crawlers are welcome by name, so a later default rule can't shut them
// out by accident. CueSetter has nothing private to hide: run sheets never reach the server.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended'];

// The owner's download stats (/stats) and the API are not for crawlers.
const DISALLOW = ['/stats', '/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: DISALLOW }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

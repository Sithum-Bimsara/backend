import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SITE_URL = 'https://meetmemaldives.com';
const PUBLIC_DIR = path.join(__dirname, '../../../../web/public');

async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');

  const staticRoutes = [
    '',
    '/explore',
    '/community',
    '/terms',
    '/login',
    '/register',
  ];

  try {
    // 1. Fetch active deals
    const activeDeals = await prisma.deal.findMany({
      where: { isActive: true },
      select: { id: true, title: true, updatedAt: true },
    });

    // 2. Fetch community posts (optional, but good for SEO)
    const activePosts = await prisma.communityPost.findMany({
      select: { id: true, createdAt: true },
      take: 100, // Limit to recent ones
      orderBy: { createdAt: 'desc' },
    });

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static routes
    staticRoutes.forEach((route) => {
      sitemap += `  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });

    // Deal routes
    activeDeals.forEach((deal) => {
      // SEO-friendly slug logic (matches your frontend logic)
      const slug = deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      sitemap += `  <url>
    <loc>${SITE_URL}/deals/${deal.id}</loc>
    <lastmod>${deal.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');

    // Ensure directory exists (though public/ usually does)
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSitemap();

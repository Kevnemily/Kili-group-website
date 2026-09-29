const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bufqcwcicvwknpyrofhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZnFjd2NpY3Z3a25weXJvZmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDk3MDQsImV4cCI6MjA3NDI4NTcwNH0.sxChRQ9w3aQPDWFCxANxpIHxvAmVBSyzUbGknZmKb_0';
const SITE_URL = 'https://kilimanjarogroupltd.co.tz';

exports.handler = async () => {
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/products.html', priority: '0.9', changefreq: 'weekly' },
    { loc: '/news.html', priority: '0.9', changefreq: 'daily' },
    { loc: '/chemicals.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/logistics.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/supplies.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/contact.html', priority: '0.9', changefreq: 'monthly' },
    { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/csr.html', priority: '0.5', changefreq: 'monthly' }
  ];

  // Fetch published products
  const { data: products } = await db
    .from('catalog_products')
    .select('slug, updated_at')
    .eq('status', 'published')
    .eq('is_visible', true)
    .order('updated_at', { ascending: false });

  // Fetch published news
  const { data: news } = await db
    .from('news_articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .eq('is_visible', true)
    .order('updated_at', { ascending: false });

  const today = new Date().toISOString().split('T')[0];

  const urlEntry = (loc, lastmod, changefreq, priority) => `
  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => urlEntry(p.loc, today, p.changefreq, p.priority)).join('')}
${(products || []).map(p => urlEntry(`/product-details.html?slug=${encodeURIComponent(p.slug)}`, p.updated_at?.split('T')[0], 'monthly', '0.7')).join('')}
${(news || []).map(n => urlEntry(`/news-details.html?slug=${encodeURIComponent(n.slug)}`, n.updated_at?.split('T')[0], 'monthly', '0.6')).join('')}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
    body: xml
  };
};
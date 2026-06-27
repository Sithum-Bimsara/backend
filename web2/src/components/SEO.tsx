import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'LushWare';
const SITE_URL = 'https://lushware.com'; // ← update to your real domain
const DEFAULT_IMAGE = `${SITE_URL}/images/hero1-1800.webp`;
const DEFAULT_DESCRIPTION =
  'Discover exclusive travel deals in the Maldives. AI-powered recommendations for resorts, local guest houses, diving, and more. Verified Maldivian operators only.';

interface JsonLdObject {
  [key: string]: unknown;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string | null;
  url?: string;
  /** Pass a schema.org JSON-LD object to inject structured data */
  jsonLd?: JsonLdObject | JsonLdObject[];
  /** Set to true for pages that must not be indexed (admin, checkout flows) */
  noIndex?: boolean;
  /** List of image URLs to preload for performance (e.g., LCP hero images) */
  preloadImages?: string[];
}

/**
 * Drop-in SEO component. Place at the top of every page component.
 *
 * Usage:
 *   <SEO
 *     title="5-Day Luxury Water Villa – Maldives"
 *     description="Lock this exclusive deal…"
 *     image={deal.primaryImageUrl}
 *     url={`/deals/${deal.id}`}
 *     jsonLd={dealSchema}
 *   />
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image,
  url = '',
  jsonLd,
  noIndex = false,
  preloadImages = [],
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Exclusive Maldives Travel Deals`;
  const resolvedImage = image || DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* ── Preload ── */}
      {preloadImages.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}

      {/* ── Open Graph ── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1800" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

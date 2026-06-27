import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReviewCard from '../../../features/Review/ReviewCard';
import { usePlatformStats } from '../../../features/Deals/hooks/usePlatformStats';
import { useFeaturedReviews } from '../../../features/Deals/hooks/useFeaturedReviews';
import SEO from '../../../components/SEO';
import { ActiveIslandsSection } from './components/ActiveIslandsSection';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const islandsRef = useRef<HTMLDivElement>(null);

  // Parallax effects
  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  const { stats, loading: statsLoading } = usePlatformStats();
  const { reviews: featuredReviews, loading: reviewsLoading } = useFeaturedReviews(3, 3);

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LushWare',
      url: 'https://lushware.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://lushware.com/explore?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lushware.com/' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-(--app-bg) selection:bg-[#2dd4af]/30">
      <SEO
        title="Exclusive Maldives Travel Deals — AI Matched"
        description="Discover and lock exclusive Maldives travel deals. AI-powered recommendations for resorts, diving, local guest houses, and activities from verified Maldivian operators."
        keywords="Maldives travel deals, Maldives holiday packages, Maldives resort deals, AI travel recommendations, exclusive Maldives"
        url="/"
        jsonLd={homeJsonLd}
      />

      {/* ── HERO SECTION (100VH) ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroBgY, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/images/hero1-1800.webp"
            srcSet="
              /images/hero1-600.webp 600w,
              /images/hero1-1200.webp 1200w,
              /images/hero1-1800.webp 1800w
            "
            sizes="100vw"
            alt="Hero image"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover"
          />

          {/* LAYERED BACKGROUND SYSTEM */}
          {/* Layer 1: Cinematic Base Darkening */}
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-transparent" />

          {/* Layer 2: Radial Center Focus Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.3)_0%,transparent_80%)]" />

          {/* Layer 3: Atmospheric Haze (Cloud Effect) */}
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />

          {/* Layer 4: Soft Edge Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center pt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-bold tracking-[0.2em] uppercase shadow-2xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4af]/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2dd4af]/60"></span>
            </span>
            AI-Powered Deal Matching
          </motion.div>

          {/* Text Container with focal overlay */}
          <div className="bg-black/2 md:bg-transparent rounded-3xl p-8 md:p-2 mb-8">
            <h1 className="flex flex-col gap-2 md:gap-4 tracking-tighter drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
              <span className="text-6xl md:text-8xl lg:text-8xl text-white font-['Playfair_Display',serif] font-black leading-[0.8]">
                Maldives Deals
              </span>
              <span className="text-2xl md:text-5xl lg:text-6xl text-[#2dd4af] font-['Playfair_Display',serif] font-medium leading-tight tracking-wide">
                Curated for you
              </span>
            </h1>

            <p className="text-white/95 text-base md:text-xl max-w-xl mx-auto mt-8 leading-relaxed font-medium drop-shadow-md">
              Access subscriber-only prices from verified operators.
              Engineered to match your unique travel style.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-center mt-20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/explore')}
              className="px-12 py-5 bg-white text-[#0e2a47] rounded-xl text-sm font-bold tracking-widest uppercase shadow-2xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Explore Deals
            </motion.button>

            {!statsLoading && stats && (
              <div className="flex items-center gap-6 px-8 py-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                <span className="flex items-center gap-2">
                  <span className="text-[#2dd4af] text-sm">{stats.totalDeals}+</span>
                  Deals
                </span>
                <span className="w-1 h-6 bg-black/20 rounded-full"></span>
                <span className="flex items-center gap-2">
                  <span className="text-[#2dd4af] text-sm">{stats.totalTravellers}</span>
                  Travellers
                </span>
              </div>
            )}
          </div>
        </motion.div>

      </section>

      {/* ── CONTENT SECTION ── */}
      <div className="relative z-10 pt-20 pb-32">

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* ACTIVE ISLANDS SECTION */}
          <div ref={islandsRef} className="mb-20">
            <ActiveIslandsSection />
          </div>

          {/* REVIEWS SECTION */}
          {!reviewsLoading && featuredReviews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-t border-slate-100"
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-['Playfair_Display',serif] font-bold text-[#0e2a47] mb-4">
                  Loved by Travellers
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto font-medium">
                  Real stories from travellers who found their dream escape with our AI recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredReviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

        </div>
      </div>

    </div>
  );
};

export default HomePage;

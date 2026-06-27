import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-[#0e2a47] text-white py-5 px-6 md:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Brand Section */}
        <div className="flex-1 space-y-4 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-auto flex items-center justify-center overflow-visible">
              <img
                src="/images/logo.png"
                alt="LushWare Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#2dd4af] uppercase">
              Curated Island Escapes
            </span>
          </div>

          <div className="text-center md:text-left">
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Exclusive subscriber deals for stays, dives, tours, and excursions.
            </p>
          </div>

        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-[1.5] text-sm">
          {/* Explore — desktop only */}
          <div className="hidden md:block">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#2dd4af] uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-slate-300 hover:text-white transition-colors">Places to Stay</Link></li>
              <li><Link to="/explore" className="text-slate-300 hover:text-white transition-colors">Diving Packages</Link></li>
              <li><Link to="/explore" className="text-slate-300 hover:text-white transition-colors">Island Tours</Link></li>
              <li><Link to="/explore" className="text-slate-300 hover:text-white transition-colors">Excursions</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#2dd4af] uppercase mb-4">
              Platform
            </h3>
            <ul className="flex flex-col items-center md:items-start space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Recommendations
                </a>
              </li>

              <li>
                <Link
                  to="/community"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Community
                </Link>
              </li>

              <li>
                <Link
                  to="/register/merchant"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Join as a Merchant
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#2dd4af] uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-start gap-2 text-slate-300">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:lushware@contactcom"
                  className="hover:text-white transition-colors text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  lushware@contactcom
                </a>
              </li>

              <li className="flex items-center justify-center md:justify-start gap-2 text-slate-300 text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+960 000-0000</span>
              </li>

              <li className="flex items-center justify-center md:justify-start gap-2 text-slate-300 text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Malé, Maldives</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center gap-3 text-[11px] md:text-[15px] text-slate-500 uppercase tracking-wider md:tracking-widest">
        {/* Left */}
        <p className="md:flex-1 text-center md:text-left">
          © 2026 LushWare. All rights reserved.
        </p>

        {/* Center */}
        <div className="flex justify-center md:flex-1">
          <Link to="/terms" className="hover:text-white transition-colors">Terms & Support</Link>
        </div>

        {/* Right (empty for balance OR future content) */}
        <div className="hidden md:block md:flex-1" />

      </div>
    </motion.footer>
  );
};

export default Footer;

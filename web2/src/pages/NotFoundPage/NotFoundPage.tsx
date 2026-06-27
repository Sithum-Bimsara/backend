import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12 text-center bg-[#FAF8F5]">
      <Helmet>
        <title>404 - Page Not Found | LushWare</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Elegant, minimalist hand-drawn luxury emblem */}
      <div className="mb-8 p-6 rounded-full bg-white shadow-[0_4px_20px_rgba(15,23,42,0.02)] border border-slate-100/50">
        <svg 
          viewBox="0 0 100 100" 
          className="w-20 h-20 text-slate-700" 
          stroke="currentColor" 
          fill="none" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* A minimal, classy palm tree outline */}
          <path d="M50,85 Q44,55 50,30" />
          <path d="M50,30 Q65,16 82,20" />
          <path d="M50,30 Q35,16 18,20" />
          <path d="M50,30 Q60,34 72,42" />
          <path d="M50,30 Q40,34 28,42" />
          <path d="M50,30 Q52,12 48,6" />
          {/* Elegant waves below the tree */}
          <path d="M30,85 Q50,80 70,85" />
          <path d="M34,89 Q50,85 66,89" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* Elegant typography matching their theme */}
      <h1 className="text-8xl font-black text-slate-900 tracking-tight leading-none mb-4">
        404
      </h1>

      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">
        The island you're looking for doesn't exist.
      </h2>
      
      <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      {/* Return to Home styled precisely with their primary color classes */}
      <Link
        to="/"
        className="px-8 py-3.5 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

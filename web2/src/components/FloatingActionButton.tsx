import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

type FloatingActionButtonProps = {
  label?: string;
  to?: string;
  mode?: 'navigate' | 'modal';
  onClick?: () => void;
};

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  label = 'Request Deal',
  to = '/deal-requests',
  mode = 'navigate',
  onClick,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Hide for non-logged-in users
  if (!isLoggedIn) {
    return null;
  }

  const handleClick = () => {
    if (mode === 'modal') {
      onClick?.();
      return;
    }

    navigate(to);
  };

  return (
    <div id="floating-action-button" className="fixed bottom-6 left-6 z-40 group transition-all duration-500 ease-in-out">
      <div className="absolute -inset-1 rounded-full bg-cyan-400/25 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className="relative inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        <SendIcon />
        <span className="whitespace-nowrap">{label}</span>
      </button>
    </div>
  );
};

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2L11 13"></path>
    <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
  </svg>
);

export default FloatingActionButton;

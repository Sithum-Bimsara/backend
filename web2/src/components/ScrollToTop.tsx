import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global component that scrolls the window to the top whenever the route changes.
 * Fixes the issue in React SPAs where scroll position is preserved between pages.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Each new page starts at the top. The site scrolls inside <body>, so reset both.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

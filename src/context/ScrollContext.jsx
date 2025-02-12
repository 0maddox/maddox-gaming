import React, { createContext, useContext, useState, useEffect } from 'react';

const ScrollContext = createContext();

export function ScrollProvider({ children }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);

  useEffect(() => {
    let lastScrollTop = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollTop;
          
          // Calculate scroll direction and velocity
          const isScrollingUp = currentScrollY < lastScrollTop;
          const isScrollingFast = Math.abs(scrollDelta) > 10;
          
          // Update visibility based on scroll direction and position
          if (currentScrollY < 100) {
            setVisible(true);
          } else if (isScrollingFast) {
            setVisible(isScrollingUp);
          }
          
          setScrollingUp(isScrollingUp);
          lastScrollTop = currentScrollY;
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={{ visible, lastScrollY, scrollingUp }}>
      {children}
    </ScrollContext.Provider>
  );
}

export const useScroll = () => useContext(ScrollContext); 
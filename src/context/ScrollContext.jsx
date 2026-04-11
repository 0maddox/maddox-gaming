import React, { createContext, useContext, useState, useEffect } from 'react';

const ScrollContext = createContext();

export function ScrollProvider({ children }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollingUp(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
      setVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <ScrollContext.Provider value={{ visible, lastScrollY, scrollingUp }}>
      {children}
    </ScrollContext.Provider>
  );
}

export const useScroll = () => useContext(ScrollContext); 
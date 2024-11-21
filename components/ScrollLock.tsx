import React, { useEffect } from 'react';

interface ScrollLockProps {
  isActive: boolean;
}

const ScrollLock: React.FC<ScrollLockProps> = ({ isActive }) => {
  useEffect(() => {
    const handleScroll = (e: Event): void => {
      if (isActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isActive) {
      document.addEventListener('wheel', handleScroll, { passive: false });
      document.addEventListener('touchmove', handleScroll, { passive: false });
    }

    return () => {
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
    };
  }, [isActive]);

  return isActive ? (
    <div className="fixed inset-0 z-40" aria-hidden="true" />
  ) : null;
};

export default ScrollLock;
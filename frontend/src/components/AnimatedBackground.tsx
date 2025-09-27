'use client'
import React, { useEffect } from 'react'

declare global {
  interface Window {
    UnicornStudio: {
      init: () => Promise<any>;
      addScene: (config: any) => Promise<any>;
      destroy: () => void;
      isInitialized?: boolean;
    };
  }
}

interface AnimatedBackgroundProps {
  className?: string;
  projectId?: string;
  overlay?: 'light' | 'medium' | 'dark' | 'none';
}

export default function AnimatedBackground({ 
  className = "",
  projectId = "cm294jqwv1hkdml0hncxmdyvp", // Default project ID - replace with your own
  overlay = 'medium'
}: AnimatedBackgroundProps) {
  useEffect(() => {
    const initUnicornStudio = () => {
      if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init()
          .then((scenes) => {
            console.log('Unicorn Studio scenes initialized:', scenes);
            window.UnicornStudio.isInitialized = true;
          })
          .catch((err) => {
            console.error('Unicorn Studio initialization error:', err);
          });
      }
    };

    // Check if UnicornStudio is already loaded
    if (window.UnicornStudio) {
      initUnicornStudio();
    } else {
      // Wait for the script to load
      const checkForUnicornStudio = setInterval(() => {
        if (window.UnicornStudio) {
          clearInterval(checkForUnicornStudio);
          initUnicornStudio();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkForUnicornStudio);
      }, 10000);
    }

    // Cleanup on unmount
    return () => {
      if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
        try {
          window.UnicornStudio.destroy();
          window.UnicornStudio.isInitialized = false;
        } catch (err) {
          console.warn('UnicornStudio cleanup warning:', err);
        }
      }
    };
  }, []);

  const getOverlayClass = () => {
    switch (overlay) {
      case 'light':
        return 'bg-black/10 xs:bg-black/8 sm:bg-black/5';
      case 'medium':
        return 'bg-black/30 xs:bg-black/25 sm:bg-black/15';
      case 'dark':
        return 'bg-black/50 xs:bg-black/45 sm:bg-black/35';
      case 'none':
        return '';
      default:
        return 'bg-black/30 xs:bg-black/25 sm:bg-black/15';
    }
  };

  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      {/* Enhanced responsive padding for different screen sizes */}
      <div className="absolute inset-0 px-1 xs:px-2 sm:px-6 lg:px-8 pt-20 xs:pt-24 sm:pt-20 lg:pt-24 pb-2 xs:pb-2 sm:pb-0 lg:pb-0">
        <div className="relative h-full w-full overflow-hidden rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/10">
          {/* Unicorn Studio 3D Animation */}
          <div
            data-us-project={projectId}
            data-us-scale="1"
            data-us-dpi="1.5"
            data-us-lazyload="false"
            data-us-disablemobile="false"
            data-us-alttext="Interactive background animation"
            data-us-arialabel="Dynamic background scene"
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
          {/* Enhanced overlay with responsive opacity for better text readability */}
          {overlay !== 'none' && (
            <div className={`absolute inset-0 ${getOverlayClass()}`} />
          )}
        </div>
      </div>
    </div>
  );
}
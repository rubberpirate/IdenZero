import React, { useEffect, useState } from 'react';

interface UnicornStudio3DProps {
  projectId: string;
  className?: string;
  opacity?: number;
  scale?: number;
  dpi?: number;
  lazyLoad?: boolean;
  production?: boolean;
  responsive?: boolean;
  showOverlay?: boolean;
}

const UnicornStudio3D: React.FC<UnicornStudio3DProps> = ({ 
  projectId,
  className = '',
  opacity = 0.7,
  scale = 1,
  dpi = 1.5,
  lazyLoad = false,
  production = false,
  responsive = true,
  showOverlay = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create the project ID with query parameters if needed
  const finalProjectId = production ? `${projectId}?production=true` : projectId;

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkUnicornStudio = async () => {
      try {
        // Wait for UnicornStudio script to be available (but do NOT call init here to avoid duplicate initialization)
        while (!window.UnicornStudio && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.UnicornStudio) {
          console.log('UnicornStudio script is present; leaving initialization to the global loader or AnimatedBackground.');
          setIsLoaded(true);
        } else {
          throw new Error('UnicornStudio script not loaded');
        }
      } catch (err) {
        console.error('UnicornStudio availability check failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkUnicornStudio();
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* 3D Model Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          opacity,
          pointerEvents: 'none'
        }}
      >
        <div 
          data-us-project={finalProjectId}
          data-us-scale={scale.toString()}
          data-us-dpi={dpi.toString()}
          data-us-lazyload={lazyLoad ? "true" : "false"}
          data-us-production={production ? "true" : "false"}
          data-us-disablemobile="false"
          data-us-alttext="3D background animation"
          data-us-arialabel="Interactive 3D background scene"
          className={responsive ? "w-full h-full min-w-[320px] min-h-[200px]" : ""}
          style={responsive ? {
            width: 'min(1920px, 100vw)',
            height: 'min(1080px, 100vh)',
            maxWidth: '100%',
            maxHeight: '100%'
          } : {
            width: '1920px',
            height: '1080px'
          }}
        />
      </div>
      
      {/* Responsive overlay for better text readability */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/30 sm:from-background/10 sm:to-background/20" />
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-2 rounded z-10">
          3D: {isLoaded ? '✅' : '⏳'} {responsive ? 'Responsive' : 'Fixed'}
          {error && <div className="text-red-300">❌ {error}</div>}
        </div>
      )}
    </div>
  );
};

// Using existing UnicornStudio interface from AnimatedBackground.tsx

export default UnicornStudio3D;
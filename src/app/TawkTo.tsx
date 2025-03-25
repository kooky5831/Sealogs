'use client';

import React, { useEffect } from 'react';

const TawkTo: React.FC = () => {
  useEffect(() => {
    // Load Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/6642c3fe9a809f19fb30984d/1htqcr7d4';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Clean up
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkTo;
import React, { useEffect, useState } from 'react';
import { LoadScript, LoadScriptProps } from '@react-google-maps/api';

interface GoogleMapsLoaderProps extends Omit<LoadScriptProps, 'googleMapsApiKey' | 'libraries'> {
  children: React.ReactNode;
  libraries?: LoadScriptProps['libraries'];
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children, libraries = ['places'], ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== 'your-google-maps-api-key-here') {
      setHasApiKey(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading maps...</div>;
  }

  if (!hasApiKey) {
    // Return children without Google Maps functionality
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={<div>Loading Google Maps...</div>}
      {...props}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsLoader;
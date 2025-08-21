declare module 'react-lazy-load-image-component' {
  import React from 'react';

  export interface LazyLoadImageProps {
    src: string;
    alt?: string;
    height?: number | string;
    width?: number | string;
    className?: string;
    effect?: 'blur' | 'black-and-white' | 'opacity';
    placeholderSrc?: string;
    threshold?: number;
    delayTime?: number;
    delayMethod?: 'debounce' | 'throttle';
    useIntersectionObserver?: boolean;
    visibleByDefault?: boolean;
    wrapperClassName?: string;
    wrapperProps?: any;
    afterLoad?: () => void;
    beforeLoad?: () => void;
    onError?: (error: Event) => void;
  }

  export const LazyLoadImage: React.FC<LazyLoadImageProps>;
  export const LazyLoadComponent: React.FC<any>;
  export const trackWindowScroll: (Component: React.ComponentType<any>) => React.ComponentType<any>;
}
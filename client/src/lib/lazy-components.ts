// Lazy loaded components for performance optimization
import React from 'react';

// Lazy load heavy components with proper imports
export const LazyEventBoard = React.lazy(() => 
  import('../components/events/EventsBoard').then(module => ({ default: module.default || module.EventsBoard }))
);
export const LazyBeautifulPostCreator = React.lazy(() => 
  import('../components/universal/BeautifulPostCreator').then(module => ({ default: module.default || module.BeautifulPostCreator }))
);
export const LazyFacebookReactionSelector = React.lazy(() => 
  import('../components/ui/FacebookReactionSelector').then(module => ({ default: module.FacebookReactionSelector }))
);
export const LazyRichTextCommentEditor = React.lazy(() => 
  import('../components/ui/RichTextCommentEditor').then(module => ({ default: module.RichTextCommentEditor }))
);
export const LazyReportModal = React.lazy(() => 
  import('../components/ui/ReportModal').then(module => ({ default: module.ReportModal }))
);

// Create a loading component
export const LazyLoadingFallback = () => 
  React.createElement('div', {
    className: "flex items-center justify-center p-4"
  }, 
    React.createElement('div', {
      className: "animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500"
    })
  );

// Wrap components with Suspense
export function withSuspense<T extends React.ComponentType<any>>(Component: T) {
  return function SuspenseWrapper(props: React.ComponentProps<T>) {
    return React.createElement(React.Suspense, {
      fallback: React.createElement(LazyLoadingFallback)
    }, React.createElement(Component, props));
  };
}
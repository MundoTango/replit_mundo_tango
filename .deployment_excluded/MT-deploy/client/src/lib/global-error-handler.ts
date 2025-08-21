// Global error handler to prevent unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default behavior (browser console errors)
      event.preventDefault();
      
      // Log to analytics if available
      if ((window as any).plausible) {
        (window as any).plausible('Error', { 
          props: { 
            type: 'unhandled_rejection',
            message: event.reason?.message || String(event.reason)
          } 
        });
      }
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Log to analytics if available
      if ((window as any).plausible) {
        (window as any).plausible('Error', { 
          props: { 
            type: 'global_error',
            message: event.error?.message || 'Unknown error',
            stack: event.error?.stack
          } 
        });
      }
    });
  }
}

// Set up React Query error handling
export function setupQueryErrorHandling(queryClient: any) {
  queryClient.setDefaultOptions({
    queries: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      },
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      }
    },
    mutations: {
      onError: (error: Error) => {
        console.error('Mutation error:', error);
      },
      retry: 1
    }
  });
}
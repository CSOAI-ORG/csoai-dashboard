// Polyfill for Safari compatibility with Array.from on null/undefined
// Polyfill Array.from to handle null/undefined safely
const originalArrayFrom = Array.from;
(Array as any).from = function(arrayLike: any, mapFn?: any, thisArg?: any): any[] {
  if (arrayLike === null || arrayLike === undefined) {
    return [];
  }
  return mapFn 
    ? originalArrayFrom(arrayLike, mapFn, thisArg) 
    : originalArrayFrom(arrayLike);
};

import * as Sentry from "@sentry/react";
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import './lib/i18n';
import { createOptimizedQueryClient } from "./lib/trpc-config";

// Initialize Sentry for error tracking
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Filter out common non-actionable errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Ignore network errors that are likely user connectivity issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return null;
      }
      
      // Ignore cancelled requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
      }
      
      // Ignore Safari Array.from compatibility errors from third-party libraries
      if (error instanceof TypeError && error.message?.includes('Array.from requires an array-like object')) {
        return null;
      }
      
      // Ignore expected user errors - unauthenticated access attempts
      // These are normal user behavior, not bugs
      if (errorMessage.includes('Please login') || errorMessage.includes('10001')) {
        return null;
      }
      
      // Ignore permission denied errors - expected for non-admin users
      if (errorMessage.includes('do not have required permission') || errorMessage.includes('10002')) {
        return null;
      }
      
      // Ignore payment plan not available errors - expected for misconfigured courses
      if (errorMessage.includes('Payment plan not available')) {
        return null;
      }
      
      // Ignore TRPC unauthorized errors
      if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('FORBIDDEN')) {
        return null;
      }
      
      return event;
    },
  });
  
  console.log('[Sentry] Error tracking initialized');
}

const queryClient = createOptimizedQueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Prevent redirect loop - only redirect if not already on login page
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/signup') {
    window.location.href = getLoginUrl();
  }
};

// Helper to check if error is an expected user error (auth, permission, etc.)
const isExpectedUserError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false;
  const errorMessage = error.message || '';
  return (
    errorMessage.includes('Please login') ||
    errorMessage.includes('10001') ||
    errorMessage.includes('do not have required permission') ||
    errorMessage.includes('10002') ||
    errorMessage.includes('UNAUTHORIZED') ||
    errorMessage.includes('FORBIDDEN') ||
    errorMessage.includes('Payment plan not available')
  );
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    
    // Only report non-expected errors to Sentry
    if (SENTRY_DSN && error && !isExpectedUserError(error)) {
      Sentry.captureException(error, {
        tags: { type: 'api_query_error' },
        extra: { queryKey: event.query.queryKey },
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    
    // Only report non-expected errors to Sentry
    if (SENTRY_DSN && error && !isExpectedUserError(error)) {
      Sentry.captureException(error, {
        tags: { type: 'api_mutation_error' },
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error("[API Mutation Error]", error);
    }
  }
});

// Performance optimization: Use httpBatchLink for better request batching
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
      maxURLLength: 2083,
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </Sentry.ErrorBoundary>
);

// Error fallback component
function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We've been notified of this issue and are working to fix it.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

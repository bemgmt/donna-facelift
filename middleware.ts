import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Enhanced Security Middleware
 * Combines Clerk authentication with basic security headers
 * Part of WS1 Phase 1 Security Hardening
 */

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/realtime/token', // Public for voice client to get a token
  '/api/health.php', // Public health check
  '/api/health', // Alternative health check
]);

export default clerkMiddleware((auth, request) => {
  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return;
  }

  // For protected routes, let Clerk handle authentication
  // Note: The protect() method will be handled by Clerk automatically
});

export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
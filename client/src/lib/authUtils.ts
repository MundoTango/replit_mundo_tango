export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function getAuthToken(): string | null {
  // For Replit Auth, tokens are managed server-side via sessions
  return null;
}
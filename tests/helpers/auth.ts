import jwt from 'jsonwebtoken';
import type { User } from '../../shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export const generateTestToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      replitId: user.replitId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const createAuthHeaders = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const createTestSession = (user: User) => {
  return {
    passport: {
      user: {
        claims: {
          sub: user.replitId || user.id.toString(),
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImage
        },
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }
    },
    csrfToken: 'test-csrf-token'
  };
};

export const mockAuthenticated = (req: any, user: User) => {
  req.isAuthenticated = () => true;
  req.user = createTestSession(user).passport.user;
  req.session = createTestSession(user);
};
# Mundo Tango - Social Platform for Tango Enthusiasts

A modern social media platform connecting the global tango community through authentic experiences and meaningful connections.

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: JWT-based with Replit OAuth integration
- **Real-time**: WebSocket for live messaging and notifications
- **Analytics**: Plausible Analytics (privacy-first)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Copy `.env.example` to `.env` and configure:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   RESEND_API_KEY=your_email_service_key
   ```

3. **Initialize database**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Features

### Core Social Features
- User profiles with tango experience levels
- Post creation with image/video support
- Real-time messaging and chat rooms
- Event creation and RSVP management
- Social connections and following system

### Tango-Specific Features
- Dance experience tracking (leader/follower levels)
- Multiple role support (dancer, instructor, DJ, organizer)
- Event management for milongas and workshops
- Community groups and location-based discovery
- Mood indicators and activity tagging

### Technical Features
- Progressive Web App (PWA) ready
- Real-time notifications and updates
- Responsive design for all devices
- Privacy-first analytics
- Comprehensive search functionality

## Analytics Setup

### Overview
Mundo Tango uses **Plausible Analytics** for privacy-first web analytics. This solution:
- Complies with GDPR by default
- Doesn't use cookies or collect personal data
- Provides anonymous visitor insights
- Requires no consent banners
- Has a lightweight footprint (< 1KB)

### Integration Details

**Location**: Analytics script is integrated in `client/index.html`
```html
<script defer data-domain="your-domain.com" src="https://plausible.io/js/script.js"></script>
```

**Configuration**: The domain is currently set to the Replit development URL. Update this when deploying to production.

### Analytics Features

**Automatic Tracking**:
- Page views and unique visitors
- Referrer sources and popular pages
- Device and browser analytics
- Geographic data (country-level only)

**Custom Events Tracked**:
- User registration and authentication flows
- Content creation (posts, events)
- Social interactions (likes, comments, follows)
- Navigation patterns and feature usage
- Search queries and filter applications

### Analytics API

The analytics system provides a comprehensive API for tracking user interactions:

```typescript
import { analytics } from '@/lib/analytics';

// User lifecycle events
analytics.userSignUp();
analytics.userLogin();
analytics.userOnboardingComplete();

// Content interactions
analytics.postCreate('photo');
analytics.postLike();
analytics.eventRSVP('confirmed');

// Navigation tracking
analytics.pageView('Events');
analytics.searchPerform('milonga buenos aires');
```

### Data Collected

**Anonymous Metrics**:
- Page views and session duration
- Popular content and features
- User flow through onboarding
- Event participation rates
- Search patterns and interests

**Privacy Guarantees**:
- No personal data collection
- No cross-site tracking
- No cookies or local storage
- IP addresses are not stored
- All data is aggregated and anonymous

### Dashboard Access

Analytics data is available through the Plausible dashboard at:
`https://plausible.io/your-domain.com`

**Key Metrics Available**:
- Real-time visitor count
- Top pages and referrers
- User engagement patterns
- Geographic distribution
- Device and browser breakdown

### Compliance

**GDPR Compliance**: Fully compliant by design
**Cookie Law**: No cookies used, no consent required
**Data Retention**: Configurable, defaults to 24 months
**Data Ownership**: All data remains under your control

### Configuration Options

**Environment Variables**:
```bash
VITE_ANALYTICS_DOMAIN=your-domain.com  # Optional override
VITE_ANALYTICS_ENABLED=true            # Enable/disable tracking
```

**Custom Domain Setup**:
When deploying to production, update the domain in `client/index.html`:
```html
<script defer data-domain="your-production-domain.com" src="https://plausible.io/js/script.js"></script>
```

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and analytics
│   │   └── hooks/         # Custom React hooks
├── server/                # Express.js backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── services/          # Business logic
├── shared/                # Shared types and schemas
└── database/              # Migration and seed files
```

### Testing
```bash
# Run all tests
npm test

# Test database connectivity
npm run db:test

# Test email service
npm run email:test
```

### Database Migration

The project includes a comprehensive Supabase migration package for modernizing the database infrastructure:

```bash
# Located in database/ directory
- supabase_migration.sql    # Complete migration script
- seed_data.sql            # Test data
- README.md                # Migration documentation
```

## Deployment

1. **Environment Setup**
   Configure production environment variables

2. **Database Migration**
   Deploy schema changes to production database

3. **Analytics Configuration**
   Update domain in analytics script

4. **Domain Setup**
   Configure custom domain and SSL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or support, please refer to the project documentation or contact the development team.

---

**Privacy Notice**: This application uses Plausible Analytics for anonymous usage statistics. No personal data is collected or stored.
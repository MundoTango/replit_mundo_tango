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

### Real-time Communication
- **WebSocket Chat Rooms**: Live messaging with typing indicators
- **Presence Awareness**: See who's online and active
- **Event Feedback**: Real-time ratings and safety reporting
- **Friend Notifications**: Instant connection updates

### Email Notification System
- **Friend Requests**: Welcome new connections with email alerts
- **Memory Tags**: Notify users when tagged in shared memories
- **Event Feedback**: Automated summary reports for organizers
- **Safety Reports**: Immediate alerts for community protection

### Advanced Media Management
- **Supabase Storage**: Secure file upload with CDN delivery
- **Visibility Controls**: Public, private, and friends-only content
- **Tagging System**: Organize media with searchable tags
- **Usage Tracking**: Monitor media usage across platform features

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
- Supabase Storage for file uploads

## Analytics Setup

### Overview
Mundo Tango uses **Plausible Analytics** for privacy-first web analytics with enhanced tracking capabilities:
- GDPR compliant by default (no cookies, no personal data collection)
- Lightweight and fast loading
- Comprehensive tracking: page views, file downloads, outbound links, hash navigation
- Custom event tracking with properties and revenue analytics
- Tagged events for A/B testing and feature experimentation
- Requires no consent banners

### Integration Details

**Installation Method**: Dynamic integration following Plausible's verified integration guide

**Location**: Analytics script dynamically loaded in `client/index.html` within the `<head>` section (before all other scripts)
```html
<script>
  const domain = window.location.hostname.includes('replit.dev')
    ? 'mundo-tango.replit.dev'
    : 'mundotango.life';
  const script = document.createElement('script');
  script.setAttribute('defer', '');
  script.setAttribute('data-domain', domain);
  script.src = 'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js';
  document.head.appendChild(script);

  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments)
  }
</script>
```

**Environment Detection**: 
- **Staging**: Automatically detects `replit.dev` domains and tracks to `mundo-tango.replit.dev`
- **Production**: Automatically detects production domains and tracks to `mundotango.life`
- No manual configuration needed for different environments

**GDPR Compliance**: 
- Cookie-free tracking (no consent banners required)
- No personal data collection
- Anonymous visitor analytics only
- Fully compliant with privacy regulations
- No SDKs or external dependencies used

**Enabled Tracking Features** (All Plausible options active):
- **file-downloads**: Automatic tracking of PDF, image, and document downloads
- **hash**: Hash-based navigation tracking for single-page application routes
- **outbound-links**: External link click tracking to other websites
- **pageview-props**: Enhanced page views with custom properties
- **revenue**: Revenue and conversion tracking for paid features and ecommerce
- **tagged-events**: Custom event tracking with A/B testing support

**No SDKs or Cookies**: Pure JavaScript implementation with zero external dependencies

### Enhanced Analytics Features

**Automatic Tracking** (No code required):
- Page views and unique visitors
- File downloads (PDFs, images, documents)
- Outbound link clicks to external websites
- Hash-based navigation (SPA routing changes)
- Referrer sources and popular pages
- Device, browser, and geographic analytics

**Custom Events Available**:
- User lifecycle: registration, onboarding, profile updates
- Content interactions: post creation, likes, comments, shares
- Event management: RSVP tracking, event payments
- Social features: follows, messaging, group joins
- Revenue tracking: event payments, premium upgrades
- Search patterns and filter usage
- Feature adoption and engagement metrics

**A/B Testing & Experiments**:
- Tagged events for variant tracking
- Feature flag experiments
- User journey optimization
- Conversion funnel analysis

## Supabase Storage Integration

### Overview
Mundo Tango uses **Supabase Storage** for secure, scalable file uploads and media management:
- Bucket-based file organization
- Row-Level Security (RLS) policies
- Automatic CDN distribution
- Support for images, videos, documents
- Client and server-side upload capabilities

### Storage Setup

**Bucket Configuration**: `media-uploads` bucket with public read access
**RLS Policies**: 
- Public read access for all files
- Authenticated write access (only logged-in users can upload)
- Users can only delete their own files

**File Organization**:
```
media-uploads/
├── profile-images/{userId}/
├── posts/{userId}/
├── events/{userId}/
├── general/{userId}/
└── documents/{userId}/
```

### Upload Flow

**Client-side Upload** (Direct to Supabase):
```typescript
import { uploadFile } from '@/services/upload';

const result = await uploadFile(file, 'posts', userId);
if (result.success) {
  console.log('File URL:', result.url);
}
```

**Server-side Upload** (via API endpoint):
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'posts');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**React Component Usage**:
```jsx
import UploadMedia from '@/components/UploadMedia';

<UploadMedia
  folder="posts"
  userId={user.id}
  onUploadComplete={(result) => {
    console.log('Upload complete:', result.url);
  }}
  acceptedTypes="image/*,video/*"
  maxSize={10}
  multiple={true}
/>
```

### API Endpoints

- `POST /api/upload` - Upload file with authentication
- `DELETE /api/upload/:path` - Delete file (owner only)

### File Types Supported
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, MOV, AVI
- **Documents**: PDF, DOC, DOCX, TXT
- **Size Limit**: 10MB per file

### RLS Policy Summary
```sql
-- Public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-uploads');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[2]);
```

### Enhanced Analytics API

The analytics system provides comprehensive tracking with enhanced Plausible features:

```typescript
import { analytics } from '@/lib/analytics';

// User lifecycle events
analytics.userSignUp();
analytics.userLogin();
analytics.userOnboardingComplete();

// Content interactions with properties
analytics.postCreate('photo');
analytics.postLike();
analytics.eventRSVP('confirmed');

// Revenue tracking for events
analytics.eventPayment(25.00, 'USD'); // Event ticket purchase
analytics.premiumUpgrade('pro', 99.00); // Premium subscription

// Enhanced page tracking with properties
analytics.pageView('Events', { category: 'milonga', location: 'buenos-aires' });

// Search and discovery
analytics.searchPerform('milonga buenos aires');
analytics.filterApply('location');

// A/B testing and experiments
analytics.experimentView('new_onboarding', 'variant_b');

// Automatic tracking (no code needed):
// - File downloads (PDFs, images, documents)
// - Outbound link clicks
// - Hash navigation (#/path changes)
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
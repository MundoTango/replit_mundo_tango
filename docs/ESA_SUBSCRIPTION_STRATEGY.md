# ESA Subscription Strategy for Mundo Tango

## ESA (Evaluate, Systematize, Apply) Analysis

### E - Evaluate: Current State
1. **Infrastructure Ready**: 
   - Feature flag system exists and working
   - Subscription schema defined (subscriptions, paymentMethods, transactions tables)
   - Previous Stripe integration evidence in SQL dumps
   - User roles system already in place (teacher, organizer, dj, etc.)

2. **Missing Components**:
   - Subscription management UI
   - Payment gateway integration
   - Email notifications for subscription events
   - Revenue analytics dashboard

### S - Systematize: Subscription Structure

#### Tier 1: Free Tier (Always Available)
**Features:**
- Create profile and connect with community
- View public events and milongas
- Basic friend connections (up to 50)
- View memories feed
- Basic search functionality
- Join up to 3 groups

**Limitations:**
- No event creation
- Limited photo uploads (10 photos)
- No advanced analytics
- Basic AI chat (10 messages/day)

#### Tier 2: Basic Paid ($5/month)
**Everything in Free, plus:**
- Unlimited friend connections
- Create events (up to 3/month)
- Unlimited photo/video uploads
- Advanced search filters
- Join unlimited groups
- Create posts with location tagging
- Priority support
- Ad-free experience
- Basic analytics dashboard
- Unlimited AI chat

#### Future Professional Tiers

##### Tier 3: Enthusiast ($9.99/month)
**Everything in Basic, plus:**
- Create unlimited events
- Event analytics and insights
- Custom event pages
- Early access to new features
- Export data (CSV)
- Advanced privacy controls
- Verified badge

##### Tier 4: Professional ($24.99/month)
**For Teachers, Organizers, DJs:**
- Everything in Enthusiast
- Professional profile badge
- Featured listings in search
- Student/attendee management
- Payment processing for events
- Email marketing tools
- Custom branding options
- API access
- Multi-admin event management

##### Tier 5: Enterprise ($99.99/month)
**For Schools, Studios, Large Organizations:**
- Everything in Professional
- Multiple user accounts (up to 10)
- White-label options
- Custom integrations
- Dedicated support
- SLA guarantees
- Custom reporting
- Bulk operations

### A - Apply: Implementation Strategy

#### Phase 1: Foundation (Week 1)
1. **Database Setup**
   - Verify subscription tables exist
   - Add subscription_tier to users table
   - Create subscription_features junction table

2. **Feature Flag Integration**
   ```typescript
   // Check user's subscription tier
   const hasFeature = (userId: number, feature: string) => {
     const userTier = getUserSubscriptionTier(userId);
     const tierFeatures = getTierFeatures(userTier);
     return tierFeatures.includes(feature) && 
            isFeatureEnabled(`subscription-${userTier}`, userId);
   };
   ```

3. **Stripe Integration**
   - Basic payment flow for $5 tier
   - Webhook handling for subscription events
   - Customer portal for management

#### Phase 2: UI Implementation (Week 2)
1. **Pricing Page**
   - Comparison table
   - Tier selection
   - FAQ section

2. **Account Settings**
   - Current subscription display
   - Upgrade/downgrade flow
   - Payment method management
   - Usage statistics

3. **Feature Gating**
   - Soft gates with upgrade prompts
   - Usage counters for limited features
   - Grace periods for downgrades

#### Phase 3: Professional Features (Month 2)
1. **Role-Based Pricing**
   - Special offers for verified professionals
   - Bulk discounts for schools
   - Regional pricing adjustments

2. **Advanced Features**
   - Event ticketing system
   - Student management
   - Revenue sharing for events

## ESA Recommendations

### Immediate Actions (This Week)
1. **Enable Basic Tier**: Turn on `subscription-basic-tier` flag
2. **Create Pricing Page**: Simple comparison of Free vs $5
3. **Implement Soft Gates**: Show upgrade prompts at limits
4. **Add Stripe Checkout**: Basic payment flow

### Short-term (Next Month)
1. **Usage Analytics**: Track feature usage by tier
2. **A/B Testing**: Price points and feature sets
3. **Email Campaigns**: Onboarding and upgrade prompts
4. **Referral Program**: Incentivize growth

### Long-term (3-6 Months)
1. **Professional Tiers**: Launch teacher/organizer specific plans
2. **Regional Expansion**: Localized pricing
3. **Partner Integrations**: Dance schools, venues
4. **Revenue Sharing**: For event organizers

## Metrics to Track
- Conversion rate: Free → Paid
- Churn rate by tier
- Feature usage by tier
- Revenue per user
- Customer lifetime value
- Support tickets by tier

## Risk Mitigation
- Grandfather existing users
- 30-day money-back guarantee
- Clear communication about changes
- Gradual feature rollout
- Maintain generous free tier
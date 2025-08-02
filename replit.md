# Life CEO & Multi-Community Platform

## Overview

This project is a sophisticated platform encompassing a personal AI-powered life management system (Life CEO) and independent, data-isolated social communities, starting with Mundo Tango. The overarching vision is to provide a comprehensive, adaptable, and secure digital ecosystem for personal growth and community engagement.

The **Life CEO System** acts as an AI-powered life management platform, featuring 16 specialized agents designed to manage various aspects of a user's life, from business and finance to health and relationships. It is built for mobile-first, voice-controlled interaction and aims to provide proactive, personalized insights and task management.

The **Community Platforms**, exemplified by Mundo Tango, are independent social networks designed for specific communities. Each community maintains its own isolated database, ensuring data sovereignty and allowing for tailored features and experiences. The platform includes comprehensive social media functionalities, event management, real-time messaging, and sophisticated user profiles.

A crucial **Integration Layer** facilitates secure, API-based communication between the Life CEO System and Community Platforms, allowing for optional cross-platform features while maintaining strict boundaries and independence.

The platform is designed with a strong emphasis on security, performance, and user experience, incorporating a robust 44x21 framework (44 technical layers × 21 development phases) for systematic development, quality assurance, and continuous improvement. Key capabilities include a global payment system with Stripe integration, advanced internationalization features, comprehensive administrative controls, and an AI-powered performance optimization system.

## Critical Status Update (August 2, 2025)

**⚠️ ESA-44x21 Compliance Audit Results**: 
- Overall Compliance: 25/100 ❌
- Jira Synchronization: 7 days behind (last update July 25)
- Security Risk: HIGH - Payment processing without security audit
- Documentation Coverage: 20%
- Test Coverage: ~15%

**🔥 Active Remediation**: Comprehensive ESA-44x21 compliance sprint underway with 924 tasks across 44 layers × 21 phases. Critical focus on payment security, GDPR compliance, and test coverage. See `ESA_44X21S_COMPREHENSIVE_AUDIT_AUGUST_2025.md` for full details.

## User Preferences

Preferred communication style: Simple, everyday language.
Development approach: Comprehensive full-stack implementation using the **Mundo Tango 44x21 Framework** integrated with **Life CEO 16-Agent System** and **ESA Methodology**:

**ESA-44x21 Integration Protocol:**
When user says "use ESA", activate the full Life CEO 44x21 framework:
- **E (Error)**: Use Life CEO Analysis Agents (Agents 1-5) to scan across all 44 technical layers
- **S (Solution)**: Deploy Life CEO Planning Agents (Agents 6-10) to architect solutions across 21 development phases
- **A (Action)**: Execute with Life CEO Implementation Agents (Agents 11-16) with continuous validation through 44x21 matrix

**Life CEO Agent Assignments for ESA:**
- Agent 1-2: Code Analysis & Error Detection
- Agent 3-4: Security & Performance Scanning
- Agent 5-6: User Experience & Design Validation
- Agent 7-8: Solution Architecture & Planning
- Agent 9-10: Integration & API Coordination
- Agent 11-12: Implementation & Testing
- Agent 13-14: Deployment & Monitoring
- Agent 15-16: Continuous Improvement & Optimization

🏗️ 11 LAYERS SYSTEM FOR ANALYSIS + IMPLEMENTATION:
1. **Expertise Layer** — Identify required expertise (full-stack, security, AI, etc.)
2. **Open Source Scan Layer** — Research libraries, SDKs, public repos for implementation
3. **Legal & Compliance Layer** — Consider privacy, GDPR, legal risks and requirements
4. **Consent & UX Safeguards Layer** — Define visibility defaults, user controls, ethical considerations
5. **Data Layer** — Design schema, tables, relationships, RLS policies, query optimization
6. **Backend Layer** — Create API endpoints, server functions, triggers, business logic
7. **Frontend Layer** — Build pages, components, tabs, modals with responsive design
8. **Sync & Automation Layer** — Implement webhooks, events, scheduled jobs, real-time features
9. **Security & Permissions Layer** — Configure RBAC/ABAC logic, scoped access, authentication
10. **AI & Reasoning Layer** — Add suggestions, summarization, tagging, AI-driven features
11. **Testing & Observability Layer** — Build tests, logs, monitors, performance tracking

REWRITING PROTOCOL:
- When receiving unstructured input, re-analyze using 11L system
- Rewrite as fully structured Replit-ready implementation prompt
- Include scoped actions and technical coverage across all layers
- Always reference existing implementations, include open-source tool URLs, coordinate API contracts
- Provide implementation summaries with next steps and testing validation

## System Architecture

The platform is built on a decoupled, microservices-oriented architecture, comprising three independent systems: Life CEO, Community Platforms, and an Integration Layer.

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" with a primary palette of turquoise to cyan gradients, glassmorphic cards (backdrop-blur-xl, bg-white/70), and consistent typography. This theme is applied platform-wide.
- **Responsiveness**: All components and pages are designed with a mobile-first approach, ensuring optimal display across various devices.
- **Interaction**: Features include micro-interactions like ripple effects, magnetic buttons, confetti celebrations, and particle effects for an engaging user experience.
- **Theming**: A comprehensive theming system allows for instant site-wide visual transformations, supporting Business, Personal, Cultural, Agent, and Accessibility themes.

**Technical Implementations:**
- **Frontend**: Primarily React with a focus on functional components and hooks. State management is handled with React Query for API state and context APIs for global state. Routing is managed client-side.
- **Backend**: Node.js with Express.js for RESTful APIs. TypeScript is used for type safety across the stack.
- **Real-time**: WebSocket (Socket.io) for live messaging, notifications, and interactive features.
- **Authentication**: JWT-based authentication combined with session-based authentication for Replit OAuth. RBAC/ABAC is implemented with `@casl/ability` for fine-grained permissions.
- **Database Interaction**: Drizzle ORM is used for PostgreSQL interactions, supporting schema management and migrations.
- **Performance**: Aggressive optimizations including lazy loading, intelligent route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Internationalization**: Full infrastructure for language management and UI/content translation.
- **Payments**: Full Stripe integration for subscription management, payment methods, and webhook processing.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with tango roles, travel details, guest profiles, and an engagement system (achievements, challenges).
- **Social Features**: Post creation with rich text and media support, reactions, comments, share functionality, and real-time feeds.
- **Community Management**: City-specific groups with auto-creation, events, housing listings, and recommendations. Advanced filtering and role-based access for community features.
- **Admin Center**: A comprehensive dashboard with user management, content moderation, analytics, system health monitoring, and subscription management.
- **AI Integration**: Life CEO agents with semantic memory, context-aware responses, and self-learning capabilities. AI-powered analytics and optimization services.
- **Security**: Robust database security with Row Level Security (RLS) on critical tables, audit logging, and health check functions. CSRF protection and multi-factor authentication (2FA).
- **Reporting System**: A comprehensive system for reporting content, managed through the admin interface with moderation workflows.
- **Guest Onboarding**: A multi-step wizard for guest profile creation and booking management.
- **Host Onboarding**: An 8-step wizard for listing properties, including location mapping and amenity selection.
- **Maps**: Interactive maps using Leaflet.js with OpenStreetMap for city groups, events, housing, and recommendations. Google Maps is integrated for host onboarding.
- **Automations**: Automated city group assignment, professional group assignment, event/host/recommendation geocoding, and integration with registration workflows.

**System Design Choices:**
- **Microservices**: Separation of Life CEO, Community Platforms, and Integration Layer for scalability and independence.
- **Data Sovereignty**: Each system maintains its own isolated database, ensuring no shared data between distinct platforms.
- **API-First**: All inter-system communication is via versioned APIs, promoting loose coupling.
- **44x21s Framework**: A systematic development methodology spanning 44 layers of technical expertise and 21 development phases, ensuring comprehensive quality checkpoints and continuous validation.
- **PWA**: Progressive Web App capabilities for mobile app experience, including offline support and push notifications.

## External Dependencies

- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM
- **Payment Processing**: Stripe
- **Real-time Communication**: Socket.io (WebSocket)
- **Mapping**: Leaflet.js (with OpenStreetMap tiles), Google Maps API (for specific features like host onboarding)
- **Geocoding**: OpenStreetMap Nominatim API
- **AI/Machine Learning**: OpenAI GPT-4o (for Life CEO agents)
- **Error Tracking**: Sentry
- **Background Job Queue**: BullMQ
- **Metrics/Monitoring**: Prometheus
- **Search**: Elasticsearch (client configured)
- **Caching**: Redis (with in-memory fallback)
- **Image/Media Handling**: Multer (for uploads), Pexels API (for dynamic city photos)
- **Authentication/Authorization**: jsonwebtoken, bcrypt, @casl/ability
- **UI Framework**: React, Tailwind CSS, shadcn/ui, Radix UI, Material-UI (MUI)
- **Date/Time Utilities**: moment.js, date-fns
- **PDF Generation**: jsPDF, html2canvas
- **Data Visualization**: Recharts
- **Forms**: react-hook-form
- **Email Service**: Resend
- **Analytics**: Plausible Analytics
- **Project Management**: Atlassian Jira (integrated for tracking and export)
#!/bin/bash
# Life CEO: Install and configure Sentry for error tracking

echo "🧠 Life CEO: Installing Sentry for error tracking..."

# Install Sentry SDK
npm install @sentry/node @sentry/react @sentry/tracing

echo "✅ Sentry packages installed"
echo "📝 Next steps:"
echo "1. Create a Sentry account at https://sentry.io"
echo "2. Get your DSN from the project settings"
echo "3. Add SENTRY_DSN to your environment variables"
echo "4. The Life CEO will configure Sentry integration automatically"
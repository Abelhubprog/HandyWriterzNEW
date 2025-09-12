
# New StableLink.xyz Integration
VITE_STABLELINK_API_KEY=your_stablelink_api_key
VITE_STABLELINK_WEBHOOK_SECRET=your_webhook_secret
VITE_STABLELINK_ENVIRONMENT=production


# Clerk Authentication
# For Vite/React projects, use only VITE_CLERK_PUBLISHABLE_KEY.
# Use your test key for development, and set your live key in production environment variables.
# Example for development:
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bGlrZWQtbXVza3JhdC04LmNsZXJrLmFjY291bnRzLmRldiQ
# Example for production (set in your production environment, not in local .env):
# VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Authentication URLs
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ================================
# Cloudflare Configuration (Optional for Development)
# ================================
# Database - Required for production
VITE_CLOUDFLARE_DATABASE_URL=
VITE_CLOUDFLARE_API_TOKEN=5eb7395695b9aff11afe95628956f006f6444
VITE_CLOUDFLARE_ACCOUNT_ID=84ce8b7e7eb7730c0e599e75079b5179
VITE_CLOUDFLARE_DATABASE_ID=0e04c1b7-e87e-4131-8bfb-ab1d82f838c4

# R2 Storage - Required for file uploads
VITE_CLOUDFLARE_R2_API_URL=https://84ce8b7e7eb7730c0e599e75079b5179.r2.cloudflarestorage.com/handywriterz-files
VITE_CLOUDFLARE_R2_API_TOKEN=
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-25cd9d167e37468f939bae5ac930c6cd.r2.dev

# ================================
# Development Configuration
# ================================
NODE_ENV=development


# Email Configuration
VITE_RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@handywriterz.com

# Additional Security
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_encryption_key
WEBHOOK_SECRET=your_general_webhook_secret

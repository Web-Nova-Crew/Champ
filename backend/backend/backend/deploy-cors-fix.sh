#!/bin/bash

# CORS Fix Deployment Script
# This script deploys the CORS fix to Render

echo "🚀 Deploying CORS Fix to Render..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from the backend/backend directory"
    exit 1
fi

# Show current status
echo "📋 Current Git Status:"
git status --short
echo ""

# Add changes
echo "➕ Adding changes..."
git add server.js CORS_FIX_GUIDE.md
echo ""

# Show what will be committed
echo "📝 Changes to be committed:"
git diff --cached --stat
echo ""

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix CORS configuration for admin panel and mobile app

- Enhanced CORS middleware with comprehensive origin handling
- Added support for render.com subdomains
- Proper preflight request handling with 24-hour cache
- Support for all necessary HTTP methods and headers
- Mobile app compatibility (requests without origin)
- Maintained security with JWT authentication
- Added detailed documentation in CORS_FIX_GUIDE.md

Fixes: Admin panel login CORS blocking issue
"
echo ""

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main
echo ""

# Check push status
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to remote!"
    echo ""
    echo "🔄 Render will automatically deploy the changes."
    echo ""
    echo "📊 Next Steps:"
    echo "   1. Go to https://dashboard.render.com"
    echo "   2. Find your service: estato-axtj"
    echo "   3. Wait for deployment to complete (2-5 minutes)"
    echo "   4. Check deployment logs for any errors"
    echo "   5. Test admin login at: https://estato-axtj.onrender.com/admin/login"
    echo ""
    echo "🧪 Test Credentials:"
    echo "   Email: webnovacrew@gmail.com"
    echo "   Password: Webnovacrew8090@#@#"
    echo ""
    echo "📚 For detailed testing guide, see: CORS_FIX_GUIDE.md"
else
    echo "❌ Failed to push to remote"
    echo "Please check your git configuration and try again"
    exit 1
fi

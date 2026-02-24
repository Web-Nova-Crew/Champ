# CORS Fix Deployment Script (PowerShell)
# This script deploys the CORS fix to Render

Write-Host "🚀 Deploying CORS Fix to Render..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location $PSScriptRoot

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    Write-Host "Please run this script from the backend\backend directory"
    exit 1
}

# Show current status
Write-Host "📋 Current Git Status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Add changes
Write-Host "➕ Adding changes..." -ForegroundColor Yellow
git add server.js CORS_FIX_GUIDE.md
Write-Host ""

# Show what will be committed
Write-Host "📝 Changes to be committed:" -ForegroundColor Yellow
git diff --cached --stat
Write-Host ""

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
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
Write-Host ""

# Push to remote
Write-Host "📤 Pushing to remote repository..." -ForegroundColor Yellow
git push origin main
Write-Host ""

# Check push status
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to remote!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Render will automatically deploy the changes." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://dashboard.render.com"
    Write-Host "   2. Find your service: estato-axtj"
    Write-Host "   3. Wait for deployment to complete (2-5 minutes)"
    Write-Host "   4. Check deployment logs for any errors"
    Write-Host "   5. Test admin login at: https://estato-axtj.onrender.com/admin/login"
    Write-Host ""
    Write-Host "🧪 Test Credentials:" -ForegroundColor Cyan
    Write-Host "   Email: webnovacrew@gmail.com"
    Write-Host "   Password: Webnovacrew8090@#@#"
    Write-Host ""
    Write-Host "📚 For detailed testing guide, see: CORS_FIX_GUIDE.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push to remote" -ForegroundColor Red
    Write-Host "Please check your git configuration and try again"
    exit 1
}

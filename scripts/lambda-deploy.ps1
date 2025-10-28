# Remotion Lambda Deployment Script (PowerShell)
# This script helps deploy your Remotion Lambda function and site

Write-Host "🚀 Remotion Lambda Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
  Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
  Write-Host "Please create a .env file with your AWS credentials:"
  Write-Host "  REMOTION_AWS_ACCESS_KEY_ID=your-key"
  Write-Host "  REMOTION_AWS_SECRET_ACCESS_KEY=your-secret"
  exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Step 1: Deploy Lambda Function
Write-Host "📦 Step 1: Deploying Lambda function..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npx remotion lambda functions deploy

Write-Host ""
Write-Host "✅ Lambda function deployed!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Site
Write-Host "📦 Step 2: Deploying Remotion site to S3..." -ForegroundColor Yellow
$SITE_NAME = "launchbox-video-editor"
$ENTRY_POINT = "components/editor/version-7.0.0/remotion/entry.tsx"

Write-Host "Site name: $SITE_NAME"
Write-Host "Entry point: $ENTRY_POINT"
Write-Host ""

npx remotion lambda sites create $ENTRY_POINT --site-name=$SITE_NAME

Write-Host ""
Write-Host "✅ Site deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 IMPORTANT: Copy the Serve URL from above and update:" -ForegroundColor Yellow
Write-Host "   components/editor/version-7.0.0/constants.ts"
Write-Host "   Set SITE_NAME to the Serve URL"
Write-Host ""

# Step 3: Check Quotas
Write-Host "📊 Step 3: Checking AWS Lambda quotas..." -ForegroundColor Yellow
npx remotion lambda quotas

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update SITE_NAME in constants.ts with the Serve URL"
Write-Host "2. Test rendering with: npm run lambda:render"


#!/bin/bash

# Remotion Lambda Deployment Script
# This script helps deploy your Remotion Lambda function and site

set -e

echo "🚀 Remotion Lambda Deployment Script"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!"
  echo "Please create a .env file with your AWS credentials:"
  echo "  REMOTION_AWS_ACCESS_KEY_ID=your-key"
  echo "  REMOTION_AWS_SECRET_ACCESS_KEY=your-secret"
  exit 1
fi

echo "✅ .env file found"
echo ""

# Step 1: Deploy Lambda Function
echo "📦 Step 1: Deploying Lambda function..."
echo "This may take a few minutes..."
npx remotion lambda functions deploy

echo ""
echo "✅ Lambda function deployed!"
echo ""

# Step 2: Deploy Site
echo "📦 Step 2: Deploying Remotion site to S3..."
SITE_NAME="launchbox-video-editor"
ENTRY_POINT="components/editor/version-7.0.0/remotion/entry.tsx"

echo "Site name: $SITE_NAME"
echo "Entry point: $ENTRY_POINT"
echo ""

npx remotion lambda sites create "$ENTRY_POINT" --site-name="$SITE_NAME"

echo ""
echo "✅ Site deployed!"
echo ""
echo "📝 IMPORTANT: Copy the Serve URL from above and update:"
echo "   components/editor/version-7.0.0/constants.ts"
echo "   Set SITE_NAME to the Serve URL"
echo ""

# Step 3: Check Quotas
echo "📊 Step 3: Checking AWS Lambda quotas..."
npx remotion lambda quotas

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update SITE_NAME in constants.ts with the Serve URL"
echo "2. Test rendering with: npm run lambda:render"


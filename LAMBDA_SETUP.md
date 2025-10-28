# Remotion Lambda Setup Guide

This guide will walk you through setting up Remotion Lambda for video rendering on AWS.

## Prerequisites

- An AWS account
- Node.js and npm installed
- This project already has `@remotion/lambda@4.0.370` installed

## Step 1: Install Dependencies ✅

The Remotion Lambda package is already installed. If you need to reinstall:

```bash
npm install
```

## Step 2: Create IAM Role Policy

1. Go to your AWS account → **IAM** → **Policies** section
2. Click **"Create policy"**
3. Click the **JSON** tab
4. Copy the policy JSON from `aws-policies/role-policy.json` (or run `npx remotion lambda policies role`)
5. Click **Next**
6. Name the policy exactly: **`remotion-lambda-policy`**
7. Click **Create policy**

## Step 3: Create IAM Role

1. Go to **IAM** → **Roles** section
2. Click **"Create role"**
3. Under **"Use cases"**, select **"Lambda"** → Click **Next**
4. Under **"Permissions policies"**, search for `remotion-lambda-policy` and check it
5. Click **Next**
6. Name the role exactly: **`remotion-lambda-role`**
7. Click **"Create role"**

## Step 4: Create IAM User

1. Go to **IAM** → **Users** section
2. Click **"Add users"**
3. Enter a username (e.g., `remotion-user`)
4. **DO NOT** check "Enable console access"
5. Click **Next**
6. Skip permissions for now, click **Next** again
7. Click **"Create user"**

## Step 5: Create Access Key for User

1. Go to **IAM** → **Users** → Click on the user you just created
2. Go to the **"Security credentials"** tab
3. Scroll to **"Access Keys"** section
4. Click **"Create access key"**
5. Select **"Application running on an AWS compute service"**
6. Check the confirmation checkbox and click **Next**
7. Click **"Create access key"**
8. **Copy both the Access Key ID and Secret Access Key** (you won't see the secret again!)

### Add Credentials to .env

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   REMOTION_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   REMOTION_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

## Step 6: Add Permissions to User

1. Go to **IAM** → **Users** → Select your user
2. Click **"Add permissions"** → **"Add inline policy"**
3. Click the **JSON** tab
4. Copy the policy JSON from `aws-policies/user-policy.json` (or run `npx remotion lambda policies user`)
5. Click **"Review policy"**
6. Name it (e.g., `remotion-user-policy`)
7. Click **"Create policy"**

## Step 7: Validate Permissions (Optional)

Validate your setup by running:

```bash
npx remotion lambda policies validate
```

## Step 8: Deploy Lambda Function

Deploy the Remotion Lambda function to AWS:

```bash
npx remotion lambda functions deploy
```

This creates the necessary Lambda function in your AWS account. **Note:** If you upgrade Remotion versions, you'll need to redeploy the function.

## Step 9: Deploy Site to S3

Deploy your Remotion project to an S3 bucket. The entry point is at `components/editor/version-7.0.0/remotion/entry.tsx`:

```bash
npx remotion lambda sites create components/editor/version-7.0.0/remotion/entry.tsx --site-name=launchbox-video-editor
```

**Important:** The command will print a **Serve URL**. Copy this URL - you'll need it for rendering videos!

Update the `SITE_NAME` constant in `components/editor/version-7.0.0/constants.ts` with this Serve URL.

## Step 10: Check AWS Concurrency Limit

Check your AWS Lambda concurrency limit:

```bash
npx remotion lambda quotas
```

**Note:** By default, AWS allows 1000 concurrent invocations per region. New accounts might have limits as low as 10. Since each Remotion render can use up to 200 functions concurrently, you may need to request an increase if your limit is low.

To request an increase:
1. Go to AWS Service Quotas console
2. Search for "Lambda concurrent executions"
3. Request a quota increase

### Workaround for Low Concurrency Limits

If you have a low concurrency limit (like 10) while waiting for AWS approval:

**The project is already configured to work around this!** We've set `framesPerLambda` to 200 instead of the default 100. This means:
- 1 Lambda function for orchestration
- Up to 9 Lambda functions for rendering
- Each renderer handles 200 frames instead of 100

**Limitations with low limits:**
- Longer videos will render more slowly (fewer parallel functions)
- Once your quota is increased to 1000+, you can change `FRAMES_PER_LAMBDA` back to 100 in `app/api/latest/lambda/render/route.ts` for faster rendering

**Formula:** With concurrency limit of `N`, you can safely render videos with up to `(N-1) × framesPerLambda` frames.
- Example: Limit of 10, framesPerLambda of 200 = up to 1800 frames (~60 seconds at 30fps)

## Step 11: Test Render a Video

To test rendering a video via CLI:

```bash
npx remotion lambda render <serve-url> TestComponent
```

Replace `<serve-url>` with the Serve URL from Step 9, and `TestComponent` is the composition ID from your Remotion setup.

## Updating Your Deployment

### Update Remotion Code

When you update your Remotion code (components, props, etc.), redeploy the site:

```bash
npx remotion lambda sites create components/editor/version-7.0.0/remotion/entry.tsx --site-name=launchbox-video-editor
```

### Update Remotion Version

When you upgrade Remotion, you need to:

1. Update all `@remotion/*` packages in `package.json` to the same version
2. Run `npm install`
3. Redeploy the Lambda function:
   ```bash
   npx remotion lambda functions deploy
   ```
4. Redeploy the site (see above)

## Project Configuration

The Lambda configuration is already set up in:
- **Constants**: `components/editor/version-7.0.0/constants.ts`
  - `SITE_NAME`: Your deployed site name
  - `LAMBDA_FUNCTION_NAME`: Auto-generated when you deploy
  - `REGION`: AWS region (default: `us-east-1`)

- **API Route**: `app/api/latest/lambda/render/route.ts`
  - Handles video rendering requests
  - Validates AWS credentials
  - Configures render settings

## Troubleshooting

### "Repository not found" or Credential Errors
- Verify your `.env` file has correct credentials
- Ensure the credentials are for the user with the inline policy attached
- Check that the user's access key is active

### Function Not Found
- Make sure you've deployed the Lambda function (Step 8)
- Verify the function name in `constants.ts` matches your deployment

### Site Not Found
- Ensure you've deployed the site (Step 9)
- Verify the `SITE_NAME` in `constants.ts` is correct
- Check that you're using the Serve URL, not the site name

### Render Timeouts
- Check your AWS Lambda timeout settings
- Verify your concurrency limits (Step 10)
- Consider increasing Lambda memory allocation during deployment

## Next Steps

- Review the [Remotion Lambda Documentation](https://www.remotion.dev/docs/lambda)
- Check out the [Production Checklist](https://www.remotion.dev/docs/lambda/production-checklist)
- Configure your preferred AWS region(s)
- Set up monitoring and logging

## Resources

- [Remotion Lambda Docs](https://www.remotion.dev/docs/lambda)
- [Remotion Discord](https://remotion.dev/discord)
- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)


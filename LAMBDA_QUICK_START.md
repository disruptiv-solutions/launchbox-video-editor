# Lambda Setup Quick Start

## Prerequisites Checklist

- [ ] AWS account created
- [ ] Node.js dependencies installed (`npm install`)
- [ ] `.env` file created with AWS credentials

## Setup Steps (15-20 minutes)

### 1. AWS IAM Setup (Steps 2-6)

**Step 2: Create Role Policy**
- AWS IAM → Policies → Create policy → JSON
- Copy from: `aws-policies/role-policy.json`
- Name: `remotion-lambda-policy`

**Step 3: Create Role**
- AWS IAM → Roles → Create role → Lambda
- Attach `remotion-lambda-policy`
- Name: `remotion-lambda-role`

**Step 4: Create User**
- AWS IAM → Users → Add users
- Name: `remotion-user`
- No console access
- Create user

**Step 5: Create Access Key**
- Select user → Security credentials → Create access key
- Application running on AWS compute service
- **Copy Access Key ID and Secret Access Key**
- Add to `.env` file

**Step 6: Add User Permissions**
- Select user → Add inline policy → JSON
- Copy from: `aws-policies/user-policy.json`
- Name: `remotion-user-policy`

### 2. Local Setup

```bash
# 1. Copy .env.example to .env and fill in credentials
cp .env.example .env
# Edit .env with your AWS credentials

# 2. Install dependencies (if not already done)
npm install

# 3. Validate setup (optional)
npm run lambda:validate
```

### 3. Deploy to AWS

```bash
# Deploy Lambda function
npm run lambda:deploy

# Deploy site to S3
npm run lambda:deploy-site

# Or deploy both at once
npm run lambda:deploy-all
```

**IMPORTANT:** After deploying the site, you'll get a Serve URL. Copy it and update:
- `components/editor/version-7.0.0/constants.ts` → `SITE_NAME`

### 4. Check Quotas

```bash
npm run lambda:quotas
```

If your limit is low (< 200), request an increase in AWS Service Quotas.

### 5. Test Rendering

Once deployed, your video editor will automatically use Lambda for rendering if `RENDER_TYPE: "lambda"` is set in constants.ts.

## Helpful Commands

| Command | Description |
|---------|-------------|
| `npm run lambda:deploy` | Deploy Lambda function |
| `npm run lambda:deploy-site` | Deploy Remotion site |
| `npm run lambda:deploy-all` | Deploy both function and site |
| `npm run lambda:quotas` | Check AWS concurrency limits |
| `npm run lambda:validate` | Validate AWS permissions |
| `npm run lambda:policies:role` | Generate role policy JSON |
| `npm run lambda:policies:user` | Generate user policy JSON |

## Troubleshooting

**Credentials error?**
- Check `.env` file exists and has correct values
- Verify credentials are for the user with inline policy
- Ensure access key is active in AWS

**Function not found?**
- Run `npm run lambda:deploy`
- Check function name in constants.ts

**Site not found?**
- Run `npm run lambda:deploy-site`
- Update SITE_NAME in constants.ts with Serve URL

## Full Documentation

See `LAMBDA_SETUP.md` for detailed instructions and troubleshooting.


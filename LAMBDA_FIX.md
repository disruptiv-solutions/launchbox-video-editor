# Lambda Rendering Fix Documentation

**Date:** January 28, 2025  
**Commit:** `bf2bff3`  
**Branch:** `main`

## Overview

Fixed critical issues preventing video rendering on AWS Lambda, including proxy URL handling, duration calculation, disk space limitations, and concurrency limits.

---

## Issues Fixed

### 1. ❌ Proxy URL Problem (Critical)

**Problem:**
- Remotion was proxying external video URLs (Pexels, etc.) through `localhost:3000/proxy?src=...`
- Lambda environment cannot access `localhost`, causing render failures
- Error: `Failed to fetch http://localhost:3000/proxy?src=...`

**Root Cause:**
- Remotion's Video component automatically proxies external URLs in development
- These proxy URLs were being passed to Lambda where they're inaccessible
- The deployed Remotion site was also using proxy URLs

**Solution:**
- Added proxy URL cleanup in `video-layer-content.tsx` to extract original URLs before passing to OffthreadVideo
- Added backup cleanup in Lambda render API route (`app/api/latest/lambda/render/route.ts`)
- Pattern: Detect `localhost` + `/proxy` → Extract `src` parameter → Use original URL

**Files Changed:**
- `components/editor/version-7.0.0/components/overlays/video/video-layer-content.tsx`
- `app/api/latest/lambda/render/route.ts`

**Code Example:**
```typescript
// Clean up proxy URLs before using
if (videoSrc.includes("localhost") && videoSrc.includes("/proxy")) {
  const url = new URL(videoSrc);
  const srcParam = url.searchParams.get("src");
  if (srcParam) {
    videoSrc = decodeURIComponent(srcParam);
  }
}
```

---

### 2. ❌ Dynamic Duration Not Working

**Problem:**
- Videos only rendered ~1 second (30 frames) instead of full duration
- Composition had fixed `durationInFrames={30}` in `entry.tsx`

**Root Cause:**
- Missing `calculateMetadata` function to dynamically calculate duration from props
- Lambda was using the hardcoded default duration instead of the actual video length

**Solution:**
- Added `calculateMetadata` to composition in `entry.tsx`
- Now properly extracts `durationInFrames`, `width`, and `height` from `inputProps`

**Files Changed:**
- `components/editor/version-7.0.0/remotion/entry.tsx`

**Code Added:**
```typescript
calculateMetadata={async ({ props }) => {
  return {
    durationInFrames: props.durationInFrames,
    width: props.width,
    height: props.height,
  };
}}
```

---

### 3. ❌ Disk Space Insufficient

**Problem:**
- Lambda function only had 2048MB disk space
- Large video files (e.g., Pexels UHD videos) exceeded this limit
- Error: "Chrome rejecting the request because the disk space is low"

**Solution:**
- Redeployed Lambda function with increased disk space: 2048MB → 5120MB
- Updated memory allocation: 2048MB → 3008MB

**Files Changed:**
- `components/editor/version-7.0.0/constants.ts` (updated function name)

**New Lambda Function:**
- Name: `remotion-render-4-0-272-mem3008mb-disk5120mb-120sec`
- Memory: 3008MB
- Disk: 5120MB
- Timeout: 120sec

---

### 4. ⚠️ AWS Concurrency Limit Workaround

**Problem:**
- AWS account has concurrency limit of 10 (new account)
- Each render can use up to 200 Lambda functions concurrently
- Waiting for AWS approval to increase quota to 1000+

**Solution:**
- Increased `framesPerLambda` from 100 to 200
- Calculation: 1 orchestration + 9 renderers = 10 total (within limit)
- Can render videos up to ~60 seconds (1800 frames at 30fps)

**Files Changed:**
- `app/api/latest/lambda/render/route.ts`

**Configuration:**
```typescript
FRAMES_PER_LAMBDA: 200, // Increased from 100 for low concurrency limit
// TODO: Decrease back to 100 once AWS quota increase approved
```

**Limitations:**
- Longer videos render more slowly (fewer parallel functions)
- Maximum safe video length: `(concurrency_limit - 1) × framesPerLambda`
- Example: Limit 10, framesPerLambda 200 = 1800 frames max

---

### 5. ✅ Debug Logging Enhanced

**Added:**
- Console logging for received body and inputProps
- Duration logging for debugging
- Proxy URL replacement logging

**Files Changed:**
- `app/api/latest/lambda/render/route.ts`

---

## Deployment Steps Taken

1. **Updated Lambda Function**
   ```bash
   npx remotion lambda functions deploy --memory=3008 --disk=5120
   ```
   - Created: `remotion-render-4-0-272-mem3008mb-disk5120mb-120sec`

2. **Redeployed Site**
   ```bash
   npm run lambda:deploy-site
   ```
   - Updated: `launchbox-video-editor` site with proxy URL fixes

3. **Updated Constants**
   - Updated `LAMBDA_FUNCTION_NAME` in `constants.ts`

---

## Testing Results

✅ **Before Fixes:**
- Render failed with proxy URL errors
- Videos only rendered 1 second
- Disk space errors on larger files

✅ **After Fixes:**
- External videos (Pexels) render correctly
- Full video duration renders properly
- Large video files handle successfully
- Works within AWS concurrency limits

---

## Related Files

### Modified Files:
1. `app/api/latest/lambda/render/route.ts` - Proxy cleanup + logging
2. `components/editor/version-7.0.0/components/overlays/video/video-layer-content.tsx` - Proxy URL extraction
3. `components/editor/version-7.0.0/remotion/entry.tsx` - Dynamic duration
4. `components/editor/version-7.0.0/constants.ts` - Updated Lambda function name
5. `LAMBDA_SETUP.md` - Added concurrency limit workaround section

---

## Future Actions

### When AWS Quota is Increased:
1. Change `FRAMES_PER_LAMBDA` back to `100` in `app/api/latest/lambda/render/route.ts`
2. Remove TODO comment about concurrency limit
3. Test rendering speed improvement

### Package Updates Pending:
- Remotion packages show version mismatch (4.0.272 in node_modules vs 4.0.370 in package.json)
- Run `npm install` to sync versions when ready to upgrade
- Deploy new Lambda function matching updated Remotion version

---

## Notes

- The proxy URL fix handles both video `src` and image `content` properties
- The cleanup works both in the Remotion component and API route (defense in depth)
- Disk space was the limiting factor for UHD (4K) videos from Pexels
- The site must be redeployed whenever Remotion code changes

---

## References

- [Remotion Lambda Documentation](https://www.remotion.dev/docs/lambda)
- [AWS Lambda Quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
- Commit: `bf2bff3` - "Fix Lambda rendering issues - proxy URLs, duration, and disk space"


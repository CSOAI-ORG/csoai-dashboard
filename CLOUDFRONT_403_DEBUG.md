# CloudFront 403 Error - Debugging Guide

## Issue Summary
CloudFront is returning 403 (Forbidden) errors when accessing static assets or API endpoints through the CDN.

## Root Causes & Solutions

### 1. **Origin Access Identity (OAI) Configuration**

**Problem:** CloudFront cannot access the S3 origin bucket.

**Solution:**
```bash
# In AWS CloudFront Distribution Settings:
1. Go to Origins tab
2. Select the S3 origin
3. Enable "Restrict Bucket Access"
4. Create or select an Origin Access Identity (OAI)
5. Update S3 bucket policy to allow the OAI:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity XXXXXX"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 2. **CORS Configuration**

**Problem:** Browser is blocking cross-origin requests.

**Solution - S3 CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-version-id"],
    "MaxAgeSeconds": 3000
  }
]
```

**Solution - CloudFront Headers:**
1. Go to CloudFront Distribution → Behaviors
2. Add custom headers:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`
   - `Access-Control-Allow-Headers: *`

### 3. **Bucket Policy Permissions**

**Problem:** S3 bucket policy is too restrictive.

**Solution:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 4. **CloudFront Cache Invalidation**

**Problem:** Stale cache is serving 403 responses.

**Solution:**
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 5. **Origin Custom Headers**

**Problem:** Origin is rejecting requests without proper headers.

**Solution - Add to CloudFront Distribution:**
1. Origins → Edit Origin
2. Add Custom Headers:
   - Header Name: `Authorization`
   - Value: `Bearer YOUR_TOKEN` (if required)

### 6. **Error Pages Configuration**

**Problem:** CloudFront is not configured to handle errors gracefully.

**Solution:**
1. Go to CloudFront Distribution → Error Pages
2. Create custom error responses:
   - 403 → `/index.html` (for SPA routing)
   - 404 → `/index.html` (for SPA routing)

## Verification Steps

### Step 1: Check Origin Accessibility
```bash
# Test direct S3 access
curl -I https://your-bucket-name.s3.amazonaws.com/index.html

# Test CloudFront access
curl -I https://your-cloudfront-domain.cloudfront.net/index.html
```

### Step 2: Check CloudFront Logs
```bash
# Enable CloudFront logging to S3
# Then analyze logs for 403 responses:
grep " 403 " your-cloudfront-logs.log
```

### Step 3: Verify CORS Headers
```bash
# Check response headers
curl -I -H "Origin: https://your-domain.com" \
  https://your-cloudfront-domain.cloudfront.net/api/endpoint
```

### Step 4: Test with CloudFront Test Tool
1. Go to CloudFront Distribution
2. Use "Test Distribution" feature
3. Check response headers and status codes

## Common 403 Scenarios

| Scenario | Cause | Fix |
|----------|-------|-----|
| 403 on all assets | OAI not configured | Create OAI and update bucket policy |
| 403 on API calls | CORS not enabled | Add CORS headers to distribution |
| 403 after deployment | Cache issue | Invalidate CloudFront cache |
| 403 from specific IPs | IP restriction | Check security groups and WAF rules |
| 403 on specific paths | Path-based routing issue | Check behavior settings |

## Manus-Specific Configuration

For Manus-hosted projects, CloudFront configuration is typically handled automatically. However, if you're experiencing 403 errors:

1. **Check Manus Dashboard:**
   - Go to Settings → Domains
   - Verify CDN is enabled
   - Check SSL/TLS certificate status

2. **Verify Static Assets:**
   - Ensure all files in `/client/public/` are properly uploaded
   - Check file permissions in the deployment

3. **Test Locally:**
   ```bash
   npm run build
   npm run start
   # Access http://localhost:3000 and check for 403 errors
   ```

4. **Contact Manus Support:**
   - If errors persist, submit a support ticket with:
     - Distribution ID
     - Error logs
     - Affected URLs
     - Browser console errors

## Prevention Checklist

- [ ] OAI is created and configured
- [ ] S3 bucket policy allows CloudFront access
- [ ] CORS is properly configured
- [ ] Cache invalidation is set up
- [ ] Error pages are configured for SPA routing
- [ ] CloudFront logging is enabled
- [ ] SSL/TLS certificate is valid
- [ ] Security groups allow CloudFront IPs
- [ ] WAF rules don't block legitimate requests
- [ ] Origin is responding with 200 status

## Additional Resources

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [CloudFront Error Responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/custom-error-pages.html)
- [Manus Documentation](https://docs.manus.im)

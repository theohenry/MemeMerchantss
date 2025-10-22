# Deployment Guide

## Quick Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial MemeMerchantss setup"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### 3. Set Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:

```
X_TWITTER_API_KEY=your_api_key_here
X_TWITTER_API_SECRET=your_api_secret_here
X_TWITTER_ACCESS_TOKEN=your_access_token_here
X_TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
X_TWITTER_BEARER_TOKEN=your_bearer_token_here
X_ACCOUNT_HANDLE=mememerchantss
MERCH_API_URL=https://your-merch-api.com/api/create
MERCH_API_KEY=your_merch_api_key_here
REPLY_CAPTION_TEMPLATE=We turned your meme into merch. Buy now: {url}
```

### 4. Test Deployment
- Visit: `https://your-app.vercel.app/api/health`
- Should return: `{"status":"healthy","timestamp":"...","service":"MemeMerchantss API","version":"1.0.0"}`

### 5. Enable Cron Job
The cron job is already configured in `vercel.json` to run every minute.
Vercel will automatically enable it after deployment.

### 6. Test the Full Flow
1. Tag @mememerchantss in a tweet with an image
2. Wait up to 60 seconds for the cron to run
3. Check if a reply was posted with merch link

## Manual Testing
- `POST https://your-app.vercel.app/api/test-mention` - Triggers processing manually
- Check Vercel Function logs for debugging

## Monitoring
- Vercel Dashboard → Functions tab for logs
- Health endpoint for uptime monitoring
- X API usage in Twitter Developer Portal

## Troubleshooting
- **Cron not running**: Check Vercel Pro plan (cron requires paid plan)
- **API errors**: Check environment variables and X API permissions
- **No replies**: Verify X API has write permissions and correct tokens

Your MemeMerchantss service is now live! 🚀

# MemeMerchantss

A service that turns meme posts on X into real merchandise. When someone tags @mememerchantss, the service creates merch from the referenced image and replies with a clever caption, image of the merch, and buy link.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- X/Twitter Developer Account with API access
- Vercel account for deployment

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd MemeMerchantss
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

Required environment variables:
- `X_TWITTER_API_KEY` - Your X API key
- `X_TWITTER_API_SECRET` - Your X API secret  
- `X_TWITTER_ACCESS_TOKEN` - Your X access token
- `X_TWITTER_ACCESS_TOKEN_SECRET` - Your X access token secret
- `X_TWITTER_BEARER_TOKEN` - Your X bearer token
- `X_ACCOUNT_HANDLE` - Your X handle (default: mememerchantss)
- `MERCH_API_URL` - Your merch creation API endpoint
- `MERCH_API_KEY` - Your merch API key
- `REPLY_CAPTION_TEMPLATE` - Reply template (default: "We turned your meme into merch. Buy now: {url}")

### 3. Local Development
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The cron job will automatically run every minute to check for mentions.

## 📋 API Endpoints

- `GET /api/health` - Health check
- `GET /api/cron/check-mentions` - Cron endpoint (runs every minute)
- `POST /api/test-mention` - Manual test trigger

## 🔧 How It Works

1. **Mention Detection**: Vercel cron runs every 60 seconds
2. **Image Processing**: Extracts images from mentioned tweets
3. **Merch Creation**: Calls merch API to create products (mocked for MVP)
4. **Reply Posting**: Posts reply with merch image and Shopify link

## 🛠️ Development

### Project Structure
```
├── app/
│   └── api/           # API routes
├── lib/
│   ├── x-client.ts    # X/Twitter API client
│   ├── merch-client.ts # Merch API client
│   └── mention-processor.ts # Main processing logic
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies
```

### Testing
- Use `/api/test-mention` to manually trigger processing
- Check logs in Vercel dashboard for debugging
- Monitor `/api/health` for service status

## 🔐 Security Notes

- Never commit `.env.local` or `.env` files
- Use Vercel environment variables for production
- Rotate API keys regularly
- Monitor API usage and rate limits

## 📈 Monitoring

- Vercel Function logs show processing status
- Health endpoint for uptime monitoring
- Error handling with detailed logging

## 🚨 Troubleshooting

**Common Issues:**
- Missing environment variables → Check Vercel dashboard
- API rate limits → Monitor X API usage
- Image processing fails → Check media URLs in tweets
- Reply posting fails → Verify X API permissions

**Debug Steps:**
1. Check `/api/health` endpoint
2. Test with `/api/test-mention`
3. Review Vercel function logs
4. Verify all environment variables are set

## 📝 Next Steps

1. Replace mock merch API with real implementation
2. Add image validation and filtering
3. Implement duplicate detection
4. Add analytics and monitoring
5. Scale for higher volume

---

Built with Next.js, TypeScript, and Vercel. Ready to turn memes into merchandise! 🎨👕

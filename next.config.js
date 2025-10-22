/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    X_TWITTER_API_KEY: process.env.X_TWITTER_API_KEY,
    X_TWITTER_API_SECRET: process.env.X_TWITTER_API_SECRET,
    X_TWITTER_ACCESS_TOKEN: process.env.X_TWITTER_ACCESS_TOKEN,
    X_TWITTER_ACCESS_TOKEN_SECRET: process.env.X_TWITTER_ACCESS_TOKEN_SECRET,
    X_TWITTER_BEARER_TOKEN: process.env.X_TWITTER_BEARER_TOKEN,
    X_ACCOUNT_HANDLE: process.env.X_ACCOUNT_HANDLE,
    MERCH_API_URL: process.env.MERCH_API_URL,
    MERCH_API_KEY: process.env.MERCH_API_KEY,
    REPLY_CAPTION_TEMPLATE: process.env.REPLY_CAPTION_TEMPLATE,
    LAST_PROCESSED_TWEET_ID: process.env.LAST_PROCESSED_TWEET_ID,
  },
}

module.exports = nextConfig

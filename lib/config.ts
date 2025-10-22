export interface AppConfig {
  xAccountHandle: string;
  xBearerToken: string;
  xApiKey: string;
  xApiSecret: string;
  xAccessToken: string;
  xAccessSecret: string;
  replyTemplate: string;
  productServiceUrl: string;
  productServiceApiKey?: string;
  callbackPath: string;
}

/**
 * Read and validate application configuration from environment variables.
 * Throws immediately if any required variable is missing to avoid flaky runtime failures.
 */
export function getConfig(): AppConfig {
  return {
    xAccountHandle: requireEnv('X_ACCOUNT_HANDLE'),
    xBearerToken: requireEnv('X_TWITTER_BEARER_TOKEN'),
    xApiKey: requireEnv('X_TWITTER_API_KEY'),
    xApiSecret: requireEnv('X_TWITTER_API_SECRET'),
    xAccessToken: requireEnv('X_TWITTER_ACCESS_TOKEN'),
    xAccessSecret: requireEnv('X_TWITTER_ACCESS_TOKEN_SECRET'),
    replyTemplate: process.env.REPLY_CAPTION_TEMPLATE || 'We turned this meme into merch. Buy now: {url}',
    productServiceUrl: requireEnv('PRODUCT_SERVICE_URL'),
    productServiceApiKey: process.env.PRODUCT_SERVICE_API_KEY,
    callbackPath: process.env.PRODUCT_CALLBACK_PATH || '/api/product-callback',
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

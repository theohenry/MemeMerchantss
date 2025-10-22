import { TwitterApi } from 'twitter-api-v2';

/**
 * X/Twitter API client for reading mentions and posting replies
 */
export class XClient {
  private client: TwitterApi;
  private accountHandle: string;

  constructor() {
    this.accountHandle = process.env.X_ACCOUNT_HANDLE || 'mememerchantss';
    
    // Initialize with OAuth 1.0a for posting capabilities
    this.client = new TwitterApi({
      appKey: process.env.X_TWITTER_API_KEY!,
      appSecret: process.env.X_TWITTER_API_SECRET!,
      accessToken: process.env.X_TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.X_TWITTER_ACCESS_TOKEN_SECRET!,
    });
  }

  /**
   * Get recent mentions of @mememerchantss
   * @param sinceId - Only return tweets newer than this ID
   */
  async getMentions(sinceId?: string) {
    try {
      console.log(`🔍 Fetching mentions since ID: ${sinceId || 'beginning'}`);
      
      const mentions = await this.client.v2.mentionsTimeline(this.client.getCurrentUser().id, {
        since_id: sinceId,
        'tweet.fields': ['created_at', 'attachments', 'public_metrics'],
        'media.fields': ['url', 'type', 'width', 'height'],
        expansions: ['attachments.media_keys'],
        max_results: 10
      });

      console.log(`📊 Found ${mentions.data?.length || 0} mentions`);
      return mentions;
    } catch (error) {
      console.error('❌ Error fetching mentions:', error);
      throw new Error(`Failed to fetch mentions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get media URLs from a tweet
   * @param tweet - Tweet object with media attachments
   */
  getMediaUrls(tweet: any): string[] {
    if (!tweet.attachments?.media_keys) return [];
    
    const mediaUrls: string[] = [];
    // This would need to be implemented based on the actual tweet structure
    // For now, return empty array as we'll mock the merch creation
    return mediaUrls;
  }

  /**
   * Post a reply with media and text
   * @param originalTweetId - ID of the tweet being replied to
   * @param text - Reply text
   * @param mediaUrl - URL of the merch image to upload
   */
  async postReply(originalTweetId: string, text: string, mediaUrl?: string) {
    try {
      console.log(`📝 Posting reply to tweet ${originalTweetId}: ${text}`);
      
      let mediaId: string | undefined;
      
      // Upload media if provided
      if (mediaUrl) {
        console.log(`📸 Uploading media from: ${mediaUrl}`);
        const mediaUpload = await this.client.v1.uploadMedia(mediaUrl);
        mediaId = mediaUpload;
        console.log(`✅ Media uploaded with ID: ${mediaId}`);
      }

      // Post the reply
      const reply = await this.client.v2.reply(text, originalTweetId, {
        media: mediaId ? { media_ids: [mediaId] } : undefined
      });

      console.log(`✅ Reply posted successfully: ${reply.data.id}`);
      return reply;
    } catch (error) {
      console.error('❌ Error posting reply:', error);
      throw new Error(`Failed to post reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current user's account info
   */
  async getCurrentUser() {
    try {
      return await this.client.currentUser();
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

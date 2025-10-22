import { XClient } from './x-client';
import { MerchClient } from './merch-client';

/**
 * Main processor for handling @mememerchantss mentions
 * Fetches mentions, creates merch, and posts replies
 */
export class MentionProcessor {
  private xClient: XClient;
  private merchClient: MerchClient;
  private lastProcessedId: string | null;

  constructor() {
    this.xClient = new XClient();
    this.merchClient = new MerchClient();
    this.lastProcessedId = process.env.LAST_PROCESSED_TWEET_ID || null;
  }

  /**
   * Process all new mentions since last run
   */
  async processMentions(): Promise<{ processed: number; errors: number }> {
    try {
      console.log('🚀 Starting mention processing...');
      
      // Get mentions since last processed ID
      const mentions = await this.xClient.getMentions(this.lastProcessedId || undefined);
      
      if (!mentions.data || mentions.data.length === 0) {
        console.log('📭 No new mentions found');
        return { processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;
      let latestId = this.lastProcessedId;

      // Process each mention
      for (const mention of mentions.data) {
        try {
          await this.processMention(mention);
          processed++;
          latestId = mention.id;
          console.log(`✅ Processed mention ${mention.id}`);
        } catch (error) {
          errors++;
          console.error(`❌ Error processing mention ${mention.id}:`, error);
        }
      }

      // Update last processed ID
      if (latestId) {
        this.lastProcessedId = latestId;
        console.log(`📝 Updated last processed ID to: ${latestId}`);
      }

      console.log(`🎉 Processing complete: ${processed} processed, ${errors} errors`);
      return { processed, errors };
    } catch (error) {
      console.error('❌ Fatal error in mention processing:', error);
      throw error;
    }
  }

  /**
   * Process a single mention
   * @param mention - The mention tweet to process
   */
  private async processMention(mention: any) {
    console.log(`🔍 Processing mention: ${mention.id}`);
    console.log(`📝 Tweet text: ${mention.text}`);

    // Check if tweet has media attachments
    const mediaUrls = this.xClient.getMediaUrls(mention);
    
    if (mediaUrls.length === 0) {
      console.log('⚠️ No media found in mention, skipping');
      return;
    }

    // Use the first image for merch creation
    const sourceImageUrl = mediaUrls[0];
    console.log(`🖼️ Using source image: ${sourceImageUrl}`);

    // Create merch from the image
    const merchResult = await this.merchClient.createMerch(sourceImageUrl, mention.text);
    
    if (!merchResult.success) {
      throw new Error('Failed to create merchandise');
    }

    // Generate reply text
    const replyText = this.generateReplyText(merchResult.shopifyUrl);
    console.log(`💬 Reply text: ${replyText}`);

    // Post reply with merch image and link
    await this.xClient.postReply(
      mention.id,
      replyText,
      merchResult.merchImageUrl
    );

    console.log(`🎉 Successfully processed mention ${mention.id}`);
  }

  /**
   * Generate reply text with the shopify URL
   * @param shopifyUrl - The Shopify product URL
   */
  private generateReplyText(shopifyUrl: string): string {
    const template = process.env.REPLY_CAPTION_TEMPLATE || 'We turned your meme into merch. Buy now: {url}';
    return template.replace('{url}', shopifyUrl);
  }

  /**
   * Get the last processed tweet ID
   */
  getLastProcessedId(): string | null {
    return this.lastProcessedId;
  }

  /**
   * Set the last processed tweet ID
   * @param id - The tweet ID to set
   */
  setLastProcessedId(id: string) {
    this.lastProcessedId = id;
  }
}

/**
 * Convenience function for the cron job
 */
export async function processMentions() {
  const processor = new MentionProcessor();
  return await processor.processMentions();
}

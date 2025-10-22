import { TwitterApi, TweetV2, TwitterApiReadWrite, MediaObjectV2, TweetV2LookupResult } from 'twitter-api-v2';
import { getConfig } from './config';

export interface MentionCandidate {
  mentionId: string;
  parentId: string;
  imageUrl: string;
  mentionText: string;
  parentText: string;
}

interface TweetPhotoDetails {
  tweet: TweetV2;
  photoUrl?: string;
}

export interface ReplyPayload {
  parentId: string;
  text: string;
  mockupImageUrl?: string;
}

/**
 * Wrapper around X/Twitter API interactions with helpers for the MemeMerchantss workflow.
 * Uses bearer token for read operations and user context (OAuth 1.0a) for posting and media upload.
 */
export class XApi {
  private readonly readClient: TwitterApi;
  private readonly writeClient: TwitterApiReadWrite;
  private readonly handle: string;
  private cachedUserId?: string;

  constructor() {
    const config = getConfig();

    this.handle = config.xAccountHandle;
    this.readClient = new TwitterApi(config.xBearerToken);
    this.writeClient = new TwitterApi({
      appKey: config.xApiKey,
      appSecret: config.xApiSecret,
      accessToken: config.xAccessToken,
      accessSecret: config.xAccessSecret,
    }).readWrite;
  }

  /**
   * Fetch the most recent mentions and return those with an associated image on the parent tweet.
   * Only the first photo for each tweet is used – requirements guarantee a single image per tweet.
   */
  async fetchLatestMentionCandidates(limit: number): Promise<MentionCandidate[]> {
    const userId = await this.getAccountId();
    const mentionsPaginator = await this.readClient.v2.userMentionTimeline(userId, {
      max_results: Math.max(5, limit),
      'tweet.fields': ['created_at', 'text', 'referenced_tweets'],
      'user.fields': ['username'],
    });

    const mentions = mentionsPaginator.tweets ?? [];
    const parentIds = new Set<string>();

    for (const mention of mentions) {
      parentIds.add(this.resolveParentTweetId(mention));
    }

    const parentDetails = await this.fetchParentTweetsWithMedia(Array.from(parentIds));

    const results: MentionCandidate[] = [];
    for (const mention of mentions) {
      const parentId = this.resolveParentTweetId(mention);
      const details = parentDetails.get(parentId);
      const imageUrl = details?.photoUrl;

      if (!imageUrl) {
        console.log(`⚠️ Skipping mention ${mention.id} – no image found on parent tweet ${parentId}`);
        continue;
      }

      results.push({
        mentionId: mention.id,
        parentId,
        imageUrl,
        mentionText: mention.text ?? '',
        parentText: details?.tweet.text ?? '',
      });

      if (results.length >= limit) {
        break;
      }
    }

    console.log(`📬 Prepared ${results.length} mention candidate(s) for merch generation`);
    return results;
  }

  /**
   * Post a reply under the specified tweet, optionally attaching an uploaded mockup image.
   */
  async replyWithOptionalMedia(payload: ReplyPayload) {
    const { parentId, text, mockupImageUrl } = payload;

    let mediaId: string | undefined;

    if (mockupImageUrl) {
      mediaId = await this.uploadMediaFromUrl(mockupImageUrl);
    }

    const tweetBody: Record<string, any> = {
      text,
      reply: { in_reply_to_tweet_id: parentId },
    };

    if (mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    const response = await this.writeClient.v2.tweet(tweetBody);
    console.log(`✅ Posted reply ${response.data.id} for parent tweet ${parentId}`);

    return response;
  }

  private async getAccountId(): Promise<string> {
    if (this.cachedUserId) {
      return this.cachedUserId;
    }

    const user = await this.readClient.v2.userByUsername(this.handle);
    if (!user.data) {
      throw new Error(`Unable to resolve user id for @${this.handle}`);
    }

    this.cachedUserId = user.data.id;
    return this.cachedUserId;
  }

  private resolveParentTweetId(mention: TweetV2): string {
    const referenced = mention.referenced_tweets?.find((ref) =>
      ref.type === 'replied_to' || ref.type === 'quoted' || ref.type === 'retweeted'
    );

    return referenced?.id ?? mention.id;
  }

  private async fetchParentTweetsWithMedia(ids: string[]): Promise<Map<string, TweetPhotoDetails>> {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const result = new Map<string, TweetPhotoDetails>();

    if (uniqueIds.length === 0) {
      return result;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 100) {
      chunks.push(uniqueIds.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const response: TweetV2LookupResult = await this.readClient.v2.tweets(chunk, {
        expansions: ['attachments.media_keys', 'author_id'],
        'tweet.fields': ['id', 'text', 'created_at', 'attachments'],
        'media.fields': ['media_key', 'type', 'url', 'preview_image_url', 'variants'],
        'user.fields': ['id', 'username', 'name', 'profile_image_url'],
      });

      const mediaIndex = new Map<string, MediaObjectV2>();
      for (const media of response.includes?.media ?? []) {
        if (media.media_key) {
          mediaIndex.set(media.media_key, media);
        }
      }

      for (const tweet of response.data ?? []) {
        const photoUrl = this.findPhotoUrl(tweet, mediaIndex);
        result.set(tweet.id, { tweet, photoUrl });
      }
    }

    return result;
  }

  private findPhotoUrl(tweet: TweetV2, mediaIndex: Map<string, MediaObjectV2>): string | undefined {
    for (const key of tweet.attachments?.media_keys ?? []) {
      const media = mediaIndex.get(key);
      if (!media) continue;

      if (media.type === 'photo' && typeof media.url === 'string') {
        return media.url;
      }

      if ((media.type === 'animated_gif' || media.type === 'video') && typeof media.preview_image_url === 'string') {
        return media.preview_image_url;
      }
    }

    return undefined;
  }

  private async uploadMediaFromUrl(url: string): Promise<string> {
    console.log(`📤 Downloading mockup image from ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download mockup image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? undefined;
    const buffer = Buffer.from(await response.arrayBuffer());

    const mediaId = await this.writeClient.v1.uploadMedia(buffer, { mimeType: contentType });
    console.log(`📎 Uploaded media ${mediaId} to X`);
    return mediaId;
  }
}

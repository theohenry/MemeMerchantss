import { getConfig } from '../config';
import { ProductServiceClient } from '../product-service';
import { XApi } from '../x-api';

export interface RunTodayResult {
  processed: number;
  enqueued: number;
  errors: number;
  details: Array<{
    parentId: string;
    mentionId: string;
    enqueued: boolean;
    error?: string;
  }>;
}

const MAX_MENTIONS_TO_FETCH = 5;

/**
 * Orchestrates the daily merch generation run.
 * - Fetch latest mentions
 * - Filter down to tweets with images
 * - Kick off merch generation with callback hooks
 */
export async function runTodayWorkflow(origin: string): Promise<RunTodayResult> {
  const config = getConfig();
  const xApi = new XApi();
  const productService = new ProductServiceClient();
  const callbackUrl = new URL(config.callbackPath, origin).toString();

  const candidates = await xApi.fetchLatestMentionCandidates(MAX_MENTIONS_TO_FETCH);

  if (candidates.length === 0) {
    console.log('📭 No mention candidates with images found during daily run');
    return { processed: 0, enqueued: 0, errors: 0, details: [] };
  }

  const details: RunTodayResult['details'] = [];
  let enqueued = 0;
  let errors = 0;

  for (const candidate of candidates) {
    const idempotencyKey = buildIdempotencyKey(candidate.parentId, candidate.mentionId);

    console.log(
      `🧵 Enqueueing merch generation for parent tweet ${candidate.parentId} (mention ${candidate.mentionId})`,
    );

    const response = await productService.enqueueMerch({
      parentId: candidate.parentId,
      imageUrl: candidate.imageUrl,
      type: 'tweet',
      callbackUrl,
      idempotencyKey,
    });

    if (response.ok) {
      enqueued += 1;
      details.push({
        parentId: candidate.parentId,
        mentionId: candidate.mentionId,
        enqueued: true,
      });
    } else {
      errors += 1;
      details.push({
        parentId: candidate.parentId,
        mentionId: candidate.mentionId,
        enqueued: false,
        error: response.error,
      });
    }
  }

  return {
    processed: candidates.length,
    enqueued,
    errors,
    details,
  };
}

function buildIdempotencyKey(parentId: string, mentionId: string): string {
  return `tweet:${parentId}:mention:${mentionId}`;
}

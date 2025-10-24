import { getConfig } from '../config';
import { XApi } from '../x-api';

export interface ProductCallbackPayload {
  status?: string;
  parentId: string;
  productUrl: string;
  imageUrl?: string;
  idempotencyKey: string;
}

export interface ProductCallbackResult {
  acknowledged: boolean;
  replied: boolean;
  parentId: string;
  idempotencyKey: string;
  status: string;
  error?: string;
}

/**
 * Handle webhook callbacks from the product generation service.
 */
export async function handleProductCallback(payload: ProductCallbackPayload): Promise<ProductCallbackResult> {
  const config = getConfig();
  const xApi = new XApi();

  if (!payload.productUrl) {
    throw new Error('Missing productUrl in callback payload');
  }

  const text = config.replyTemplate.replace('{url}', payload.productUrl);

  console.log(`💬 Posting reply for parent tweet ${payload.parentId}`);

  await xApi.replyWithOptionalMedia({
    parentId: payload.parentId,
    text,
    mockupImageUrl: payload.imageUrl,
  });

  return {
    acknowledged: true,
    replied: true,
    parentId: payload.parentId,
    idempotencyKey: payload.idempotencyKey,
    status: payload.status || 'unknown',
  };
}

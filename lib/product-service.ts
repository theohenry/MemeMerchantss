import { getConfig } from './config';

export interface MerchRequestPayload {
  parentId: string;
  imageUrl: string;
  type: string;
  callbackUrl: string;
  idempotencyKey: string;
}

export interface MerchRequestResult {
  ok: boolean;
  status: number;
  idempotencyKey: string;
  parentId: string;
  error?: string;
}

/**
 * Client for the external product generation service.
 */
export class ProductServiceClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.productServiceUrl;
    this.apiKey = config.productServiceApiKey;
  }

  /**
   * Enqueue merch generation for a given tweet image.
   */
  async enqueueMerch(payload: MerchRequestPayload): Promise<MerchRequestResult> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        'Idempotency-Key': payload.idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await safeReadText(response);
      const message = `Product service responded with ${response.status}: ${errorBody}`;
      console.error(message);

      return {
        ok: false,
        status: response.status,
        idempotencyKey: payload.idempotencyKey,
        parentId: payload.parentId,
        error: message,
      };
    }

    console.log(`📦 Merch request accepted for parent tweet ${payload.parentId}`);
    return {
      ok: true,
      status: response.status,
      idempotencyKey: payload.idempotencyKey,
      parentId: payload.parentId,
    };
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch (error) {
    return `unable to read body: ${String(error)}`;
  }
}

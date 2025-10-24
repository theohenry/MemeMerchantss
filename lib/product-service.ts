import { getConfig } from './config';

export interface MerchRequestPayload {
  parentId: string;
  imageUrl: string;
  callbackUrl: string;
  idempotencyKey: string;
}

export interface MerchRequestResult {
  status: string;
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
    console.log(`🚀 Sending merch request to: ${this.baseUrl}`);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await safeReadText(response);
      const message = `Product service HTTP error ${response.status}: ${errorBody}`;
      console.error(message);

      return {
        status: "error",
        error: message,
      };
    }

    // Parse the JSON response to get the status field
    const responseData = await response.json();

    if (responseData.status !== "accepted") {
      const message = `Product service returned status: ${responseData.status}`;
      console.error(message);

      return {
        status: responseData.status,
        error: message,
      };
    }

    console.log(`📦 Merch request accepted for parent tweet ${payload.parentId}`);
    return {
      status: responseData.status,
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

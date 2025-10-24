import { NextRequest, NextResponse } from 'next/server';
import { handleProductCallback, ProductCallbackPayload } from '@/lib/workflows/product-callback';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ProductCallbackPayload;
    validatePayload(payload);

    const result = await handleProductCallback(payload);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in product callback handler', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
}

function validatePayload(payload: ProductCallbackPayload) {
  console.log('🔍 Validating payload', payload);
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload body');
  }

  if (!payload.parentId) {
    throw new Error('parentId is required');
  }

  if (!payload.productUrl) {
    throw new Error('productUrl is required');
  }

  if (!payload.idempotencyKey) {
    throw new Error('idempotencyKey is required');
  }
}

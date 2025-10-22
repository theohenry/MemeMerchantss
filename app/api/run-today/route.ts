import { NextRequest, NextResponse } from 'next/server';
import { runTodayWorkflow } from '@/lib/workflows/run-today';

async function handler(request: NextRequest) {
  try {
    const origin = request.nextUrl?.origin ?? inferOrigin(request);
    const result = await runTodayWorkflow(origin);

    return NextResponse.json({
      success: true,
      ...result,
      origin,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error running daily workflow', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export const POST = handler;
export const GET = handler;

function inferOrigin(request: NextRequest): string {
  const host = request.headers.get('host');
  if (!host) {
    throw new Error('Unable to determine request origin for callback URL');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Useful for monitoring and debugging
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MemeMerchantss API',
    version: '1.0.0'
  });
}

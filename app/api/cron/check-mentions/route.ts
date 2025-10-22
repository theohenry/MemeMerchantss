import { NextRequest, NextResponse } from 'next/server';
import { processMentions } from '@/lib/mention-processor';

/**
 * Vercel Cron endpoint - runs every minute
 * Checks for new @mememerchantss mentions and processes them
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Checking for new mentions...');
    
    const result = await processMentions();
    
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} mentions`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in mention processing:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

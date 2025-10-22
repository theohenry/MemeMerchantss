import { NextRequest, NextResponse } from 'next/server';
import { processMentions } from '@/lib/mention-processor';

/**
 * Test endpoint for manually triggering mention processing
 * Useful for testing without waiting for cron
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Manual mention processing triggered');
    
    const result = await processMentions();
    
    return NextResponse.json({
      success: true,
      message: `Test completed: ${result.processed} processed, ${result.errors} errors`,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in test mention processing:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

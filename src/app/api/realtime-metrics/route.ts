import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRealtimeMetrics } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    // Set up Server-Sent Events
    const responseStream = new ReadableStream({
      start(controller) {
        // Send initial data
        const sendData = async () => {
          try {
            const metrics = await getRealtimeMetrics(websiteId);

            const data = `data: ${JSON.stringify({
              timestamp: new Date().toISOString(),
              ...metrics
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error sending realtime data:', error);
          }
        };

        // Send initial data
        sendData();

        // Send updates every 5 seconds
        const interval = setInterval(sendData, 5000);

        // Clean up on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Error setting up realtime metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
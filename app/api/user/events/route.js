import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel hobby plan

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const headersList = headers();
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const writeEvent = async (data) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch (error) {
        console.error('Error writing SSE event:', error);
        throw error;
      }
    };

    // Send initial connection message
    await writeEvent({
      type: 'CONNECTED',
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });

    // Set up heartbeat interval (every 15 seconds)
    const heartbeatInterval = setInterval(async () => {
      try {
        await writeEvent({
          type: 'HEARTBEAT',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
        clearInterval(heartbeatInterval);
        writer.close();
      }
    }, 15000);

    // Set up connection timeout (55 seconds to ensure we close before maxDuration)
    const connectionTimeout = setTimeout(() => {
      clearInterval(heartbeatInterval);
      writer.close();
    }, 55000);

    // Clean up on disconnect
    request.signal.addEventListener('abort', () => {
      clearInterval(heartbeatInterval);
      clearTimeout(connectionTimeout);
      writer.close();
    });

    return new Response(stream.readable, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('SSE Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel hobby plan

// Keep track of active connections and their last events
const activeConnections = new Map();
const eventBuffer = new Map();
const EVENT_BUFFER_SIZE = 100;

function addToEventBuffer(userId, event) {
  if (!eventBuffer.has(userId)) {
    eventBuffer.set(userId, []);
  }
  const buffer = eventBuffer.get(userId);
  buffer.push(event);
  if (buffer.length > EVENT_BUFFER_SIZE) {
    buffer.shift();
  }
}

function getEventsAfter(userId, lastEventId) {
  if (!eventBuffer.has(userId)) return [];
  const buffer = eventBuffer.get(userId);
  if (!lastEventId) return [];
  const lastEventIndex = buffer.findIndex(event => event.id === lastEventId);
  return lastEventIndex >= 0 ? buffer.slice(lastEventIndex + 1) : [];
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const headersList = headers();
    const lastEventId = request.nextUrl.searchParams.get('lastEventId');
    const connectionId = request.nextUrl.searchParams.get('connectionId');

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
        // Add event ID and timestamp if not present
        const eventToSend = {
          ...data,
          id: data.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        // Store event in buffer for reconnection
        if (data.type !== 'HEARTBEAT' && data.type !== 'CONNECTED') {
          addToEventBuffer(userId, eventToSend);
        }
        
        await writer.write(encoder.encode(`data: ${JSON.stringify(eventToSend)}\n\n`));
      } catch (error) {
        console.error('Error writing SSE event:', error);
        throw error;
      }
    };

    // Track this connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(connectionId);

    // Send initial connection message
    await writeEvent({
      type: 'CONNECTED',
      userId: userId,
      connectionId: connectionId,
      timestamp: new Date().toISOString()
    });

    // Send missed events if any
    if (lastEventId) {
      const missedEvents = getEventsAfter(userId, lastEventId);
      for (const event of missedEvents) {
        await writeEvent(event);
      }
    }

    // Set up heartbeat interval (every 30 seconds to match client)
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
    }, 30000);

    // Set up connection timeout (55 seconds to ensure we close before maxDuration)
    const connectionTimeout = setTimeout(() => {
      clearInterval(heartbeatInterval);
      writer.close();
    }, 55000);

    // Clean up on disconnect
    request.signal.addEventListener('abort', () => {
      clearInterval(heartbeatInterval);
      clearTimeout(connectionTimeout);
      if (activeConnections.has(userId)) {
        activeConnections.get(userId).delete(connectionId);
        if (activeConnections.get(userId).size === 0) {
          activeConnections.delete(userId);
        }
      }
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
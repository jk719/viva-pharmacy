import { headers } from 'next/headers';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// Track active connections per user
const activeConnections = new Map();

export async function GET(request) {
    try {
        const token = await getToken({ req: request });
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }), 
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.indexOf('vivabucks') + 1];
        const clientConnectionId = url.searchParams.get('connectionId');
        
        if (!userId || userId !== token.id) {
            return new Response(
                JSON.stringify({ error: 'Invalid user ID' }), 
                { status: 403 }
            );
        }

        // Check for existing connection
        if (activeConnections.has(userId)) {
            const existingConnection = activeConnections.get(userId);
            console.log(`🔄 SSE: Closing existing connection ${existingConnection.connectionId} for user ${userId}`);
            existingConnection.controller.close();
            existingConnection.cleanup();
            activeConnections.delete(userId);
        }

        const connectionId = clientConnectionId || `${userId}-${Date.now()}`;
        console.log(`🔌 SSE: New connection ${connectionId} for user ${userId}`);

        let isConnectionActive = true;

        return new Response(
            new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();

                    // Send initial connection confirmation
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ 
                            type: 'CONNECTED', 
                            connectionId,
                            timestamp: new Date().toISOString()
                        })}\n\n`)
                    );

                    const sendHeartbeat = () => {
                        if (isConnectionActive && !controller.closed) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ 
                                    type: 'HEARTBEAT',
                                    connectionId,
                                    timestamp: new Date().toISOString()
                                })}\n\n`)
                            );
                        }
                    };
                    
                    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

                    const eventListener = (data) => {
                        if (isConnectionActive && !controller.closed) {
                            try {
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({
                                        ...data,
                                        connectionId,
                                        timestamp: new Date().toISOString()
                                    })}\n\n`)
                                );
                            } catch (error) {
                                console.error(`SSE: Error sending event on connection ${connectionId}:`, error);
                            }
                        }
                    };

                    console.log(`🎯 SSE: Adding event listeners for connection ${connectionId}`);
                    eventEmitter.on(Events.POINTS_UPDATED, eventListener);
                    eventEmitter.on(Events.REWARD_REDEEMED, eventListener);
                    eventEmitter.on(Events.REWARD_RESTORED, eventListener);

                    // Store connection cleanup
                    const cleanup = () => {
                        isConnectionActive = false;
                        clearInterval(heartbeatInterval);
                        console.log(`🔌 SSE: Closing connection ${connectionId}`);
                        eventEmitter.off(Events.POINTS_UPDATED, eventListener);
                        eventEmitter.off(Events.REWARD_REDEEMED, eventListener);
                        eventEmitter.off(Events.REWARD_RESTORED, eventListener);
                        activeConnections.delete(userId);
                    };

                    // Store active connection
                    activeConnections.set(userId, {
                        connectionId,
                        controller,
                        cleanup
                    });

                    // Cleanup on disconnect
                    request.signal.addEventListener('abort', cleanup);
                }
            }),
            {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive'
                }
            }
        );
    } catch (error) {
        console.error('SSE Route Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }), 
            { status: 500 }
        );
    }
} 
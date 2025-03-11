import { headers } from 'next/headers';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

// Track active connections per user
const activeConnections = new Map();

// Add connection recovery mechanism
const reconnectionAttempts = new Map();

export async function GET(request) {
    try {
        const token = await getToken({ req: request });
        if (!token?.id) {
            console.log('SSE: Unauthorized - No valid token');
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }), 
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const userId = url.pathname.split('/')[4];
        const connectionId = url.searchParams.get('connectionId');
        
        if (!userId || userId !== token.id) {
            console.log('SSE: User ID mismatch');
            return new Response(
                JSON.stringify({ error: 'Invalid user ID' }), 
                { status: 403 }
            );
        }

        // Check SSE-specific rate limit
        const rateLimitCheck = await rateLimit.check(request, 5, 300000, 'sse');
        if (!rateLimitCheck.success) {
            return new Response(JSON.stringify({
                error: 'Too Many Requests',
                retryAfter: rateLimitCheck.retryAfter
            }), {
                status: 429,
                headers: {
                    'Retry-After': String(rateLimitCheck.retryAfter),
                    'Content-Type': 'application/json'
                }
            });
        }

        // Handle existing connection
        if (activeConnections.has(userId)) {
            const existing = activeConnections.get(userId);
            existing.cleanup?.();
            await new Promise(resolve => setTimeout(resolve, 1000));
            activeConnections.delete(userId);
        }

        let isConnectionActive = true;
        const heartbeatInterval = 30000;
        let heartbeatTimer = null;
        
        // Create stream first
        const stream = new ReadableStream({
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

                // Setup heartbeat
                heartbeatTimer = setInterval(() => {
                    if (isConnectionActive && !controller.closed) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ 
                                type: Events.HEARTBEAT,
                                connectionId,
                                timestamp: new Date().toISOString()
                            })}\n\n`)
                        );
                    }
                }, heartbeatInterval);

                // Setup event listeners
                const eventListener = (event) => {
                    if (isConnectionActive && !controller.closed) {
                        try {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({
                                    ...event,
                                    connectionId,
                                    timestamp: new Date().toISOString()
                                })}\n\n`)
                            );
                        } catch (error) {
                            console.error(`SSE: Error sending event on connection ${connectionId}:`, error);
                        }
                    }
                };

                // Add event listeners
                eventEmitter.on(Events.POINTS_UPDATED, eventListener);
                eventEmitter.on(Events.REWARD_REDEEMED, eventListener);
                eventEmitter.on(Events.REWARD_RESTORED, eventListener);
                eventEmitter.on(Events.PAYMENT_COMPLETED, eventListener);

                // Store cleanup function
                const cleanup = () => {
                    isConnectionActive = false;
                    if (heartbeatTimer) {
                        clearInterval(heartbeatTimer);
                        heartbeatTimer = null;
                    }
                    eventEmitter.off(Events.POINTS_UPDATED, eventListener);
                    eventEmitter.off(Events.REWARD_REDEEMED, eventListener);
                    eventEmitter.off(Events.REWARD_RESTORED, eventListener);
                    eventEmitter.off(Events.PAYMENT_COMPLETED, eventListener);
                    activeConnections.delete(userId);
                    console.log(`🔌 SSE: Closing connection ${connectionId}`);
                };

                // Store connection info
                activeConnections.set(userId, {
                    connectionId,
                    controller,
                    cleanup
                });

                // Add abort handler
                request.signal.addEventListener('abort', cleanup);
            }
        });

        // Create and return response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive'
            }
        });

    } catch (error) {
        console.error('SSE Route Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }), 
            { status: 500 }
        );
    }
} 
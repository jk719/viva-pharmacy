import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export const runtime = 'edge';

export async function GET(request) {
    try {
        // Parse URL and get user ID
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.indexOf('vivabucks') + 1];
        
        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'User ID is required' }), 
                { status: 400 }
            );
        }

        // Set up encoder and stream variables
        const encoder = new TextEncoder();
        let counter = 0;
        let keepAliveInterval;
        let eventListener;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;

        const stream = new ReadableStream({
            start(controller) {
                // Send initial messages with shorter retry interval
                controller.enqueue(encoder.encode(`: connection established\n`));
                controller.enqueue(encoder.encode(`retry: 3000\n`)); // 3 second retry
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ 
                        type: 'connected', 
                        userId,
                        timestamp: Date.now() 
                    })}\n\n`)
                );

                // Enhanced event listener with error handling
                eventListener = (data) => {
                    try {
                        const eventData = {
                            type: 'POINTS_UPDATED',
                            userId,
                            data,
                            timestamp: Date.now()
                        };
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
                        );
                        // Reset reconnect attempts on successful event
                        reconnectAttempts = 0;
                    } catch (error) {
                        console.error('Error sending event:', error);
                        handleError(error);
                    }
                };

                // Register event listeners with error boundaries
                const safeAddListener = (event) => {
                    try {
                        eventEmitter.on(event, eventListener);
                    } catch (error) {
                        console.error(`Error adding listener for ${event}:`, error);
                    }
                };

                safeAddListener(Events.POINTS_UPDATED);
                safeAddListener(Events.REWARD_REDEEMED);
                safeAddListener(Events.REWARD_RESTORED);

                // More frequent keep-alive pings
                keepAliveInterval = setInterval(() => {
                    if (counter > 14400) { // 4 hour limit
                        cleanup('Time limit reached');
                        controller.close();
                        return;
                    }
                    
                    try {
                        controller.enqueue(
                            encoder.encode(`: keepalive ${counter++}\n\n`)
                        );
                    } catch (e) {
                        console.error('SSE Ping Error:', e);
                        handleError(e);
                    }
                }, 10000); // 10-second ping interval

                // Enhanced error handling
                const handleError = (error) => {
                    reconnectAttempts++;
                    console.error(`SSE Error (attempt ${reconnectAttempts}):`, error);
                    
                    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                        cleanup('Max reconnection attempts reached');
                        controller.error(error);
                    } else {
                        // Try to recover
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ 
                                type: 'error', 
                                message: 'Attempting to reconnect...',
                                attempt: reconnectAttempts 
                            })}\n\n`)
                        );
                    }
                };

                // Enhanced cleanup function
                const cleanup = (reason = 'unknown') => {
                    console.log(`SSE Connection closed: ${reason}`);
                    clearInterval(keepAliveInterval);
                    
                    const removeListener = (event) => {
                        try {
                            eventEmitter.off(event, eventListener);
                        } catch (error) {
                            console.error(`Error removing listener for ${event}:`, error);
                        }
                    };

                    removeListener(Events.POINTS_UPDATED);
                    removeListener(Events.REWARD_REDEEMED);
                    removeListener(Events.REWARD_RESTORED);
                };

                // Handle client disconnection
                request.signal.addEventListener('abort', () => {
                    cleanup('Client disconnected');
                });
            },
            cancel() {
                console.log('Stream cancelled by client');
                clearInterval(keepAliveInterval);
                if (eventListener) {
                    eventEmitter.off(Events.POINTS_UPDATED, eventListener);
                    eventEmitter.off(Events.REWARD_REDEEMED, eventListener);
                    eventEmitter.off(Events.REWARD_RESTORED, eventListener);
                }
            }
        });

        // Enhanced response headers
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
                'Keep-Alive': 'timeout=300, max=1000',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        console.error('SSE Route Error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message,
                timestamp: Date.now()
            }), 
            { status: 500 }
        );
    }
} 
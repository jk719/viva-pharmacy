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

        return new Response(
            new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    let counter = 0;
                    let keepAliveInterval = null;
                    let reconnectAttempts = 0;
                    const MAX_RECONNECT_ATTEMPTS = 5;
                    const activeListeners = new Set();

                    const eventListener = (data) => {
                        try {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                            );
                        } catch (error) {
                            handleError(error);
                        }
                    };

                    const safeAddListener = (event) => {
                        try {
                            eventEmitter.on(event, eventListener);
                            activeListeners.add(event);
                        } catch (error) {
                            console.error(`Error adding listener for ${event}:`, error);
                        }
                    };

                    // Enhanced cleanup function
                    const cleanup = (reason = 'unknown') => {
                        console.log(`SSE Connection closed: ${reason}`);
                        
                        try {
                            if (keepAliveInterval) {
                                clearInterval(keepAliveInterval);
                                keepAliveInterval = null;
                            }

                            // Remove all active listeners
                            activeListeners.forEach(event => {
                                try {
                                    eventEmitter.off(event, eventListener);
                                } catch (error) {
                                    console.error(`Error removing listener for ${event}:`, error);
                                }
                            });
                            activeListeners.clear();
                        } catch (error) {
                            console.error('Error during cleanup:', error);
                        }
                    };

                    // Add listeners and track them
                    safeAddListener(Events.POINTS_UPDATED);
                    safeAddListener(Events.REWARD_REDEEMED);
                    safeAddListener(Events.REWARD_RESTORED);

                    // Keep-alive with error handling
                    keepAliveInterval = setInterval(() => {
                        try {
                            if (counter > 14400) { // 4 hour limit
                                cleanup('Time limit reached');
                                controller.close();
                                return;
                            }
                            
                            controller.enqueue(
                                encoder.encode(`: keepalive ${counter++}\n\n`)
                            );
                        } catch (error) {
                            console.error('SSE Ping Error:', error);
                            handleError(error);
                        }
                    }, 10000);

                    // Enhanced error handling
                    const handleError = (error) => {
                        reconnectAttempts++;
                        console.error(`SSE Error (attempt ${reconnectAttempts}):`, error);
                        
                        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                            cleanup('Max reconnection attempts reached');
                            controller.error(error);
                        } else {
                            try {
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({ 
                                        type: 'error', 
                                        message: 'Attempting to reconnect...',
                                        attempt: reconnectAttempts 
                                    })}\n\n`)
                                );
                            } catch (enqueueError) {
                                console.error('Error sending reconnect message:', enqueueError);
                                cleanup('Enqueue error during reconnect');
                                controller.error(enqueueError);
                            }
                        }
                    };

                    // Handle client disconnection
                    request.signal.addEventListener('abort', () => {
                        cleanup('Client disconnected');
                    });
                }
            }),
            {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            }
        );
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
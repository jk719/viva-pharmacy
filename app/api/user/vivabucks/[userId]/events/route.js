import { headers } from 'next/headers';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

export async function GET(request) {
    try {
        // Get token from request
        const token = await getToken({ req: request });
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }), 
                { status: 401 }
            );
        }

        // Parse URL and get user ID
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.indexOf('vivabucks') + 1];
        
        // Validate user ID matches token
        if (!userId || userId !== token.id) {
            return new Response(
                JSON.stringify({ error: 'Invalid user ID' }), 
                { status: 403 }
            );
        }

        console.log(`🔌 SSE: Establishing connection for user ${userId}`);

        return new Response(
            new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    let counter = 0;
                    let keepAliveInterval = null;

                    // Send initial connection message
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            type: 'CONNECTED',
                            timestamp: new Date().toISOString()
                        })}\n\n`)
                    );

                    const eventListener = (data) => {
                        console.log(`📨 SSE: Sending event to user ${userId}:`, data);
                        try {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({
                                    ...data,
                                    timestamp: new Date().toISOString()
                                })}\n\n`)
                            );
                        } catch (error) {
                            console.error('SSE: Error sending event:', error);
                        }
                    };

                    // Add event listeners
                    console.log(`🎯 SSE: Adding event listeners for user ${userId}`);
                    eventEmitter.on(Events.POINTS_UPDATED, eventListener);
                    eventEmitter.on(Events.REWARD_REDEEMED, eventListener);
                    eventEmitter.on(Events.REWARD_RESTORED, eventListener);

                    // Keep-alive
                    keepAliveInterval = setInterval(() => {
                        controller.enqueue(encoder.encode(`: keepalive ${counter++}\n\n`));
                    }, 30000);

                    // Cleanup on disconnect
                    request.signal.addEventListener('abort', () => {
                        console.log(`🔌 SSE: Connection closed for user ${userId}`);
                        clearInterval(keepAliveInterval);
                        eventEmitter.off(Events.POINTS_UPDATED, eventListener);
                        eventEmitter.off(Events.REWARD_REDEEMED, eventListener);
                        eventEmitter.off(Events.REWARD_RESTORED, eventListener);
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
            JSON.stringify({ error: 'Internal Server Error' }), 
            { status: 500 }
        );
    }
} 
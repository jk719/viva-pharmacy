import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export const runtime = 'edge';

export async function POST(request, { params }) {
    try {
        // Verify authentication
        const token = await getToken({ req: request });
        if (!token) {
            console.log('❌ SSE Test: Unauthorized request');
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            );
        }

        // Validate user ID
        const { userId } = params;
        if (!userId || userId !== token.id) {
            console.log('❌ SSE Test: Invalid user ID');
            return NextResponse.json(
                { error: 'Invalid user ID' }, 
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        
        // Create test event data
        const eventData = {
            type: 'POINTS_UPDATED',
            userId: userId,
            points: 100,
            rewardPoints: 100,
            cumulativePoints: 100,
            timestamp: new Date().toISOString(),
            source: 'test'
        };

        console.log('🔔 SSE Test: Emitting event:', eventData);
        
        // Emit the event through the eventEmitter
        eventEmitter.emit(Events.POINTS_UPDATED, eventData);
        
        console.log('✅ SSE Test: Event emitted');

        // Return success response
        return NextResponse.json({ 
            success: true, 
            message: 'Test event sent successfully',
            data: eventData
        });

    } catch (error) {
        console.error('❌ SSE Test Error:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            message: error.message 
        }, { 
            status: 500 
        });
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';

// ABA PayWay Callback / Webhook Handler
// This URL should be configured in the ABA Merchant Portal as "Push Notification URL"
export async function POST(req: NextRequest) {
    try {
        // 1. Get the data from ABA
        // ABA sends form-data or JSON depending on configuration
        // Most common is form-data for push notice
        const formData = await req.formData();
        const tran_id = formData.get('tran_id') as string;
        const status = formData.get('status') as string;
        const _hash = formData.get('hash') as string;

        console.log(`Received ABA Callback for Order: ${tran_id}, Status: ${status}`);

        // 2. Security: Verify the hash (Optional for Sandbox, required for Production)
        // For simplicity in this example, we check the status directly
        // In production, you'd re-calculate the hash using your public key/apiKey to verify authenticity

        if (status === '0' || status === 'OK' || status === 'APPR') {
            // 3. Update Order Status in Firestore
            if (tran_id) {
                await updateOrderStatus(tran_id, 'paid');
                return new Response('OK', { status: 200 });
            }
        }

        return new Response('Invalid Status', { status: 400 });

    } catch (error: unknown) {
        console.error("Callback Error:", error);
        // Still return 200 to ABA to avoid infinite retries if the format is wrong
        // but log the error locally
        return new Response('Internal error', { status: 200 });
    }
}

// To support testing via GET (manual confirmation simulation)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const _status = searchParams.get('status') || '0';

    if (orderId) {
        await updateOrderStatus(orderId, 'paid');
        return NextResponse.json({ message: `Order ${orderId} manually confirmed (SIMULATED)` });
    }

    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
}

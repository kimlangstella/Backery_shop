import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ABA PayWay Signature Generator (RSA)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            privateKey, // Passed from client (fetched from secure settings)
            req_time,
            merchant_id,
            tran_id,
            amount,
            items,
            shipping,
            tax,
            type,
            payment_option,
            return_url,
            cancel_url,
            continue_success_url,
            return_params
        } = body;

        if (!privateKey) {
            return NextResponse.json({ error: "Private Key is required" }, { status: 400 });
        }

        // Standardize Private Key format (ensure headers exist)
        let formattedKey = privateKey.trim();
        if (!formattedKey.includes("-----BEGIN PRIVATE KEY-----")) {
            // If it's a raw base64 string, wrap it
            formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
        }

        // Concatenate strings for signing (precise order matters for ABA)
        const data =
            (req_time || "") +
            (merchant_id || "") +
            (tran_id || "") +
            (amount || "") +
            (items || "") +
            (shipping || "") +
            (tax || "") +
            (type || "") +
            (payment_option || "") +
            (return_url || "") +
            (cancel_url || "") +
            (continue_success_url || "") +
            (return_params || "");

        // RSA Sign with Private Key
        // ABA typically uses SHA-512 or SHA256 for the sign algorithm
        const sign = crypto.createSign('RSA-SHA512');
        sign.update(data);
        sign.end();

        // Ensure private key is properly formatted with headers if not already
        const hash = sign.sign(formattedKey, 'base64');

        return NextResponse.json({ hash });
    } catch (error: any) {
        console.error("Signature Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

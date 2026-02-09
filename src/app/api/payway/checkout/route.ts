import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { orderId, amount } = await req.json();

        if (!orderId || typeof amount !== "number") {
            return NextResponse.json(
                { error: "Invalid order data" },
                { status: 400 }
            );
        }

        const merchantId = process.env.ABA_MERCHANT_ID;
        const privateKey = process.env.ABA_PRIVATE_KEY;
        const checkoutUrl = process.env.ABA_CHECKOUT_URL;

        // Validate required credentials
        if (!merchantId || !privateKey || !checkoutUrl) {
            console.error("❌ Missing ABA PayWay credentials!");
            console.error("Merchant ID:", merchantId ? "✓" : "❌");
            console.error("Private Key:", privateKey ? "✓" : "❌");
            console.error("Checkout URL:", checkoutUrl ? "✓" : "❌");

            return NextResponse.json(
                { error: "ABA PayWay not configured. Please contact administrator." },
                { status: 500 }
            );
        }

        const reqTime = Math.floor(Date.now() / 1000).toString();

        const payload: Record<string, string> = {
            req_time: reqTime,
            merchant_id: merchantId,
            tran_id: orderId,
            amount: amount.toFixed(2),
            type: "purchase",
            payment_option: "abapay",
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout?status=success&id=${orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout?status=cancel`,
            currency: "USD"
        };

        // 🔐 Generate RSA-SHA512 Signature (NOT HMAC!)
        // Hash string construction per ABA PayWay specification
        const hashString =
            payload.req_time +
            payload.merchant_id +
            payload.tran_id +
            payload.amount +
            payload.type +
            payload.payment_option +
            payload.return_url +
            payload.cancel_url +
            payload.currency;

        console.log("📋 Merchant ID:", merchantId);
        console.log("🔑 Hash String (before signing):", hashString);

        // Create RSA-SHA512 signature using private key
        const sign = crypto.createSign("RSA-SHA512");
        sign.update(hashString);
        sign.end();

        // Sign and encode as base64
        const hash = sign.sign(privateKey, "base64");

        console.log("🔐 Generated RSA Signature (base64):", hash.substring(0, 50) + "...");

        payload.hash = hash;

        return NextResponse.json({
            checkoutUrl,
            payload
        });

    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("❌ ABA PayWay Error:", error);
        return NextResponse.json(
            { error: error.message || "Checkout failed" },
            { status: 500 }
        );
    }
}

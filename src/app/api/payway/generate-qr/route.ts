import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read ONLY business data from frontend
    const { orderId, amount } = await req.json();

    if (!orderId || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    // 2️⃣ Load ABA config from ENV (BACKEND ONLY)
    const MERCHANT_ID = process.env.ABA_MERCHANT_ID!;
    const PRIVATE_KEY = process.env.ABA_RSA_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const ABA_QR_API_URL =
      "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr";

    const abaBody = {
      merchantId: MERCHANT_ID,
      transactionId: orderId,
      amount: amount, // MUST be number
      currency: "USD",
      paymentOption: "ABAPAY",
      returnUrl: "http://localhost:3000/api/payway/callback",
      cancelUrl: "http://localhost:3000/checkout?status=cancel"
    };

    console.log("📦 ABA BODY:", abaBody);

    // 4️⃣ RSA-SHA256 SIGNATURE
    const bodyString = JSON.stringify(abaBody);

    const signature = crypto.sign(
      "RSA-SHA256",
      Buffer.from(bodyString),
      {
        key: PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING
      }
    ).toString("base64");

    // 5️⃣ Call ABA QR API (CORRECT DOMAIN)
    const response = await fetch(ABA_QR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Signature": signature
      },
      body: bodyString
    });

    const text = await response.text();
    console.log("📥 ABA RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "ABA returned non-JSON response" },
        { status: 500 }
      );
    }

    // 6️⃣ ABA error handling
    if (!response.ok || data.status?.code !== 0) {
      return NextResponse.json(
        { error: data.status?.message || "QR generation failed" },
        { status: 400 }
      );
    }

    // 7️⃣ Return QR to frontend
    return NextResponse.json({
      qrCode: data.qrCode,
      transactionId: orderId,
      amount
    });

  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("💥 Generate QR Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

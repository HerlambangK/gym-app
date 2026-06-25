import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(request: Request) {
  const payload = await request.json();
  const signatureValid = verifyMidtransSignature(payload);

  if (!signatureValid) {
    return Response.json(
      { received: false, error: "Invalid Midtrans signature" },
      { status: 401 },
    );
  }

  return Response.json({
    received: true,
    orderId: payload.order_id ?? null,
    transactionStatus: payload.transaction_status ?? "settlement",
    nextAction: "update_payment_activate_subscription",
  });
}

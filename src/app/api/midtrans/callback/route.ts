export async function POST(request: Request) {
  const payload = await request.json();

  return Response.json({
    received: true,
    orderId: payload.order_id ?? null,
    transactionStatus: payload.transaction_status ?? "settlement",
    nextAction: "validate_signature_update_payment_activate_subscription",
  });
}


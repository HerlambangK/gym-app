import crypto from "node:crypto";

type MidtransItem = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

type MidtransCustomer = {
  first_name: string;
  email?: string;
  phone?: string;
};

export type CreateSnapTransactionInput = {
  orderId: string;
  grossAmount: number;
  customer: MidtransCustomer;
  items: MidtransItem[];
};

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;

export const midtransConfig = {
  merchantId: process.env.MIDTRANS_MERCHANT_ID,
  clientKey:
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
    process.env.MIDTRANS_CLIENT_KEY,
  snapBaseUrl: isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com",
  apiBaseUrl: isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com",
};

function getServerAuthHeader() {
  if (!serverKey) {
    throw new Error("Missing MIDTRANS_SERVER_KEY");
  }

  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export async function createSnapTransaction(input: CreateSnapTransactionInput) {
  const response = await fetch(`${midtransConfig.snapBaseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: getServerAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      customer_details: input.customer,
      item_details: input.items,
      enabled_payments: ["bank_transfer", "qris", "gopay", "shopeepay"],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
    };
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
}

export function verifyMidtransSignature(payload: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}) {
  if (!serverKey) {
    throw new Error("Missing MIDTRANS_SERVER_KEY");
  }

  if (
    !payload.order_id ||
    !payload.status_code ||
    !payload.gross_amount ||
    !payload.signature_key
  ) {
    return false;
  }

  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const signature = crypto.createHash("sha512").update(raw).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(payload.signature_key),
  );
}


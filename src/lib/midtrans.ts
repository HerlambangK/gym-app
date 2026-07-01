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

type CreateMidtransTransactionInput = {
  orderId: string;
  grossAmount: number;
  customer: MidtransCustomer;
  items: MidtransItem[];
};

export type MidtransPaymentMethod =
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "permata_va"
  | "qris";

export type CreateCoreChargeInput = CreateMidtransTransactionInput & {
  paymentMethod: MidtransPaymentMethod;
};

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;

export const midtransConfig = {
  merchantId: process.env.MIDTRANS_MERCHANT_ID,
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

function getCorePaymentPayload(paymentMethod: MidtransPaymentMethod) {
  if (paymentMethod === "qris") {
    return {
      payment_type: "qris",
      qris: {
        acquirer: "gopay",
      },
    };
  }

  const bank = paymentMethod.replace("_va", "");
  return {
    payment_type: "bank_transfer",
    bank_transfer: {
      bank,
    },
  };
}

export async function createCoreCharge(input: CreateCoreChargeInput) {
  const response = await fetch(`${midtransConfig.apiBaseUrl}/v2/charge`, {
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
      ...getCorePaymentPayload(input.paymentMethod),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: data as Record<string, unknown>,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as Record<string, unknown>,
  };
}

export async function getTransactionStatus(orderId: string) {
  const response = await fetch(`${midtransConfig.apiBaseUrl}/v2/${encodeURIComponent(orderId)}/status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: getServerAuthHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: data as Record<string, unknown>,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as Record<string, unknown>,
  };
}

export async function cancelTransaction(orderId: string) {
  const response = await fetch(`${midtransConfig.apiBaseUrl}/v2/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: getServerAuthHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: data as Record<string, unknown>,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as Record<string, unknown>,
  };
}

export function getPaymentLifecycle(payload: {
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  settlement_time?: string;
}) {
  const transactionStatus = payload.transaction_status?.toLowerCase();
  const fraudStatus = payload.fraud_status?.toLowerCase();
  const hasSettlementProof = payload.status_code === "200" && Boolean(payload.settlement_time);

  const isSuccess =
    transactionStatus === "settlement" ||
    hasSettlementProof ||
    (transactionStatus === "capture" && fraudStatus !== "challenge" && fraudStatus !== "deny");
  const isFailure =
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire" ||
    transactionStatus === "failure";
  const failureInvoiceStatus =
    transactionStatus === "expire" ? "EXPIRED" :
      transactionStatus === "cancel" ? "CANCELLED" :
        "FAILED";

  return {
    isSuccess,
    isFailure,
    paymentStatus: isSuccess ? "PAID" : isFailure ? "FAILED" : "PENDING",
    invoiceStatus: isSuccess ? "PAID" : isFailure ? failureInvoiceStatus : "PENDING",
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

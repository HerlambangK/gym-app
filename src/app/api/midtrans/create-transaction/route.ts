import { z } from "zod";
import { createSnapTransaction } from "@/lib/midtrans";

const createTransactionSchema = z.object({
  orderId: z.string().min(6).optional(),
  planCode: z.string().min(2),
  planName: z.string().min(2),
  amount: z.number().int().positive(),
  customerName: z.string().min(2),
  customerEmail: z.email().optional(),
  customerPhone: z.string().min(8).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orderId =
    parsed.data.orderId ??
    `GYM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const result = await createSnapTransaction({
    orderId,
    grossAmount: parsed.data.amount,
    customer: {
      first_name: parsed.data.customerName,
      email: parsed.data.customerEmail,
      phone: parsed.data.customerPhone,
    },
    items: [
      {
        id: parsed.data.planCode,
        name: parsed.data.planName,
        price: parsed.data.amount,
        quantity: 1,
      },
    ],
  });

  return Response.json(
    {
      orderId,
      midtrans: result.data,
    },
    { status: result.ok ? 200 : result.status },
  );
}


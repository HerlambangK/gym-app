import { eq, desc, gte } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { expenses, users } from "@/db/schema"

export async function getExpenses(limit = 50) {
  const rows = await db
    .select()
    .from(expenses)
    .leftJoin(users, eq(expenses.created_by, users.id))
    .orderBy(desc(expenses.expense_date))
    .limit(limit)

  return rows.map((row) => ({
    ...row.expenses,
    users: row.users ? { name: row.users.name } : null,
  }))
}

export async function createExpense(input: {
  category: string
  amount: number
  description?: string
  expenseDate: string
  paymentMethod?: string
  createdBy: string
}) {
  const [data] = await db
    .insert(expenses)
    .values({
      category: input.category,
      amount: input.amount,
      description: input.description || null,
      expense_date: input.expenseDate,
      payment_method: input.paymentMethod || null,
      created_by: input.createdBy,
    })
    .returning()
  return data
}

export async function getTotalExpensesThisMonth() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const data = await db
    .select({ amount: expenses.amount })
    .from(expenses)
    .where(gte(expenses.expense_date, startOfMonth.toISOString().split("T")[0]))

  return data.reduce((sum, exp) => sum + Number(exp.amount), 0)
}

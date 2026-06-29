import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getExpenses(limit = 50) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("expenses")
    .select("*, users(name)")
    .order("expense_date", { ascending: false })
    .limit(limit)
  return data || []
}

export async function createExpense(input: {
  category: string
  amount: number
  description?: string
  expenseDate: string
  paymentMethod?: string
  createdBy: string
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      category: input.category,
      amount: input.amount,
      description: input.description || null,
      expense_date: input.expenseDate,
      payment_method: input.paymentMethod || null,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTotalExpensesThisMonth() {
  const supabase = await createAdminSupabaseClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from("expenses")
    .select("amount")
    .gte("created_at", startOfMonth.toISOString())

  return data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
}

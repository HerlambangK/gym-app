import { sql } from "drizzle-orm"
import {
  pgTable, pgEnum, uuid, text, integer, boolean, jsonb, customType, index,
} from "drizzle-orm/pg-core"

const numericAsNumber = customType<{ data: number; driverData: string }>({
  dataType() {
    return "numeric"
  },
  fromDriver(value: string): number {
    return parseFloat(value)
  },
})

export const userStatus = pgEnum("user_status", ["ACTIVE", "INACTIVE", "BANNED"])
export const memberTypeEnum = pgEnum("member_type", ["DAILY", "SUBSCRIPTION", "PREMIUM", "TRIAL"])
export const memberStatusEnum = pgEnum("member_status", ["ACTIVE", "INACTIVE", "FROZEN", "BANNED"])
export const planTypeEnum = pgEnum("plan_type", ["DAILY", "MONTHLY", "TRIAL"])
export const subscriptionStatusEnum = pgEnum("subscription_status", ["PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED", "FROZEN"])
export const invoiceStatusEnum = pgEnum("invoice_status", ["PENDING", "PAID", "EXPIRED", "FAILED", "CANCELLED", "REFUNDED"])
export const attendanceStatusEnum = pgEnum("attendance_status", ["CHECKED_IN", "CHECKED_OUT", "AUTO_CHECKED_OUT", "FAILED"])
export const blogAccessTypeEnum = pgEnum("blog_access_type", ["PUBLIC", "SUBSCRIBER_ONLY"])
export const blogStatusEnum = pgEnum("blog_status", ["DRAFT", "PUBLISHED", "ARCHIVED"])

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text(),
  password_hash: text(),
  status: userStatus().notNull().default("ACTIVE"),
  verification_sent_at: text("verification_sent_at"),
  created_at: text("created_at").notNull().default(sql`now()`),
  updated_at: text("updated_at").notNull().default(sql`now()`),
})

export const roles = pgTable("roles", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  code: text().notNull().unique(),
  description: text(),
  created_at: text("created_at").notNull().default(sql`now()`),
  updated_at: text("updated_at").notNull().default(sql`now()`),
})

export const permissions = pgTable("permissions", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  created_at: text("created_at").notNull().default(sql`now()`),
  updated_at: text("updated_at").notNull().default(sql`now()`),
})

export const role_permissions = pgTable("role_permissions", {
  role_id: uuid().notNull().references(() => roles.id, { onDelete: "cascade" }),
  permission_id: uuid().notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [{
  pk: { columns: [t.role_id, t.permission_id] },
}])

export const user_roles = pgTable("user_roles", {
  user_id: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
  role_id: uuid().notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (t) => [{
  pk: { columns: [t.user_id, t.role_id] },
  idx_user_roles_user_id: index("idx_user_roles_user_id").on(t.user_id),
}])

export const branches = pgTable("branches", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  address: text().notNull(),
  latitude: numericAsNumber({ precision: 10, scale: 7 }).notNull(),
  longitude: numericAsNumber({ precision: 10, scale: 7 }).notNull(),
  radius_meters: integer().notNull().default(100),
  open_time: text().notNull().default("06:00"),
  close_time: text().notNull().default("22:00"),
  phone: text(),
  email: text(),
  is_active: boolean().notNull().default(true),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const members = pgTable("members", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
  member_code: text().notNull().unique(),
  branch_id: uuid().references(() => branches.id),
  member_type: memberTypeEnum().notNull(),
  status: memberStatusEnum().notNull().default("ACTIVE"),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_members_user_id: index("idx_members_user_id").on(t.user_id),
}])

export const membership_plans = pgTable("membership_plans", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  code: text().notNull().unique(),
  type: planTypeEnum().notNull(),
  duration_days: integer().notNull(),
  price: numericAsNumber({ precision: 14, scale: 2 }).notNull(),
  description: text(),
  is_active: boolean().notNull().default(true),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const features = pgTable("features", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  category: text(),
  is_premium: boolean().notNull().default(false),
  is_active: boolean().notNull().default(true),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const plan_features = pgTable("plan_features", {
  id: uuid().primaryKey().defaultRandom(),
  plan_id: uuid().notNull().references(() => membership_plans.id, { onDelete: "cascade" }),
  feature_id: uuid().notNull().references(() => features.id, { onDelete: "cascade" }),
  is_enabled: boolean().notNull().default(true),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  unique_plan_feature: { columns: [t.plan_id, t.feature_id] },
}])

export const invoices = pgTable("invoices", {
  id: uuid().primaryKey().defaultRandom(),
  invoice_number: text().notNull().unique(),
  member_id: uuid().notNull().references(() => members.id),
  plan_id: uuid().notNull().references(() => membership_plans.id),
  amount: numericAsNumber({ precision: 14, scale: 2 }).notNull(),
  status: invoiceStatusEnum().notNull().default("PENDING"),
  expired_at: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_invoices_member_id: index("idx_invoices_member_id").on(t.member_id),
}])

export const subscriptions = pgTable("subscriptions", {
  id: uuid().primaryKey().defaultRandom(),
  member_id: uuid().notNull().references(() => members.id),
  plan_id: uuid().notNull().references(() => membership_plans.id),
  invoice_id: uuid().references(() => invoices.id),
  start_date: text().notNull(),
  end_date: text().notNull(),
  status: subscriptionStatusEnum().notNull().default("PENDING_PAYMENT"),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_subscriptions_member_status: index("idx_subscriptions_member_status").on(t.member_id, t.status),
}])

export const payments = pgTable("payments", {
  id: uuid().primaryKey().defaultRandom(),
  invoice_id: uuid().notNull().references(() => invoices.id),
  provider: text().notNull(),
  provider_order_id: text(),
  provider_transaction_id: text(),
  method: text(),
  amount: numericAsNumber({ precision: 14, scale: 2 }).notNull(),
  status: text().notNull(),
  paid_at: text(),
  raw_callback: jsonb(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_payments_invoice_id: index("idx_payments_invoice_id").on(t.invoice_id),
  idx_payments_order_id: index("idx_payments_order_id").on(t.provider_order_id),
}])

export const attendances = pgTable("attendances", {
  id: uuid().primaryKey().defaultRandom(),
  member_id: uuid().notNull().references(() => members.id),
  branch_id: uuid().notNull().references(() => branches.id),
  subscription_id: uuid().references(() => subscriptions.id),
  check_in_time: text().notNull().default(sql`now()`),
  check_out_time: text(),
  duration_minutes: integer(),
  check_in_latitude: numericAsNumber({ precision: 10, scale: 7 }),
  check_in_longitude: numericAsNumber({ precision: 10, scale: 7 }),
  check_in_accuracy: numericAsNumber({ precision: 10, scale: 2 }),
  check_out_latitude: numericAsNumber({ precision: 10, scale: 7 }),
  check_out_longitude: numericAsNumber({ precision: 10, scale: 7 }),
  check_out_accuracy: numericAsNumber({ precision: 10, scale: 2 }),
  distance_meters: numericAsNumber({ precision: 10, scale: 2 }),
  status: attendanceStatusEnum().notNull().default("CHECKED_IN"),
  failure_reason: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_attendances_member_status: index("idx_attendances_member_status").on(t.member_id, t.status, t.check_out_time),
  idx_attendances_member_id: index("idx_attendances_member_id").on(t.member_id),
}])

export const expenses = pgTable("expenses", {
  id: uuid().primaryKey().defaultRandom(),
  branch_id: uuid().references(() => branches.id),
  category: text().notNull(),
  amount: numericAsNumber({ precision: 14, scale: 2 }).notNull(),
  description: text(),
  expense_date: text().notNull(),
  payment_method: text(),
  proof_url: text(),
  created_by: uuid().references(() => users.id),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_expenses_branch_date: index("idx_expenses_branch_date").on(t.branch_id, t.expense_date),
}])

export const branding_settings = pgTable("branding_settings", {
  id: uuid().primaryKey().defaultRandom(),
  brand_name: text().notNull(),
  tagline: text(),
  logo_url: text(),
  logo_dark_url: text(),
  favicon_url: text(),
  app_icon_url: text(),
  primary_color: text().notNull().default("24 95% 53%"),
  secondary_color: text().notNull().default("188 84% 45%"),
  accent_color: text().notNull().default("142 71% 45%"),
  background_color: text().notNull().default("240 10% 3.9%"),
  card_color: text().notNull().default("240 10% 7%"),
  border_color: text().notNull().default("240 4% 18%"),
  radius: text().notNull().default("0.75rem"),
  theme_mode: text().notNull().default("dark"),
  preset_theme: text().notNull().default("Premium Dark"),
  whatsapp: text(),
  instagram_url: text(),
  tiktok_url: text(),
  footer_text: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const blog_posts = pgTable("blog_posts", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  slug: text().notNull().unique(),
  excerpt: text(),
  content: text(),
  thumbnail_url: text(),
  access_type: blogAccessTypeEnum().notNull().default("PUBLIC"),
  status: blogStatusEnum().notNull().default("DRAFT"),
  author_id: uuid().references(() => users.id),
  published_at: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_blog_posts_status: index("idx_blog_posts_status").on(t.status),
}])

export const nutrition_logs = pgTable("nutrition_logs", {
  id: uuid().primaryKey().defaultRandom(),
  member_id: uuid().notNull().references(() => members.id),
  log_date: text().notNull(),
  meal_type: text(),
  food_name: text(),
  portion: text(),
  eaten_at: text(),
  weight_kg: numericAsNumber({ precision: 6, scale: 2 }),
  calories: integer(),
  protein_gram: integer(),
  carbs_gram: integer(),
  fat_gram: integer(),
  water_ml: integer(),
  notes: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_nutrition_logs_member_date: index("idx_nutrition_logs_member_date").on(t.member_id, t.log_date),
}])

export const nutrition_targets = pgTable("nutrition_targets", {
  id: uuid().primaryKey().defaultRandom(),
  member_id: uuid().notNull().references(() => members.id, { onDelete: "cascade" }),
  height_cm: numericAsNumber({ precision: 6, scale: 2 }),
  age: integer(),
  gender: text(),
  goal: text(),
  activity_level: text(),
  allergies: text(),
  food_preferences: text(),
  daily_food_budget: integer(),
  meals_per_day: integer(),
  target_bmi: numericAsNumber({ precision: 5, scale: 2 }),
  target_calories: integer(),
  target_weight_kg: numericAsNumber({ precision: 6, scale: 2 }),
  target_protein_gram: integer(),
  target_carbs_gram: integer(),
  target_fat_gram: integer(),
  target_water_ml: integer(),
  meal_pattern: text(),
  notes: text(),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  unique_member_target: { columns: [t.member_id] },
}])

export const workout_programs = pgTable("workout_programs", {
  id: uuid().primaryKey().defaultRandom(),
  member_id: uuid().notNull().references(() => members.id, { onDelete: "cascade" }),
  title: text().notNull(),
  goal: text(),
  level: text(),
  weekly_sessions: integer(),
  session_duration_minutes: integer(),
  equipment: text(),
  limitations: text(),
  preference: text(),
  is_active: boolean().notNull().default(true),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
}, (t) => [{
  idx_workout_programs_member_id: index("idx_workout_programs_member_id").on(t.member_id),
}])

export const workout_sessions = pgTable("workout_sessions", {
  id: uuid().primaryKey().defaultRandom(),
  program_id: uuid().notNull().references(() => workout_programs.id, { onDelete: "cascade" }),
  day_name: text().notNull(),
  session_order: integer().notNull().default(1),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const workout_exercises = pgTable("workout_exercises", {
  id: uuid().primaryKey().defaultRandom(),
  session_id: uuid().notNull().references(() => workout_sessions.id, { onDelete: "cascade" }),
  exercise_name: text().notNull(),
  exercise_type: text().notNull(),
  sets: integer().notNull().default(3),
  reps: text(),
  load_note: text(),
  exercise_order: integer().notNull().default(1),
  created_at: text().notNull().default(sql`now()`),
  updated_at: text().notNull().default(sql`now()`),
})

export const audit_logs = pgTable("audit_logs", {
  id: uuid().primaryKey().defaultRandom(),
  actor_user_id: uuid().references(() => users.id),
  action: text().notNull(),
  entity_type: text().notNull(),
  entity_id: uuid(),
  old_value: jsonb(),
  new_value: jsonb(),
  ip_address: text(),
  user_agent: text(),
  created_at: text().notNull().default(sql`now()`),
})

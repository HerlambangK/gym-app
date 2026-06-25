export type RoleCode =
  | "SUPER_ADMIN"
  | "OWNER"
  | "MANAGER"
  | "ADMIN"
  | "MARKETING"
  | "TRAINER"
  | "MEMBER";

export type PermissionCode =
  | "manage_users"
  | "manage_roles"
  | "manage_permissions"
  | "manage_branches"
  | "manage_branding"
  | "manage_theme"
  | "manage_members"
  | "view_members"
  | "manage_memberships"
  | "manage_plans"
  | "manage_invoices"
  | "manage_payments"
  | "manage_refunds"
  | "view_financial"
  | "manage_expenses"
  | "view_reports"
  | "manage_attendance"
  | "manual_check_in"
  | "manage_blog"
  | "manage_premium_features"
  | "view_member_portal"
  | "member_check_in"
  | "member_check_out"
  | "use_premium_blog"
  | "use_nutrition_log"
  | "use_workout_progress";

export type FeatureCode =
  | "attendance_check_in"
  | "attendance_check_out"
  | "attendance_history"
  | "billing_history"
  | "premium_blog"
  | "nutrition_log"
  | "body_weight_tracking"
  | "workout_progress"
  | "trainer_notes"
  | "class_booking"
  | "priority_support"
  | "multi_branch_access";

export type InvoiceStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "FROZEN";


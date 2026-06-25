import type { FeatureCode } from "@/types/domain";

export type PlanTier = "DAILY" | "BASIC" | "PLUS" | "PRO";

export const planFeatureMatrix: Record<PlanTier, FeatureCode[]> = {
  DAILY: [
    "attendance_check_in",
    "attendance_check_out",
    "billing_history",
  ],
  BASIC: [
    "attendance_check_in",
    "attendance_check_out",
    "attendance_history",
    "billing_history",
  ],
  PLUS: [
    "attendance_check_in",
    "attendance_check_out",
    "attendance_history",
    "billing_history",
    "premium_blog",
    "nutrition_log",
    "body_weight_tracking",
  ],
  PRO: [
    "attendance_check_in",
    "attendance_check_out",
    "attendance_history",
    "billing_history",
    "premium_blog",
    "nutrition_log",
    "body_weight_tracking",
    "workout_progress",
    "trainer_notes",
    "priority_support",
    "multi_branch_access",
  ],
};

export function canUseFeature(
  plan: PlanTier,
  feature: FeatureCode,
  systemEnabled = true,
) {
  return systemEnabled && planFeatureMatrix[plan].includes(feature);
}


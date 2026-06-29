import { canUseFeature, planFeatureMatrix } from "@/lib/feature-gate";
import type { FeatureCode } from "@/types/domain";

describe("planFeatureMatrix", () => {
  it("DAILY hanya punya fitur dasar check-in dan billing", () => {
    expect(planFeatureMatrix.DAILY).toEqual([
      "attendance_check_in",
      "attendance_check_out",
      "billing_history",
    ]);
  });

  it("PRO memiliki semua fitur yang tersedia", () => {
    expect(planFeatureMatrix.PRO).toContain("attendance_check_in");
    expect(planFeatureMatrix.PRO).toContain("premium_blog");
    expect(planFeatureMatrix.PRO).toContain("nutrition_log");
    expect(planFeatureMatrix.PRO).toContain("workout_progress");
    expect(planFeatureMatrix.PRO).toContain("trainer_notes");
    expect(planFeatureMatrix.PRO).toContain("priority_support");
    expect(planFeatureMatrix.PRO).toContain("multi_branch_access");
  });

  it("PLUS memiliki fitur lebih dari BASIC", () => {
    expect(planFeatureMatrix.PLUS.length).toBeGreaterThan(planFeatureMatrix.BASIC.length);
    expect(planFeatureMatrix.PLUS).toContain("premium_blog");
    expect(planFeatureMatrix.BASIC).not.toContain("premium_blog");
  });
});

describe("canUseFeature", () => {
  it("mengembalikan true jika fitur ada di plan dan system enabled", () => {
    expect(canUseFeature("PRO", "premium_blog")).toBe(true);
  });

  it("mengembalikan true untuk BASIC dengan attendance_history", () => {
    expect(canUseFeature("BASIC", "attendance_history")).toBe(true);
  });

  it("mengembalikan false jika fitur tidak ada di plan", () => {
    expect(canUseFeature("DAILY", "premium_blog")).toBe(false);
  });

  it("mengembalikan false jika system disabled (systemEnabled=false)", () => {
    expect(canUseFeature("PRO", "premium_blog", false)).toBe(false);
  });

  it("mengembalikan false jika system disabled meskipun fitur ada di plan", () => {
    expect(canUseFeature("BASIC", "attendance_check_in", false)).toBe(false);
  });

  it("mengembalikan false untuk DAILY yang mencoba akses workout_progress", () => {
    expect(canUseFeature("DAILY", "workout_progress")).toBe(false);
  });

  it("mengembalikan false untuk BASIC yang mencoba akses class_booking (tidak ada di matrix)", () => {
    expect(canUseFeature("BASIC", "class_booking" as FeatureCode)).toBe(false);
  });
});

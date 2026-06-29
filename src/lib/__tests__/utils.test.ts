import { cn } from "@/lib/utils";

describe("cn", () => {
  it("menggabungkan class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("menangani conditional classes (false/undefined/null)", () => {
    expect(cn("base", false && "hidden", undefined, null)).toBe("base");
  });

  it("resolve konflik tailwind (yg terakhir menang)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("merge class tailwind dengan benar", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handle array input", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });

  it("handle mixed input types", () => {
    expect(cn("px-4", ["py-2", "m-1"], { "text-center": true })).toBe("px-4 py-2 m-1 text-center");
  });
});

import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton Component", () => {
  it("render sebagai div dengan data-slot='skeleton'", () => {
    render(<Skeleton data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveAttribute("data-slot", "skeleton");
    expect(el.tagName).toBe("DIV");
  });

  it("memiliki class animate-pulse untuk efek loading", () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId("skel")).toHaveClass("animate-pulse");
  });

  it("menerima className custom", () => {
    render(<Skeleton className="h-10 w-full" data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el).toHaveClass("h-10");
    expect(el).toHaveClass("w-full");
  });
});

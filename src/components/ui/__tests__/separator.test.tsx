import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator Component", () => {
  it("render dengan data-slot='separator'", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("data-slot", "separator");
  });

  it("orientation default horizontal", () => {
    render(<Separator data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("data-orientation", "horizontal");
  });

  it("orientation vertical", () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    const el = screen.getByTestId("sep");
    expect(el).toHaveAttribute("data-orientation", "vertical");
  });

  it("horizontal memiliki class h-px", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep").className).toContain("h-px");
  });

  it("vertical memiliki class w-px", () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId("sep").className).toContain("w-px");
  });
});

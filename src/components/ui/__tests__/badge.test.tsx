import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge Component", () => {
  it("render teks badge", () => {
    render(<Badge>Aktif</Badge>);
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });

  it("render sebagai div", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test").tagName).toBe("DIV");
  });

  it("variant='default' memiliki class bg-primary", () => {
    render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default").className).toContain("bg-primary");
  });

  it("variant='secondary' memiliki class bg-secondary", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary").className).toContain("bg-secondary");
  });

  it("variant='outline' memiliki class border-border", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline").className).toContain("border-border");
  });

  it("variant='success' memiliki class text-emerald", () => {
    render(<Badge variant="success">Success</Badge>);
    const cls = screen.getByText("Success").className;
    expect(cls).toContain("emerald");
  });

  it("variant='warning' memiliki class text-amber", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const cls = screen.getByText("Warning").className;
    expect(cls).toContain("amber");
  });

  it("menggabungkan className custom", () => {
    render(<Badge className="my-badge">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("my-badge");
  });
});

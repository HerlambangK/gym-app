import { render, screen } from "@testing-library/react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";

describe("Card Component", () => {
  it("render Card sebagai div border rounded", () => {
    render(<Card data-testid="card" />);
    const el = screen.getByTestId("card");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("rounded-lg");
    expect(el.className).toContain("border");
  });

  it("CardTitle render sebagai H3", () => {
    render(<CardTitle>Judul Card</CardTitle>);
    const title = screen.getByText("Judul Card");
    expect(title.tagName).toBe("H3");
    expect(title.className).toContain("font-semibold");
  });

  it("CardDescription render sebagai P", () => {
    render(<CardDescription>Deskripsi</CardDescription>);
    expect(screen.getByText("Deskripsi").tagName).toBe("P");
  });

  it("CardContent memiliki class pt-0", () => {
    render(<CardContent data-testid="content">content</CardContent>);
    expect(screen.getByTestId("content").className).toContain("pt-0");
  });

  it("komposisi Card lengkap terender semua", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Ringkasan bisnis</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Data grafik</p>
        </CardContent>
      </Card>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Ringkasan bisnis")).toBeInTheDocument();
    expect(screen.getByText("Data grafik")).toBeInTheDocument();
  });
});

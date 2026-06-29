import { render, screen } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";

function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("NavMain Component", () => {
  const items = [
    { title: "Dashboard", url: "/owner/dashboard", icon: <span data-testid="ico-dash" />, isActive: true },
    { title: "Members", url: "/owner/members", icon: <span data-testid="ico-members" /> },
  ];

  it("render semua item navigasi", () => {
    renderWithSidebar(<NavMain items={items} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
  });

  it("render label 'Navigation'", () => {
    renderWithSidebar(<NavMain items={items} />);
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("render icon untuk setiap item", () => {
    renderWithSidebar(<NavMain items={items} />);
    expect(screen.getByTestId("ico-dash")).toBeInTheDocument();
    expect(screen.getByTestId("ico-members")).toBeInTheDocument();
  });

  it("render empty items tanpa crash", () => {
    const { container } = renderWithSidebar(<NavMain items={[]} />);
    expect(container.textContent).toContain("Navigation");
  });

  it("setiap item memiliki link dengan href yang benar", () => {
    renderWithSidebar(<NavMain items={items} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/owner/dashboard");
    expect(hrefs).toContain("/owner/members");
  });
});

import { render, screen } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";

function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("TeamSwitcher Component", () => {
  const teams = [
    { name: "Gym Fit", logo: <svg data-testid="logo-svg" />, plan: "Pro Plan" },
    { name: "Gym Fit 2", logo: <span />, plan: "Basic Plan" },
  ];

  it("render nama team pertama sebagai active team", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(screen.getByText("Gym Fit")).toBeInTheDocument();
  });

  it("render plan dari team pertama", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
  });

  it("tidak render apapun jika teams kosong", () => {
    renderWithSidebar(<TeamSwitcher teams={[]} />);
    expect(screen.queryByText("Gym Fit")).not.toBeInTheDocument();
  });

  it("render icon Dumbbell", () => {
    const { container } = renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

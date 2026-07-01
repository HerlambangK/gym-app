import { render, screen } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

jest.mock("@/lib/supabase", () => ({
  createBrowserSupabaseClient: jest.fn().mockReturnValue({
    auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
  }),
}));

function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

function renderNavUser(user = { name: "Budi Santoso", email: "budi@example.com" }) {
  return renderWithSidebar(<NavUser user={user} role="MEMBER" />);
}

describe("NavUser Component", () => {
  it("render nama user", () => {
    renderNavUser();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
  });

  it("render email user", () => {
    renderNavUser();
    expect(screen.getByText("budi@example.com")).toBeInTheDocument();
  });

  it("render inisial dari nama (2 kata)", () => {
    renderNavUser();
    const initials = screen.getAllByText("BS");
    expect(initials.length).toBeGreaterThanOrEqual(1);
  });

  it("render inisial dari 1 kata", () => {
    renderNavUser({ name: "Budi", email: "budi@example.com" });
    expect(screen.getAllByText("B").length).toBeGreaterThanOrEqual(1);
  });

  it("render inisial dari email jika nama kosong", () => {
    renderNavUser({ name: "", email: "andi@example.com" });
    expect(screen.getAllByText("A").length).toBeGreaterThanOrEqual(1);
  });

  it("render tombol trigger dropdown user", () => {
    renderNavUser({ name: "Budi", email: "budi@example.com" });
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("budi@example.com")).toBeInTheDocument();
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });
});

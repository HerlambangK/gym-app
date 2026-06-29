import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/dashboard/metric-card";

describe("MetricCard Component", () => {
  it("render label, formatted value, dan helper text", () => {
    render(<MetricCard label="Total Revenue" value={50000000} helper="+12% from last month" />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Rp 50.000.000")).toBeInTheDocument();
    expect(screen.getByText("+12% from last month")).toBeInTheDocument();
  });

  it("memformat angka revenue sebagai currency IDR", () => {
    render(<MetricCard label="Total Revenue" value={150000} helper="test" />);
    expect(screen.getByText("Rp 150.000")).toBeInTheDocument();
  });

  it("memformat angka non-revenue sebagai number biasa", () => {
    render(<MetricCard label="Active Members" value={1234} helper="today" />);
    expect(screen.getByText("1.234")).toBeInTheDocument();
  });

  it("memformat expense sebagai currency", () => {
    render(<MetricCard label="Monthly Expense" value={5000000} helper="operational" />);
    expect(screen.getByText("Rp 5.000.000")).toBeInTheDocument();
  });

  it("memformat profit sebagai currency", () => {
    render(<MetricCard label="Net Profit" value={25000000} helper="this month" />);
    expect(screen.getByText("Rp 25.000.000")).toBeInTheDocument();
  });

  it("render value 0 dengan benar", () => {
    render(<MetricCard label="Members" value={0} helper="no data" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("label memiliki class text-muted-foreground", () => {
    render(<MetricCard label="Test" value={100} helper="helper" />);
    expect(screen.getByText("Test")).toHaveClass("text-muted-foreground");
  });

  it("helper memiliki class text-xs", () => {
    render(<MetricCard label="Test" value={100} helper="helper text" />);
    expect(screen.getByText("helper text")).toHaveClass("text-xs");
  });
});

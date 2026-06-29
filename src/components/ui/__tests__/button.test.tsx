import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("render button dengan teks children", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole("button", { name: /simpan/i })).toBeInTheDocument();
  });

  it("memiliki data-slot='button'", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("type default adalah 'button' (bukan submit)", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("memanggil onClick saat diklik", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Klik</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled button tidak merespon klik", async () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Klik</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("disabled button memiliki atribut disabled", () => {
    render(<Button disabled>Klik</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("menerapkan className tambahan via cn()", () => {
    render(<Button className="my-custom-class">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("my-custom-class");
    expect(btn.className).toContain("inline-flex");
  });

  it("render sebagai elemen button (bukan anchor)", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });

  it("meneruskan atribut HTML tambahan", () => {
    render(<Button aria-label="custom-label" data-testid="btn">Test</Button>);
    expect(screen.getByTestId("btn")).toHaveAttribute("aria-label", "custom-label");
  });
});

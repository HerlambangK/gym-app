import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  it("render dengan placeholder", () => {
    render(<Input placeholder="Masukkan nama" />);
    expect(screen.getByPlaceholderText("Masukkan nama")).toBeInTheDocument();
  });

  it("memiliki data-slot='input'", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
  });

  it("menerima input dari user", async () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Budi Santoso");
    expect(input).toHaveValue("Budi Santoso");
  });

  it("memanggil onChange saat diketik", async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("disabled input tidak bisa diisi", async () => {
    const handleChange = jest.fn();
    render(<Input disabled onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "text");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("render dengan type spesifik", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("render dengan value default", () => {
    render(<Input defaultValue="prefilled" />);
    expect(screen.getByRole("textbox")).toHaveValue("prefilled");
  });
});

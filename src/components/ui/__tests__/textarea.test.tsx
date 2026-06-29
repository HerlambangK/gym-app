import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea Component", () => {
  it("render textarea dengan placeholder", () => {
    render(<Textarea placeholder="Tulis catatan" />);
    expect(screen.getByPlaceholderText("Tulis catatan")).toBeInTheDocument();
  });

  it("render sebagai textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });

  it("menerima input dari user", async () => {
    render(<Textarea />);
    const ta = screen.getByRole("textbox");
    await userEvent.type(ta, "Catatan penting");
    expect(ta).toHaveValue("Catatan penting");
  });

  it("disabled textarea tidak bisa diisi", async () => {
    const handleChange = jest.fn();
    render(<Textarea disabled onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "text");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("menerapkan className custom", () => {
    render(<Textarea className="my-textarea" />);
    expect(screen.getByRole("textbox")).toHaveClass("my-textarea");
  });
});

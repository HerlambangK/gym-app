import { render } from "@testing-library/react";
import { Progress } from "@/components/ui/progress";

describe("Progress Component", () => {
  it("render struktur dua div (wrapper + indicator)", () => {
    const { container } = render(<Progress value={50} />);
    const wrapper = container.firstChild as HTMLElement;
    const indicator = wrapper.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(indicator).toBeInTheDocument();
  });

  it("indicator memiliki width sesuai value", () => {
    const { container } = render(<Progress value={50} />);
    const indicator = container.firstChild!.firstChild as HTMLElement;
    expect(indicator.style.width).toBe("50%");
  });

  it("value 0 menghasilkan width 0%", () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.firstChild!.firstChild as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  it("value 100 menghasilkan width 100%", () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.firstChild!.firstChild as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("value negatif di-clamp ke 0%", () => {
    const { container } = render(<Progress value={-20} />);
    const indicator = container.firstChild!.firstChild as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  it("value > 100 di-clamp ke 100%", () => {
    const { container } = render(<Progress value={200} />);
    const indicator = container.firstChild!.firstChild as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("menerapkan className custom ke wrapper", () => {
    const { container } = render(<Progress value={50} className="my-progress" />);
    expect((container.firstChild as HTMLElement)).toHaveClass("my-progress");
  });
});

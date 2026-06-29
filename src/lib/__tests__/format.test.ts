import { rupiah, number, formatDate } from "@/lib/format";

describe("rupiah", () => {
  it("memformat angka sebagai mata uang IDR", () => {
    expect(rupiah.format(15000)).toContain("15.000");
    expect(rupiah.format(15000)).toContain("Rp");
  });

  it("memformat 0 sebagai Rp 0", () => {
    expect(rupiah.format(0)).toContain("0");
    expect(rupiah.format(0)).toContain("Rp");
  });

  it("memformat angka besar dengan pemisah ribuan", () => {
    expect(rupiah.format(1000000000)).toContain("1.000.000.000");
    expect(rupiah.format(1000000000)).toContain("Rp");
  });

  it("tidak menampilkan desimal dan melakukan pembulatan", () => {
    expect(rupiah.format(15000.75)).not.toContain(",");
    expect(rupiah.format(15000.75)).toContain("15.001");
  });

  it("menangani angka negatif", () => {
    expect(rupiah.format(-5000)).toContain("5.000");
    expect(rupiah.format(-5000)).toContain("-");
  });
});

describe("number", () => {
  it("memformat angka ribuan dengan pemisah", () => {
    expect(number.format(1000000)).toBe("1.000.000");
  });

  it("memformat 0 sebagai 0", () => {
    expect(number.format(0)).toBe("0");
  });

  it("memformat desimal dengan koma", () => {
    expect(number.format(3.5)).toBe("3,5");
  });

  it("memformat angka negatif", () => {
    expect(number.format(-500)).toBe("-500");
  });
});

describe("formatDate", () => {
  it("memformat tanggal ke format Indonesia (short month)", () => {
    expect(formatDate("2026-06-28")).toBe("28 Jun 2026");
  });

  it("memformat tanggal diawal bulan", () => {
    expect(formatDate("2026-01-01")).toBe("01 Jan 2026");
  });

  it("memformat tanggal diakhir tahun", () => {
    expect(formatDate("2026-12-31")).toBe("31 Des 2026");
  });

  it("menangani string tanggal dengan waktu", () => {
    const result = formatDate("2026-06-28T15:30:00Z");
    expect(result).toBe("28 Jun 2026");
  });
});

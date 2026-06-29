import { registerMemberSchema, attendanceLocationSchema } from "@/lib/validators";

describe("registerMemberSchema", () => {
  it("valid untuk data member yang lengkap", () => {
    const data = {
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "08123456789",
      planCode: "BASIC",
    };
    expect(() => registerMemberSchema.parse(data)).not.toThrow();
  });

  it("error jika nama kurang dari 2 karakter", () => {
    expect(() =>
      registerMemberSchema.parse({ name: "A", email: "budi@test.com", phone: "08123456789", planCode: "BASIC" }),
    ).toThrow();
  });

  it("error jika email tidak valid", () => {
    expect(() =>
      registerMemberSchema.parse({ name: "Budi", email: "invalid-email", phone: "08123456789", planCode: "BASIC" }),
    ).toThrow();
  });

  it("error jika phone kurang dari 9 digit", () => {
    expect(() =>
      registerMemberSchema.parse({ name: "Budi", email: "budi@test.com", phone: "08123", planCode: "BASIC" }),
    ).toThrow();
  });

  it("error jika planCode kurang dari 2 karakter", () => {
    expect(() =>
      registerMemberSchema.parse({ name: "Budi", email: "budi@test.com", phone: "08123456789", planCode: "A" }),
    ).toThrow();
  });

  it("error jika field required tidak diisi", () => {
    expect(() => registerMemberSchema.parse({})).toThrow();
  });
});

describe("attendanceLocationSchema", () => {
  it("valid untuk koordinat yang benar", () => {
    const data = { latitude: -6.2146, longitude: 106.8451, accuracy: 10 };
    expect(() => attendanceLocationSchema.parse(data)).not.toThrow();
  });

  it("error jika latitude < -90", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: -100, longitude: 0, accuracy: 10 }),
    ).toThrow();
  });

  it("error jika latitude > 90", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 100, longitude: 0, accuracy: 10 }),
    ).toThrow();
  });

  it("error jika longitude < -180", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 0, longitude: -200, accuracy: 10 }),
    ).toThrow();
  });

  it("error jika longitude > 180", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 0, longitude: 200, accuracy: 10 }),
    ).toThrow();
  });

  it("error jika accuracy <= 0", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 0, longitude: 0, accuracy: 0 }),
    ).toThrow();
  });

  it("error jika accuracy > 150", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 0, longitude: 0, accuracy: 200 }),
    ).toThrow();
  });

  it("valid untuk batas maksimal accuracy 150", () => {
    expect(() =>
      attendanceLocationSchema.parse({ latitude: 0, longitude: 0, accuracy: 150 }),
    ).not.toThrow();
  });

  it("error jika field tidak diisi", () => {
    expect(() => attendanceLocationSchema.parse({})).toThrow();
  });
});

import { getSubscriptionTiming } from "@/lib/subscription-timing"

describe("getSubscriptionTiming", () => {
  it("menghitung sisa waktu dari total masa aktif berdasarkan date-time Jakarta", () => {
    const timing = getSubscriptionTiming({
      startDate: "2026-07-06",
      endDate: "2026-07-07",
      now: new Date("2026-07-06T19:00:00+07:00"),
    })

    expect(timing.totalLabel).toBe("2 hari")
    expect(timing.remainingLabel).toBe("1 hari 5 jam")
    expect(timing.summaryLabel).toBe("1 hari 5 jam dari 2 hari")
    expect(timing.progressRemaining).toBe(60)
    expect(timing.status).toBe("soon")
    expect(timing.statusLabel).toBe("Sebentar lagi habis lho")
  })

  it("menandai hampir habis saat sisa kurang dari atau sama dengan 24 jam", () => {
    const timing = getSubscriptionTiming({
      startDate: "2026-07-06",
      endDate: "2026-07-07",
      now: new Date("2026-07-07T05:00:00+07:00"),
    })

    expect(timing.remainingLabel).toBe("19 jam")
    expect(timing.status).toBe("critical")
    expect(timing.statusLabel).toBe("Hampir habis")
  })

  it("menandai habis saat sudah lewat akhir hari membership", () => {
    const timing = getSubscriptionTiming({
      startDate: "2026-07-06",
      endDate: "2026-07-07",
      now: new Date("2026-07-08T00:01:00+07:00"),
    })

    expect(timing.remainingLabel).toBe("0 menit")
    expect(timing.progressRemaining).toBe(0)
    expect(timing.status).toBe("expired")
    expect(timing.statusLabel).toBe("Habis")
  })
})

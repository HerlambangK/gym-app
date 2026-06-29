import { getDistanceMeters } from "@/lib/haversine";

describe("getDistanceMeters", () => {
  it("mengembalikan 0 untuk koordinat yang sama", () => {
    const point = { latitude: -6.1751, longitude: 106.865 };
    expect(getDistanceMeters(point, point)).toBe(0);
  });

  it("menghitung jarak Jakarta - Monas (~1.5 km)", () => {
    const jakarta = { latitude: -6.21462, longitude: 106.84513 };
    const monas = { latitude: -6.1751, longitude: 106.8271 };
    const distance = getDistanceMeters(jakarta, monas);
    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(5000);
  });

  it("menghitung jarak ~111km untuk 1 derajat latitude", () => {
    const point1 = { latitude: 0, longitude: 0 };
    const point2 = { latitude: 1, longitude: 0 };
    const distance = getDistanceMeters(point1, point2);
    expect(distance).toBeGreaterThan(110000);
    expect(distance).toBeLessThan(112000);
  });

  it("menghitung jarak equator ke kutub ~10.000km", () => {
    const equator = { latitude: 0, longitude: 0 };
    const northPole = { latitude: 90, longitude: 0 };
    const distance = getDistanceMeters(equator, northPole);
    expect(distance).toBeGreaterThan(9900000);
    expect(distance).toBeLessThan(10100000);
  });

  it("jarak antar kota yang sama (symmetric)", () => {
    const cityA = { latitude: -6.2, longitude: 106.8 };
    const cityB = { latitude: -7.8, longitude: 110.4 };
    const ab = getDistanceMeters(cityA, cityB);
    const ba = getDistanceMeters(cityB, cityA);
    expect(ab).toBe(ba);
  });

  it("menangani koordinat dengan nilai negatif (bujur barat)", () => {
    const from = { latitude: 40.7128, longitude: -74.006 };
    const to = { latitude: 34.0522, longitude: -118.2437 };
    const distance = getDistanceMeters(from, to);
    expect(distance).toBeGreaterThan(3900000);
    expect(distance).toBeLessThan(4000000);
  });
});

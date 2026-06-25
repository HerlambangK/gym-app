export async function POST() {
  return Response.json({
    status: "CHECKED_OUT",
    durationMinutes: 74,
    checkedOutAt: new Date().toISOString(),
  });
}


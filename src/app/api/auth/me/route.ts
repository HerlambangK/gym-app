import { rolePermissions } from "@/lib/rbac";

export async function GET() {
  return Response.json({
    user: {
      id: "demo-member",
      name: "Budi Santoso",
      email: "budi@example.com",
      roles: ["MEMBER"],
      permissions: rolePermissions.MEMBER,
    },
  });
}


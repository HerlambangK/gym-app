import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from("roles").select("code").limit(1);

    if (error) {
      return Response.json(
        {
          connected: true,
          schemaReady: false,
          code: error.code,
          message: error.message,
        },
        { status: 200 },
      );
    }

    return Response.json({
      connected: true,
      schemaReady: true,
      sampleRows: data.length,
    });
  } catch (error) {
    return Response.json(
      {
        connected: false,
        schemaReady: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}


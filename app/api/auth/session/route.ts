import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("sop_session")?.value;
  const isDemo = request.cookies.get("sop_mode")?.value === "demo";
  const sapId = request.cookies.get("sop_sap_id")?.value;

  if (!sessionToken && !isDemo) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    isDemo,
    sapId: sapId || "590039697",
  });
}

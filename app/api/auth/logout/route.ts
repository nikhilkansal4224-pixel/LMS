import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear auth cookies
  response.cookies.delete("sop_session");
  response.cookies.delete("sop_mode");
  response.cookies.delete("sop_sap_id");

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_AVATAR } from "@/lib/avatar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawPath = searchParams.get("path");
  const container = searchParams.get("container") || "iemsfilecontainer";

  if (!rawPath) {
    return NextResponse.redirect(FALLBACK_AVATAR, 307);
  }

  // Ensure leading slash
  let cleanPath = rawPath.trim();
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  // Determine base document host
  // Default UPES document storage server
  const envDocsBase = process.env.UPES_DOCS_BASE_URL;
  let baseOrigin = "https://slcm.upes.ac.in";

  if (envDocsBase) {
    baseOrigin = envDocsBase.replace(/\/$/, "");
  } else if (process.env.UPES_API_BASE_URL) {
    try {
      const parsed = new URL(process.env.UPES_API_BASE_URL);
      baseOrigin = parsed.origin;
    } catch {
      baseOrigin = "https://slcm.upes.ac.in";
    }
  }

  const targetUrl = `${baseOrigin}${cleanPath}`;

  // Read auth token from cookie if available
  const sessionToken = request.cookies.get("sop_session")?.value;

  try {
    const forwardHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) SOP-UPES-Student-Dashboard/1.0",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://slcm.upes.ac.in/",
    };

    if (sessionToken && !sessionToken.startsWith("demo-")) {
      forwardHeaders["Authorization"] = `Bearer ${sessionToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: forwardHeaders,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      // Return redirect to fallback avatar instead of broken image
      return NextResponse.redirect(FALLBACK_AVATAR, 307);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    return NextResponse.redirect(FALLBACK_AVATAR, 307);
  }
}

import { NextRequest, NextResponse } from "next/server";

// CORS Proxy for UPES SLCM API and custom student portal endpoints
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path, "PUT");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-url, x-session-token, x-sap-id",
    },
  });
}

async function handleProxy(request: NextRequest, pathSegments: string[], method: string) {
  const startTime = performance.now();
  const path = pathSegments.join("/");
  const searchParams = request.nextUrl.searchParams;

  // Dedicated lightweight ping route for latency testing
  if (path === "ping" || pathSegments[0] === "ping") {
    const durationMs = Math.max(1, Math.round(performance.now() - startTime));
    return NextResponse.json(
      {
        status: "ok",
        gateway: "UPES SLCM Edge",
        durationMs,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Response-Time": `${durationMs}ms`,
          "Server-Timing": `gateway;dur=${durationMs}`,
        },
      }
    );
  }

  // Determine specific module endpoint from environment variables
  let targetUrl: string | null = null;
  let envKey = "UPES_API_BASE_URL";

  if (path.includes("profile")) {
    envKey = "UPES_PROFILE_URL";
    targetUrl = process.env.UPES_PROFILE_URL || null;
  } else if (path.includes("attendance")) {
    envKey = "UPES_ATTENDANCE_URL";
    targetUrl = process.env.UPES_ATTENDANCE_URL || null;
  } else if (path.includes("timetable")) {
    envKey = "UPES_TIMETABLE_URL";
    targetUrl = process.env.UPES_TIMETABLE_URL || null;
  } else if (path.includes("grades") || path.includes("marks")) {
    envKey = "UPES_GRADES_URL";
    targetUrl = process.env.UPES_GRADES_URL || null;
  } else if (path.includes("lms") || path.includes("courses")) {
    envKey = "UPES_LMS_URL";
    targetUrl = process.env.UPES_LMS_URL || null;
  }

  // Fallback to custom target header/query or UPES_API_BASE_URL
  const customTarget = request.headers.get("x-target-url") || searchParams.get("target");
  if (customTarget) {
    targetUrl = `${customTarget.replace(/\/$/, "")}/${path}`;
  } else if (!targetUrl) {
    const baseApi = process.env.UPES_API_BASE_URL || "https://slcm.upes.ac.in/api/v1";
    targetUrl = `${baseApi.replace(/\/$/, "")}/${path}`;
  }

  // Read auth token from cookie first (sop_session), then fallback to headers
  const cookieSession = request.cookies.get("sop_session")?.value;
  const authHeader = cookieSession
    ? `Bearer ${cookieSession}`
    : request.headers.get("authorization") || request.headers.get("x-session-token");

  const sapId = request.cookies.get("sop_sap_id")?.value || request.headers.get("x-sap-id");
  const studentEmail = request.cookies.get("sop_email")?.value;

  try {
    const forwardHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) SOP-UPES-Student-Dashboard/1.0",
      Accept: "application/json, text/plain, */*",
    };

    if (authHeader) {
      forwardHeaders["Authorization"] = authHeader.startsWith("Bearer ")
        ? authHeader
        : `Bearer ${authHeader}`;
    }
    if (cookieSession) {
      forwardHeaders["Cookie"] = `sop_session=${cookieSession}`;
    }
    if (sapId) {
      forwardHeaders["X-SAP-ID"] = sapId;
    }
    if (studentEmail) {
      forwardHeaders["X-Student-Email"] = studentEmail;
    }

    let bodyData: BodyInit | undefined = undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        bodyData = await request.text();
        forwardHeaders["Content-Type"] = request.headers.get("content-type") || "application/json";
      } catch {
        // empty body
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body: bodyData,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    const durationMs = Math.max(1, Math.round(performance.now() - startTime));

    // If external service is unlinked or unreachable
    if (!response || !response.ok) {
      const isConfigured = Boolean(process.env[envKey]);

      return NextResponse.json(
        {
          isConfigured,
          envKey,
          targetUrl,
          requestedPath: path,
          method,
          durationMs,
          message: isConfigured
            ? `Target ${envKey} responded with status ${response?.status || "network timeout"}.`
            : `Endpoint ${envKey} is not configured yet in environment variables.`,
          hint: `Add ${envKey} in .env.local to stream real-time data for this card.`,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "X-Response-Time": `${durationMs}ms`,
            "Server-Timing": `api;desc="UPES API Gateway";dur=${durationMs}`,
          },
        }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Response-Time": `${durationMs}ms`,
          "Server-Timing": `api;dur=${durationMs}`,
        },
      });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": contentType || "text/plain",
          "X-Response-Time": `${durationMs}ms`,
          "Server-Timing": `api;dur=${durationMs}`,
        },
      });
    }
  } catch (error: any) {
    const durationMs = Math.max(1, Math.round(performance.now() - startTime));
    return NextResponse.json(
      {
        error: error.message || "Failed to proxy request",
        targetUrl,
        durationMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Response-Time": `${durationMs}ms`,
        },
      }
    );
  }
}

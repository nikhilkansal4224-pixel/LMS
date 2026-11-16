import { NextRequest, NextResponse } from "next/server";
import portalBlueprint from "@/config/portal-blueprint.json";

// Live CORS & Auth Proxy for UPES Portal & SLCM/LMS endpoints
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
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-target-url, x-session-token, x-sap-id, x-student-id",
    },
  });
}

async function handleProxy(request: NextRequest, pathSegments: string[], incomingMethod: string) {
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

  // 1. Identify student parameters from cookies and headers
  const cookieSession = request.cookies.get("sop_session")?.value;
  const cookieStudentId =
    request.cookies.get("sop_student_id")?.value ||
    request.headers.get("x-student-id") ||
    searchParams.get("studentId") ||
    "6349e408-1096-483e-82d0-64587e70b025";

  const sapId =
    request.cookies.get("sop_sap_id")?.value ||
    request.headers.get("x-sap-id") ||
    searchParams.get("sapId") ||
    "590039697";

  const termCode =
    request.cookies.get("sop_term_code")?.value ||
    searchParams.get("termCode") ||
    "SEM_01";

  const studentEmail =
    request.cookies.get("sop_email")?.value ||
    request.headers.get("x-student-email") ||
    "";

  const uniqueHashKey =
    request.cookies.get("sop_unique_hash")?.value ||
    request.headers.get("x-unique-hash-key") ||
    request.headers.get("uniquehashkey") ||
    "";

  const clientId =
    request.cookies.get("sop_client_id")?.value ||
    request.headers.get("x-client-id") ||
    request.headers.get("clientid") ||
    "3";

  // 2. Resolve target URL and target method from environment variables or blueprint fallback
  let targetUrl: string | null = null;
  let targetMethod: string = incomingMethod;
  let envKey = "UPES_API_BASE_URL";

  if (path.includes("profile")) {
    envKey = "UPES_PROFILE_URL";
    targetUrl =
      process.env.UPES_PROFILE_URL ||
      portalBlueprint.endpoints.profile.url ||
      "https://myupes-beta.upes.ac.in/apigateway/connect-portal/api/studentloginbasicinfo";
    targetMethod = "GET";
  } else if (path.includes("attendance")) {
    envKey = "UPES_ATTENDANCE_URL";
    targetUrl =
      process.env.UPES_ATTENDANCE_URL ||
      portalBlueprint.endpoints.attendance.url ||
      "https://myupes-beta.upes.ac.in/apigateway/student-attendance/studentattendancesummary";
    // UPES Attendance summary API requires POST method
    targetMethod = "POST";
  } else if (path.includes("timetable")) {
    envKey = "UPES_TIMETABLE_URL";
    targetUrl =
      process.env.UPES_TIMETABLE_URL ||
      portalBlueprint.endpoints.timetable.url ||
      "https://myupes-beta.upes.ac.in/apigateway/api/timetable";
    // UPES Timetable API requires POST method
    targetMethod = "POST";
  } else if (path.includes("grades") || path.includes("marks")) {
    envKey = "UPES_GRADES_URL";
    targetUrl =
      process.env.UPES_GRADES_URL ||
      portalBlueprint.endpoints.grades?.url ||
      `https://myupes-beta.upes.ac.in/apigateway/connect-portal/api/studentprogramprogress/course-summary/${cookieStudentId}`;
    targetMethod = "GET";
  } else if (path.includes("lms/sso")) {
    envKey = "UPES_LMS_SSO_URL";
    targetUrl = "https://myupes-beta.upes.ac.in/sso/user/oauth2/access-lms";
    targetMethod = "POST";
  } else if (path.includes("lms") || path.includes("courses")) {
    envKey = "UPES_LMS_URL";
    targetUrl =
      process.env.UPES_LMS_URL ||
      portalBlueprint.endpoints.lms?.courses?.url ||
      `https://myupes-beta.upes.ac.in/apigateway/connect-portal/api/studentprogramprogress/course-summary/${cookieStudentId}`;
    targetMethod = "GET";
  } else if (path.includes("finance") || path.includes("fees")) {
    envKey = "UPES_FINANCE_URL";
    targetUrl =
      process.env.UPES_FINANCE_URL ||
      portalBlueprint.endpoints.finance?.url ||
      `https://myupes-beta.upes.ac.in/apigateway/financeintegrations/api/getstudentschedulepaywithdueamt?StudentID=${cookieStudentId}`;
    targetMethod = "GET";
  } else if (path.includes("calendar") || path.includes("events")) {
    envKey = "UPES_CALENDAR_URL";
    targetUrl =
      process.env.UPES_CALENDAR_URL ||
      portalBlueprint.endpoints.calendar?.url ||
      "https://myupes-beta.upes.ac.in/apigateway/api/calendareventlist";
    targetMethod = "POST";
  } else if (path.includes("notifications")) {
    envKey = "UPES_NOTIFICATIONS_URL";
    targetUrl = `https://myupes-beta.upes.ac.in/apigateway/notification/bell/fetch/slcm/${sapId}/30/0`;
    targetMethod = "GET";
  } else if (path.includes("hostel")) {
    envKey = "UPES_HOSTEL_URL";
    targetUrl =
      portalBlueprint.endpoints.hostel?.url ||
      "https://myupes-beta.upes.ac.in/apigateway/hostel/api/roomallocation/getstudentsallocation";
    targetMethod = "POST";
  }

  // Fallback to custom target header/query or UPES_API_BASE_URL
  const customTarget = request.headers.get("x-target-url") || searchParams.get("target");
  if (customTarget) {
    targetUrl = `${customTarget.replace(/\/$/, "")}/${path}`;
  } else if (!targetUrl) {
    const baseApi =
      process.env.UPES_API_BASE_URL ||
      portalBlueprint.portalMetadata.portalUrl ||
      "https://myupes-beta.upes.ac.in";
    targetUrl = `${baseApi.replace(/\/$/, "")}/${path}`;
  }

  // Replace placeholders in URL
  targetUrl = targetUrl
    .replace(/\{\{studentId\}\}/g, cookieStudentId)
    .replace(/\{\{emailId\}\}/g, studentEmail)
    .replace(/\{\{termCode\}\}/g, termCode);

  // If targetUrl is relative, prepend portal base URL so fetch() never fails in Node.js
  if (targetUrl.startsWith("/")) {
    targetUrl = `https://myupes-beta.upes.ac.in${targetUrl}`;
  }

  // 3. Construct Forward Headers matching UPES portal expectations
  const authHeader = cookieSession
    ? `Bearer ${cookieSession}`
    : request.headers.get("authorization") || request.headers.get("x-session-token");

  const forwardHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    Accept: "application/json, text/plain, */*",
    Origin: "https://myupes-beta.upes.ac.in",
    Referer: "https://myupes-beta.upes.ac.in/",
    "x-applicationname": "connectportal",
    "x-requestfrom": "web",
  };

  if (authHeader) {
    forwardHeaders["Authorization"] = authHeader.startsWith("Bearer ")
      ? authHeader
      : `Bearer ${authHeader}`;
  }
  if (uniqueHashKey) {
    forwardHeaders["UniqueHashKey"] = uniqueHashKey;
    forwardHeaders["X-Unique-Hash-Key"] = uniqueHashKey;
  }
  if (clientId) {
    forwardHeaders["ClientId"] = clientId;
    forwardHeaders["X-Client-Id"] = clientId;
  }
  if (sapId) {
    forwardHeaders["X-SAP-ID"] = sapId;
  }
  if (cookieStudentId) {
    forwardHeaders["X-Student-Id"] = cookieStudentId;
    forwardHeaders["x-studentuniqueid"] = cookieStudentId;
    forwardHeaders["X-Student-Unique-Id"] = cookieStudentId;
  }
  if (studentEmail) {
    forwardHeaders["X-Student-Email"] = studentEmail;
  }

  // Forward cookies for UPES microservices (connect-portal, attendance, timetable)
  const cookieJar: string[] = [];
  if (cookieSession) {
    cookieJar.push(`sop_session=${cookieSession}`);
    cookieJar.push(`AuthToken=${cookieSession}`);
  }
  if (uniqueHashKey) {
    cookieJar.push(`UniqueHashKey=${uniqueHashKey}`);
  }
  if (clientId) {
    cookieJar.push(`ClientId=${clientId}`);
  }
  if (cookieStudentId) {
    cookieJar.push(`StudentId=${cookieStudentId}`);
  }
  if (cookieJar.length > 0) {
    forwardHeaders["Cookie"] = cookieJar.join("; ");
  }

  // 4. Construct Request Body for POST requests
  let bodyData: BodyInit | undefined = undefined;
  if (targetMethod === "POST" || targetMethod === "PUT") {
    forwardHeaders["Content-Type"] = "application/json";
    if (incomingMethod === "POST" || incomingMethod === "PUT") {
      try {
        const clientBody = await request.text();
        if (clientBody && clientBody.trim().length > 0) {
          bodyData = clientBody;
        }
      } catch {
        // use default payload
      }
    }

    if (!bodyData) {
      if (path.includes("timetable")) {
        // UPES Timetable payload structure
        bodyData = JSON.stringify({
          ActivityCode: "EXAM_PRO",
          TimeTableContextDetails: {},
          StudentId: cookieStudentId,
          studentId: cookieStudentId,
          StudentUniqueId: cookieStudentId,
          studentUniqueId: cookieStudentId,
          TermCode: termCode,
          termCode,
          SapId: sapId,
          sapId,
        });
      } else {
        // Synthesize the standard UPES POST payload with both PascalCase & camelCase compatibility
        bodyData = JSON.stringify({
          StudentId: cookieStudentId,
          studentId: cookieStudentId,
          StudentUniqueId: cookieStudentId,
          studentUniqueId: cookieStudentId,
          SelectedStudentId: cookieStudentId,
          TermCode: termCode,
          termCode,
          SapId: sapId,
          sapId,
          Email: studentEmail,
          email: studentEmail,
          ActivityCode: "EXAM_PRO",
        });
      }
    }
  }

  // 5. Execute live fetch to UPES API with 8s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      method: targetMethod,
      headers: forwardHeaders,
      body: bodyData,
      signal: controller.signal,
    }).catch((fetchErr) => {
      console.warn(`UPES live fetch error [${targetMethod} ${targetUrl}]:`, fetchErr.message);
      return null;
    });

    clearTimeout(timeoutId);

    const durationMs = Math.max(1, Math.round(performance.now() - startTime));

    // If external service returned error status or connection failed
    if (!response || !response.ok) {
      let rawSnippet = "No response from UPES server (Connection timeout or network blocked)";
      if (response) {
        try {
          const rawText = await response.text();
          rawSnippet = rawText.slice(0, 300);
        } catch {
          rawSnippet = `HTTP Status: ${response.status} ${response.statusText}`;
        }
      }

      return NextResponse.json(
        {
          isConfigured: true,
          targetUrl,
          requestedPath: path,
          method: targetMethod,
          durationMs,
          statusCode: response?.status || 504,
          statusText: response?.statusText || "Gateway Timeout",
          rawSnippet,
          message: response
            ? `Target ${envKey} responded with status ${response.status} (${response.statusText}).`
            : `Network timeout reaching ${targetUrl}.`,
          diagnostic: {
            targetUrl,
            method: targetMethod,
            statusCode: response?.status || 504,
            statusText: response?.statusText || "Timeout / Unreachable",
            rawSnippet,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200, // Return 200 so UI can gracefully display the Live Diagnostic panel
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
        diagnostic: {
          targetUrl,
          method: targetMethod,
          statusCode: 500,
          statusText: error.name || "Internal Proxy Error",
          rawSnippet: error.message || "Unknown proxy failure",
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Response-Time": `${durationMs}ms`,
        },
      }
    );
  }
}

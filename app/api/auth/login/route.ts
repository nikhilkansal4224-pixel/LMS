import { NextRequest, NextResponse } from "next/server";
import {
  mapLoginPayload,
  normalizeUpesEmail,
  extractStudentDetailsFromEmail,
  UpesIdentityResponse,
} from "@/lib/upes-auth";
import portalBlueprint from "@/config/portal-blueprint.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, captchaToken, isDemo } = body;

    // Handle Demo Mode explicitly
    if (isDemo) {
      const response = NextResponse.json({
        success: true,
        isDemo: true,
        message: "Logged in with Demo Account",
        user: {
          FirstName: "Nikhil",
          LastName: "Sharma",
          GlobalId: "590039697",
          EmailId: "Nikhil.39697@stu.upes.ac.in",
          ProgramTypeName: "B.Tech Computer Science and Engineering — Global Pathway",
          TermName: "SEM 01",
        },
      });

      // Set cookies
      response.cookies.set("sop_session", "demo-token-session-upes-2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      response.cookies.set("sop_mode", "demo", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("sop_sap_id", "590039697", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("sop_unique_hash", "demo-hash-key-39697", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("sop_client_id", "3", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your UPES Student Email and Password" },
        { status: 400 }
      );
    }

    // Server-side normalization: automatically append @stu.upes.ac.in if no @ is present
    const normalizedEmail = normalizeUpesEmail(username);
    const { firstName, sapId } = extractStudentDetailsFromEmail(normalizedEmail);

    // Default to blueprint URLs if process.env is not configured
    const upesAuthUrl =
      process.env.UPES_AUTH_URL ||
      portalBlueprint.endpoints.auth.login.url ||
      "https://myupes-beta.upes.ac.in/sso/api/account/oauth2/token";
    const tokenExchangeUrl =
      process.env.UPES_TOKEN_EXCHANGE_URL ||
      portalBlueprint.endpoints.auth.tokenExchange.url ||
      "https://myupes-beta.upes.ac.in/sso/oauth2/validate/token";
    const profileUrl =
      process.env.UPES_PROFILE_URL ||
      portalBlueprint.endpoints.profile.url ||
      "https://myupes-beta.upes.ac.in/apigateway/connect-portal/api/studentloginbasicinfo";

    const appSecret =
      process.env.UPES_CONNECT_APP_SECRET || "ku7GUMtyT8er51rTfTc7HC";

    let accessToken: string | null = null;
    let userInfo: any = null;
    let rawResponseData: any = null;
    let studentId: string | null = null;
    let termCode: string = "SEM_01";
    let uniqueHashKey: string | null = null;
    let clientId: string = "3";

    if (upesAuthUrl) {
      const payload = mapLoginPayload({
        username: normalizedEmail,
        password,
        captchaToken,
      });

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const authResponse = await fetch(upesAuthUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            Origin: "https://myupes-beta.upes.ac.in",
            Referer: "https://myupes-beta.upes.ac.in/",
            "x-applicationname": "connectportal",
            "x-requestfrom": "web",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (authResponse.ok) {
          rawResponseData = (await authResponse.json()) as UpesIdentityResponse;

          // Check if response already has Item.Identity.AccessToken
          if (rawResponseData?.Item?.Identity?.AccessToken) {
            accessToken = rawResponseData.Item.Identity.AccessToken;
            userInfo = rawResponseData.Item.UserInfo;
          } else if (rawResponseData?.AccessToken) {
            accessToken = rawResponseData.AccessToken;
            userInfo = rawResponseData.UserInfo || rawResponseData.User;
          }

          // If response has a redirectUrl with code or Item.Code
          const redirectUrl = rawResponseData?.Item?.redirectUrl || rawResponseData?.redirectUrl;
          let authCode = rawResponseData?.Item?.Code || rawResponseData?.code;
          if (!authCode && redirectUrl) {
            const match = redirectUrl.match(/[?&]code=([^&]+)/);
            if (match) {
              authCode = decodeURIComponent(match[1]);
            }
          }

          if (!accessToken && authCode && tokenExchangeUrl) {
            try {
              const exchangeRes = await fetch(tokenExchangeUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json, text/plain, */*",
                  Origin: "https://myupes-beta.upes.ac.in",
                  Referer: "https://myupes-beta.upes.ac.in/",
                },
                body: JSON.stringify({ code: authCode, clientId: 3 }),
              });

              if (exchangeRes.ok) {
                const exchangeData = await exchangeRes.json();
                if (exchangeData?.Item?.Identity?.AccessToken) {
                  accessToken = exchangeData.Item.Identity.AccessToken;
                  userInfo = exchangeData.Item.UserInfo;
                } else if (exchangeData?.AccessToken) {
                  accessToken = exchangeData.AccessToken;
                  userInfo = exchangeData.UserInfo;
                }
              }
            } catch (err: any) {
              console.warn("Token exchange error:", err.message);
            }
          }

          // Step 1.5: Validate token with UPES Identity Server to obtain UniqueHashKey and ClientId
          if (accessToken && tokenExchangeUrl) {
            try {
              const validateRes = await fetch(tokenExchangeUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json, text/plain, */*",
                  Origin: "https://myupes-beta.upes.ac.in",
                  Referer: "https://myupes-beta.upes.ac.in/connectportal/user/student/home/dashboard",
                  "x-applicationname": "connectportal",
                  "x-appsecret": appSecret,
                  "x-requestfrom": "web",
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
                },
                body: JSON.stringify({
                  AuthToken: accessToken,
                  UniqueId: "",
                }),
              });

              if (validateRes.ok) {
                const validateData = await validateRes.json();
                const vItem = validateData?.Item || validateData?.data || validateData;
                if (vItem) {
                  if (vItem.UniqueHashKey) uniqueHashKey = String(vItem.UniqueHashKey);
                  if (vItem.ClientId) clientId = String(vItem.ClientId);
                  if (vItem.UserId && !userInfo?.UserId) {
                    if (!userInfo) userInfo = {};
                    userInfo.UserId = vItem.UserId;
                  }
                  if (vItem.FirstName && !userInfo?.FirstName) {
                    if (!userInfo) userInfo = {};
                    userInfo.FirstName = vItem.FirstName;
                  }
                }
              }
            } catch (valErr: any) {
              console.warn("UPES validate/token call failed:", valErr.message);
            }
          }

          // Step 2: Fetch Student Profile immediately using AccessToken + UniqueHashKey + ClientId
          if (accessToken && profileUrl) {
            try {
              const profileHeaders: Record<string, string> = {
                Authorization: `Bearer ${accessToken}`,
                Origin: "https://myupes-beta.upes.ac.in",
                Referer: "https://myupes-beta.upes.ac.in/connectportal/user/student/home/dashboard",
                Accept: "application/json, text/plain, */*",
                "x-applicationname": "connectportal",
                "x-appsecret": appSecret,
                "x-requestfrom": "web",
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
              };

              if (uniqueHashKey) {
                profileHeaders["UniqueHashKey"] = uniqueHashKey;
                profileHeaders["X-Unique-Hash-Key"] = uniqueHashKey;
              }
              if (clientId) {
                profileHeaders["ClientId"] = clientId;
                profileHeaders["X-Client-Id"] = clientId;
              }

              const cookieList = [`sop_session=${accessToken}`, `AuthToken=${accessToken}`];
              if (uniqueHashKey) cookieList.push(`UniqueHashKey=${uniqueHashKey}`);
              if (clientId) cookieList.push(`ClientId=${clientId}`);
              profileHeaders["Cookie"] = cookieList.join("; ");

              const profileRes = await fetch(profileUrl, {
                method: "GET",
                headers: profileHeaders,
              });

              if (profileRes.ok) {
                const profileJson = await profileRes.json();
                const pItem = profileJson?.Item || profileJson?.data || profileJson;
                if (pItem) {
                  studentId =
                    pItem.StudentId ||
                    pItem.StudentGuid ||
                    pItem.Id ||
                    pItem.UserId ||
                    null;
                  termCode =
                    pItem.CurrentTermCode ||
                    pItem.TermCode ||
                    pItem.TermName ||
                    "SEM_01";
                  if (!userInfo) userInfo = pItem;
                  else Object.assign(userInfo, pItem);
                }
              }
            } catch (err: any) {
              console.warn("Could not pre-fetch student profile during login:", err.message);
            }
          }
        }
      } catch (err: any) {
        console.warn("UPES live authentication server unavailable:", err.message);
      }
    }

    // Fallback for development/testing when UPES server is not reachable
    if (!accessToken) {
      accessToken = `upes-token-${Buffer.from(normalizedEmail).toString("base64")}-${Date.now()}`;
      studentId = studentId || "6349e408-1096-483e-82d0-64587e70b025";
      uniqueHashKey = uniqueHashKey || "demo-hash-key-39697";
      userInfo = {
        UserId: 89466,
        StudentId: studentId,
        EmailId: normalizedEmail,
        FirstName: firstName,
        LastName: "Sharma",
        GlobalId: sapId,
        UserTypeInfo: { Code: "ST", DisplayName: "Student" },
      };
    } else if (userInfo) {
      if (!userInfo.EmailId) {
        userInfo.EmailId = normalizedEmail;
      }
      if (!userInfo.GlobalId) {
        userInfo.GlobalId = sapId;
      }
      if (studentId) {
        userInfo.StudentId = studentId;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: userInfo,
      emailId: normalizedEmail,
      sapId: userInfo?.GlobalId || sapId,
      studentId: studentId || userInfo?.StudentId || "",
      termCode,
      uniqueHashKey: uniqueHashKey || "",
      clientId: clientId || "3",
      hasLiveToken: Boolean(rawResponseData?.Item?.Identity?.AccessToken || rawResponseData?.AccessToken),
    });

    // Save secure httpOnly cookie
    response.cookies.set("sop_session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set student UUID, sapId, termCode, uniqueHashKey, clientId, and email cookies
    if (studentId) {
      response.cookies.set("sop_student_id", studentId, {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (uniqueHashKey) {
      response.cookies.set("sop_unique_hash", uniqueHashKey, {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    response.cookies.set("sop_client_id", clientId || "3", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("sop_sap_id", userInfo?.GlobalId || sapId, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("sop_term_code", termCode, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("sop_email", normalizedEmail, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login authentication failed" },
      { status: 500 }
    );
  }
}

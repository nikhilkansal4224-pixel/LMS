// ============================================================================
// UPES Login Payload Key Mapper & Normalization Helpers
// Customize this mapping to match UPES SLCM request body keys
// ============================================================================
export const mapLoginPayload = (credentials: {
  username: string;
  password: string;
  captchaToken?: string;
}) => ({
  UserId: credentials.username,
  UserName: credentials.username,
  Password: credentials.password,
  Captcha: credentials.captchaToken || "",
  CaptchaResponse: credentials.captchaToken || "",
  RememberMe: true,
  GrantType: "password",
  ClientId: 3,
});

export function normalizeUpesEmail(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";
  if (!trimmed.includes("@")) {
    return `${trimmed}@stu.upes.ac.in`;
  }
  return trimmed;
}

export function extractStudentDetailsFromEmail(email: string): {
  firstName: string;
  sapId: string;
} {
  const prefix = email.split("@")[0] || "";
  const parts = prefix.split(".");
  const rawFirst = parts[0] || "Nikhil";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1);
  const numMatch = prefix.match(/\d+/);
  const sapId = numMatch
    ? numMatch[0].length < 9
      ? `5900${numMatch[0]}`
      : numMatch[0]
    : "590039697";
  return { firstName, sapId };
}

export interface UpesIdentityResponse {
  StatusCode: number;
  Item?: {
    Identity?: {
      clientId?: number;
      AccessToken: string;
      RefreshToken?: string;
      Scope?: string;
      TokenType?: string;
      ExpiresIn?: number;
    };
    UserInfo?: {
      UserId?: number;
      EmailId?: string;
      FirstName?: string;
      MiddleName?: string;
      LastName?: string;
      UserTypeInfo?: { Code?: string; DisplayName?: string };
      MobileNumber?: string;
      DateOfBirth?: string;
      ProfilePicture?: string;
    };
    Code?: string;
  };
  Message?: string;
}

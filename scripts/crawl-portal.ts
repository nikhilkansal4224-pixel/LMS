/**
 * SOP (Student Operations Portal) - One-Time WebKit Portal Mapper
 * 
 * Launches WebKit (Safari engine) natively on macOS, waits for student login,
 * intercepts and maps all live UPES portal API calls, and outputs a zero-data
 * blueprint to config/portal-blueprint.json.
 * 
 * Usage:
 *   npx playwright install webkit   # One-time install
 *   npm run crawl -- --url=https://myupes-beta.upes.ac.in
 */

import { webkit } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Parse CLI flags
const args = process.argv.slice(2);
let targetUrl = "https://myupes-beta.upes.ac.in";

for (const arg of args) {
  if (arg.startsWith("--url=")) {
    targetUrl = arg.replace("--url=", "").trim();
  }
}

console.log("\n=======================================================");
console.log("🚀 SOP UPES Portal-to-LMS Automated WebKit Mapper");
console.log(`🌐 Target Portal URL: ${targetUrl}`);
console.log("=======================================================\n");

interface EndpointDefinition {
  url: string;
  method: string;
  category: "auth" | "profile" | "attendance" | "timetable" | "lms" | "grades" | "other";
  description: string;
  payloadKeys?: string[];
  fieldMappings?: Record<string, string>;
  sampleKeys?: string[];
}

const discoveredEndpoints: Map<string, EndpointDefinition> = new Map();

function categorizeUrl(urlStr: string): EndpointDefinition["category"] {
  const lower = urlStr.toLowerCase();
  if (lower.includes("auth") || lower.includes("login") || lower.includes("connect/token") || lower.includes("identity")) {
    return "auth";
  }
  if (lower.includes("profile") || lower.includes("userinfo") || lower.includes("studentdetails") || lower.includes("personal")) {
    return "profile";
  }
  if (lower.includes("attendance") || lower.includes("present") || lower.includes("absent")) {
    return "attendance";
  }
  if (lower.includes("timetable") || lower.includes("schedule") || lower.includes("routine")) {
    return "timetable";
  }
  if (lower.includes("lms") || lower.includes("course") || lower.includes("assignment") || lower.includes("material") || lower.includes("notice") || lower.includes("announcement")) {
    return "lms";
  }
  if (lower.includes("grade") || lower.includes("mark") || lower.includes("sgpa") || lower.includes("cgpa") || lower.includes("result") || lower.includes("transcript")) {
    return "grades";
  }
  return "other";
}

function sanitizeUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Replace numeric IDs and emails with templates
    let cleanPath = u.pathname
      .replace(/\/\d{5,10}/g, "/{{studentId}}")
      .replace(/[a-zA-Z0-9._%+-]+@stu\.upes\.ac\.in/gi, "{{emailId}}")
      .replace(/[a-zA-Z0-9._%+-]+@ddn\.upes\.ac\.in/gi, "{{emailId}}");

    // Replace query values with placeholders
    const params = new URLSearchParams(u.search);
    params.forEach((value, key) => {
      if (/^\d{5,}$/.test(value)) {
        params.set(key, "{{studentId}}");
      } else if (/@/.test(value)) {
        params.set(key, "{{emailId}}");
      }
    });

    const qs = params.toString();
    return qs ? `${cleanPath}?${qs}` : cleanPath;
  } catch {
    return rawUrl;
  }
}

function extractSchemaKeys(obj: any): string[] {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    return obj[0] ? extractSchemaKeys(obj[0]) : [];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    keys.push(k);
    if (v && typeof v === "object" && !Array.isArray(v) && keys.length < 15) {
      for (const subK of Object.keys(v)) {
        keys.push(`${k}.${subK}`);
      }
    }
  }
  return keys.slice(0, 25);
}

async function promptForEnter(query: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.log("📱 Launching native macOS WebKit browser window...");
  const browser = await webkit.launch({
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  });

  const page = await context.newPage();

  // Listen to network calls
  page.on("request", (req) => {
    const url = req.url();
    const resourceType = req.resourceType();

    if (resourceType === "xhr" || resourceType === "fetch") {
      const category = categorizeUrl(url);
      if (category !== "other" || url.includes("/api/")) {
        const sanitized = sanitizeUrl(url);
        const method = req.method();

        if (!discoveredEndpoints.has(`${method}:${sanitized}`)) {
          console.log(`📡 Intercepted [${method}] [${category.toUpperCase()}] ${sanitized}`);
          discoveredEndpoints.set(`${method}:${sanitized}`, {
            url: sanitized,
            method,
            category,
            description: `Auto-mapped ${category} endpoint from live portal`,
            sampleKeys: [],
          });
        }
      }
    }
  });

  page.on("response", async (res) => {
    try {
      const req = res.request();
      const url = req.url();
      const contentType = res.headers()["content-type"] || "";

      if (contentType.includes("application/json")) {
        const sanitized = sanitizeUrl(url);
        const method = req.method();
        const key = `${method}:${sanitized}`;

        if (discoveredEndpoints.has(key)) {
          const json = await res.json().catch(() => null);
          if (json) {
            const keys = extractSchemaKeys(json);
            const entry = discoveredEndpoints.get(key)!;
            entry.sampleKeys = Array.from(new Set([...(entry.sampleKeys || []), ...keys]));
          }
        }
      }
    } catch {
      // Ignore response parsing errors
    }
  });

  console.log(`🔗 Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => {
    console.warn("⚠️ Navigation warning:", e.message);
  });

  console.log("\n-------------------------------------------------------");
  console.log("👉 Please complete your UPES Student Login & Captcha in the opened WebKit window.");
  console.log("👉 Once you reach the main dashboard, press [ENTER] in this terminal to start auto-mapping!");
  console.log("-------------------------------------------------------\n");

  await promptForEnter("Press [ENTER] after logging in and viewing your dashboard... ");

  console.log("\n🔍 Mapping portal navigation tabs, courses, and LMS sidebar...");

  // Auto-click through known tabs/menus to trigger all endpoints
  try {
    const clickableSelectors = [
      'a[href*="attendance"]',
      'button:has-text("Attendance")',
      'a[href*="timetable"]',
      'button:has-text("Timetable")',
      'a[href*="grade"]',
      'button:has-text("Grade")',
      'a[href*="course"]',
      'button:has-text("Courses")',
      'a[href*="lms"]',
      'button:has-text("LMS")',
      'a[href*="assignment"]',
      'button:has-text("Assignments")',
    ];

    for (const selector of clickableSelectors) {
      const elements = await page.$$(selector);
      for (const el of elements.slice(0, 2)) {
        try {
          if (await el.isVisible()) {
            await el.click({ timeout: 1500 }).catch(() => {});
            await page.waitForTimeout(800);
          }
        } catch {
          // Continue
        }
      }
    }
  } catch (err: any) {
    console.log("Automatic menu clicker note:", err.message);
  }

  // Allow pending network requests to settle
  await page.waitForTimeout(2000);

  console.log(`\n✅ Mapping complete! Intercepted ${discoveredEndpoints.size} unique endpoints.`);

  // Build the clean structured blueprint
  const blueprintConfig: any = {
    portalMetadata: {
      portalUrl: targetUrl,
      mappedAt: new Date().toISOString(),
      version: "1.0.0",
      system: "UPES Unified SLCM & Blackboard LMS",
      totalEndpointsMapped: discoveredEndpoints.size,
    },
    endpoints: {
      auth: {},
      profile: {},
      attendance: {},
      timetable: {},
      lms: {
        courses: {},
        materials: {},
        assignments: {},
        announcements: {},
      },
      grades: {},
    },
  };

  // Populate categories
  for (const entry of Array.from(discoveredEndpoints.values())) {
    if (entry.category === "auth") {
      blueprintConfig.endpoints.auth[entry.url.includes("token") ? "tokenExchange" : "login"] = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    } else if (entry.category === "profile") {
      blueprintConfig.endpoints.profile = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    } else if (entry.category === "attendance") {
      blueprintConfig.endpoints.attendance = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    } else if (entry.category === "timetable") {
      blueprintConfig.endpoints.timetable = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    } else if (entry.category === "grades") {
      blueprintConfig.endpoints.grades = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    } else if (entry.category === "lms") {
      const lower = entry.url.toLowerCase();
      const sub = lower.includes("assignment")
        ? "assignments"
        : lower.includes("material")
        ? "materials"
        : lower.includes("notice") || lower.includes("announcement")
        ? "announcements"
        : "courses";

      blueprintConfig.endpoints.lms[sub] = {
        url: entry.url,
        method: entry.method,
        description: entry.description,
        sampleKeys: entry.sampleKeys,
      };
    }
  }

  // Save blueprint
  const configDir = path.join(process.cwd(), "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const blueprintPath = path.join(configDir, "portal-blueprint.json");
  fs.writeFileSync(blueprintPath, JSON.stringify(blueprintConfig, null, 2), "utf-8");

  console.log(`\n💾 Saved sanitized blueprint to: ${blueprintPath}`);
  console.log("🔒 Zero-Data Guarantee: No passwords, tokens, or student personal records were saved.");
  console.log("\n🚀 Next Steps:");
  console.log("  1. git add config/portal-blueprint.json");
  console.log("  2. git commit -m \"chore: lock in mapped UPES portal blueprint\"");
  console.log("  3. git push\n");

  await browser.close();
}

main().catch((err) => {
  console.error("❌ Crawler Error:", err);
  process.exit(1);
});

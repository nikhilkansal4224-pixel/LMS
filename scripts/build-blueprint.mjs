import fs from 'fs';
import path from 'path';

const harPath = path.resolve('myupes-beta.upes.ac.in.har');
console.log(`Parsing HAR from ${harPath}...`);

const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
const entries = har.log.entries || [];

const staticExts = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.map', '.otf'];

const sanitizedStudentId = '{{studentId}}';
const sanitizedUserId = '{{userId}}';
const sanitizedEmail = '{{emailId}}';
const sanitizedName = '{{studentName}}';
const sanitizedToken = '{{accessToken}}';
const sanitizedHash = '{{uniqueHashKey}}';
const sanitizedCode = '{{authCode}}';

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/6349e408-1096-483e-82d0-64587e70b025/gi, sanitizedStudentId)
    .replace(/5fe52628-6e97-424b-a35a-62b3c29b5a62/gi, '{{uniqueId}}')
    .replace(/89466/g, sanitizedUserId)
    .replace(/590039697/g, '{{sapId}}')
    .replace(/26010101498/g, '{{applicationNo}}')
    .replace(/9812742224/g, '{{mobileNo}}')
    .replace(/Nikhil\.39697@stu\.upes\.ac\.in/gi, sanitizedEmail)
    .replace(/Nikhil/gi, sanitizedName)
    .replace(/6f11b1b041c84b9d8b3976d602f94082/gi, sanitizedCode)
    .replace(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, sanitizedToken)
    .replace(/jd5wH\+7SgcqHSp8iYRspua30DW3mj7mFJ5\+R3vw8eT\/2dpcu8SsR\/g==/g, sanitizedHash)
    .replace(/807500Nk\$/g, '{{password}}');
}

function sanitizeObject(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeObject(v);
    }
    return res;
  }
  return obj;
}

const classifiedEndpoints = [];

for (const entry of entries) {
  const req = entry.request;
  const res = entry.response;
  const url = req.url;

  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  if (staticExts.some(ext => pathname.endsWith(ext))) continue;
  if (url.includes('razorpay.com') || url.includes('google') || url.includes('doubleclick')) continue;
  if (!url.includes('upes.ac.in')) continue;

  // Extract clean headers
  const reqHeaders = {};
  for (const h of req.headers || []) {
    const key = h.name.toLowerCase();
    if (
      key.startsWith('x-') ||
      key === 'authorization' ||
      key === 'uniquehashkey' ||
      key === 'clientid' ||
      key === 'content-type' ||
      key === 'accept' ||
      key === 'referer' ||
      key === 'origin'
    ) {
      reqHeaders[h.name] = sanitizeString(h.value);
    }
  }

  let postPayload = null;
  if (req.postData && req.postData.text) {
    try {
      postPayload = sanitizeObject(JSON.parse(req.postData.text));
    } catch {
      postPayload = sanitizeString(req.postData.text);
    }
  }

  let resJson = null;
  if (res.content && res.content.text) {
    try {
      resJson = sanitizeObject(JSON.parse(res.content.text));
    } catch {
      resJson = sanitizeString(res.content.text.slice(0, 300));
    }
  }

  const sanitizedUrl = sanitizeString(req.url);
  const sanitizedPath = sanitizeString(urlObj.pathname);

  classifiedEndpoints.push({
    method: req.method,
    url: sanitizedUrl,
    originalPath: sanitizedPath,
    status: res.status,
    headers: Object.keys(reqHeaders),
    sampleHeaders: reqHeaders,
    requestPayloadTemplate: postPayload,
    sampleResponse: resJson,
  });
}

// Group into sections
const sections = {
  auth: [],
  profile: [],
  attendance: [],
  timetable: [],
  lms: [],
  finance: [],
  notifications: [],
  realtime: []
};

for (const item of classifiedEndpoints) {
  const p = item.originalPath.toLowerCase();
  if (p.includes('/sso/') || p.includes('/auth/login')) {
    sections.auth.push(item);
  } else if (p.includes('studentloginbasicinfo') || p.includes('storage/downloadfile') || p.includes('featureaccess')) {
    sections.profile.push(item);
  } else if (p.includes('attendance')) {
    sections.attendance.push(item);
  } else if (p.includes('timetable')) {
    sections.timetable.push(item);
  } else if (p.includes('course-summary') || p.includes('studentprogramprogress')) {
    sections.lms.push(item);
  } else if (p.includes('finance') || p.includes('payment')) {
    sections.finance.push(item);
  } else if (p.includes('notification/bell')) {
    sections.notifications.push(item);
  } else if (p.includes('signalr')) {
    sections.realtime.push(item);
  }
}

// Deduplicate inside each section
for (const secKey of Object.keys(sections)) {
  const map = new Map();
  for (const ep of sections[secKey]) {
    const key = `${ep.method} ${ep.originalPath}`;
    if (!map.has(key)) {
      map.set(key, ep);
    }
  }
  sections[secKey] = Array.from(map.values());
}

const fullBlueprint = {
  portalMetadata: {
    portalUrl: "https://myupes-beta.upes.ac.in",
    mappedAt: new Date().toISOString(),
    sourceHar: "myupes-beta.upes.ac.in.har",
    version: "3.0.0",
    system: "UPES Unified Connect Portal (Live Safari Har Recording)",
    description: "Exact, verified microservices, payloads, headers, and response schemas captured from Safari.",
    connectPortalHeaders: {
      "Origin": "https://myupes-beta.upes.ac.in",
      "Referer": "https://myupes-beta.upes.ac.in/connectportal/user/student/home/dashboard",
      "Accept": "application/json, text/plain, */*",
      "x-applicationname": "connectportal",
      "x-requestfrom": "web",
      "x-appsecret": "ku7GUMtyT8er51rTfTc7HC",
      "x-studentUniqueId": "{{studentId}}"
    }
  },
  sections
};

fs.writeFileSync('config/upes-full-blueprint.json', JSON.stringify(fullBlueprint, null, 2));
console.log('Successfully generated config/upes-full-blueprint.json!');

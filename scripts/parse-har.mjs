import fs from 'fs';
import path from 'path';

const harPath = path.resolve('myupes-beta.upes.ac.in.har');
console.log(`Reading HAR from ${harPath}...`);

const harRaw = fs.readFileSync(harPath, 'utf8');
const har = JSON.parse(harRaw);
const entries = har.log.entries || [];

console.log(`Total entries: ${entries.length}`);

// Filter out static assets
const staticExts = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.map'];

const apiEntries = [];

for (const entry of entries) {
  const req = entry.request;
  const res = entry.response;
  const url = req.url;

  // Ignore static assets
  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  if (staticExts.some(ext => pathname.endsWith(ext))) continue;
  if (url.includes('razorpay.com')) continue;
  if (url.includes('google-analytics.com') || url.includes('googletagmanager.com')) continue;

  if (!url.includes('upes.ac.in')) continue;

  // Get relevant headers
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
      reqHeaders[h.name] = h.value;
    }
  }

  // Get POST body
  let postData = null;
  if (req.postData && req.postData.text) {
    try {
      postData = JSON.parse(req.postData.text);
    } catch {
      postData = req.postData.text;
    }
  }

  // Get response body
  let resData = null;
  if (res.content && res.content.text) {
    try {
      resData = JSON.parse(res.content.text);
    } catch {
      resData = res.content.text.slice(0, 200);
    }
  }

  apiEntries.push({
    method: req.method,
    url: req.url,
    pathname: urlObj.pathname,
    status: res.status,
    reqHeaders,
    postData,
    resDataSnippet: resData ? (typeof resData === 'object' ? Object.keys(resData) : String(resData).slice(0, 100)) : null,
    fullResData: resData,
  });
}

console.log(`Filtered API entries: ${apiEntries.length}`);

// Group by pathname and method
const uniqueEndpoints = new Map();

for (const e of apiEntries) {
  const key = `${e.method} ${e.pathname}`;
  if (!uniqueEndpoints.has(key)) {
    uniqueEndpoints.set(key, []);
  }
  uniqueEndpoints.get(key).push(e);
}

console.log(`Unique API Endpoints: ${uniqueEndpoints.size}`);

const summary = [];
for (const [key, items] of uniqueEndpoints.entries()) {
  const first = items[0];
  summary.push({
    endpoint: key,
    url: first.url,
    count: items.length,
    status: first.status,
    headers: Object.keys(first.reqHeaders),
    sampleHeaders: first.reqHeaders,
    hasPayload: Boolean(first.postData),
    samplePayload: first.postData,
    responseKeys: first.resDataSnippet,
    sampleResponse: first.fullResData,
  });
}

fs.writeFileSync('tmp-har-analysis.json', JSON.stringify(summary, null, 2));
console.log('Saved tmp-har-analysis.json');

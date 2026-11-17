import fs from 'fs';
import path from 'path';

const harPath = path.resolve('myupes-beta.upes.ac.in.har');
const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
const entries = har.log.entries || [];

const staticExts = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico', '.map', '.otf'];

function shortenTokens(val) {
  if (typeof val === 'string') {
    if (val.startsWith('eyJ') && val.length > 30) {
      return val.slice(0, 20) + '...[len ' + val.length + ']';
    }
    return val;
  }
  if (Array.isArray(val)) return val.map(shortenTokens);
  if (val && typeof val === 'object') {
    const copy = {};
    for (const [k, v] of Object.entries(val)) {
      copy[k] = shortenTokens(v);
    }
    return copy;
  }
  return val;
}

let idx = 0;
for (const entry of entries) {
  const req = entry.request;
  const res = entry.response;
  const url = req.url;

  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  if (staticExts.some(ext => pathname.endsWith(ext))) continue;
  if (url.includes('razorpay.com') || url.includes('google') || url.includes('doubleclick')) continue;
  if (!url.includes('upes.ac.in')) continue;

  idx++;
  console.log(`\n================================================================================`);
  console.log(`[#${idx}] ${req.method} ${req.url}`);
  console.log(`Status: ${res.status} ${res.statusText}`);

  // Headers
  const interestingHeaders = {};
  for (const h of req.headers || []) {
    const k = h.name.toLowerCase();
    if (
      k === 'authorization' ||
      k.startsWith('x-') ||
      k === 'cookie' ||
      k === 'uniquehashkey' ||
      k === 'clientid' ||
      k === 'referer' ||
      k === 'origin' ||
      k === 'content-type' ||
      k === 'accept'
    ) {
      interestingHeaders[h.name] = shortenTokens(h.value);
    }
  }
  console.log(`Headers:`, JSON.stringify(interestingHeaders, null, 2));

  // POST body
  if (req.postData && req.postData.text) {
    try {
      const parsed = JSON.parse(req.postData.text);
      console.log(`Request POST Body (JSON):`, JSON.stringify(shortenTokens(parsed), null, 2));
    } catch {
      console.log(`Request POST Body (Text):`, req.postData.text.slice(0, 300));
    }
  }

  // Response Content
  if (res.content && res.content.text) {
    try {
      const parsed = JSON.parse(res.content.text);
      const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : 'primitive';
      console.log(`Response JSON Keys:`, keys);
      console.log(`Response Snippet:`, JSON.stringify(shortenTokens(parsed), null, 2).slice(0, 400));
    } catch {
      console.log(`Response Snippet (Text):`, res.content.text.slice(0, 300));
    }
  }
}

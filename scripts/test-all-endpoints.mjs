import fs from 'fs';
import path from 'path';

// Extract valid live session token from HAR
const harPath = path.resolve('myupes-beta.upes.ac.in.har');
const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
const valCall = har.log.entries.find(e => e.request.url.includes('/sso/oauth2/validate/token'));
const liveJwt = valCall.request.headers.find(h => h.name.toLowerCase() === 'authorization')?.value?.replace('Bearer ', '');
const liveCookie = 'idp_session_info=5699f070-39c3-4fdd-b0a8-0216c678e433';
const studentId = '6349e408-1096-483e-82d0-64587e70b025';
const email = 'Nikhil.39697@stu.upes.ac.in';
const sapId = '590039697';

const cookieHeader = [
  `sop_session=${liveJwt}`,
  `sop_student_id=${studentId}`,
  `sop_email=${email}`,
  `sop_sap_id=${sapId}`,
  `sop_idp_session_info=5699f070-39c3-4fdd-b0a8-0216c678e433`,
  `sop_unique_hash=jd5wH+7SgcqHSp8iYRspua30DW3mj7mFJ5+R3vw8eT/2dpcu8SsR/g==`,
  `sop_client_id=3`,
  `sop_academic_year=AY 2026-27`,
  `sop_term_code=SEM_1`
].join('; ');

const endpoints = [
  { name: '1. Root Page (Dashboard)', url: 'http://localhost:3000/', method: 'GET', expectJson: false },
  { name: '2. Login Page', url: 'http://localhost:3000/login', method: 'GET', expectJson: false },
  { name: '3. Demo Login API', url: 'http://localhost:3000/api/auth/login', method: 'POST', body: { isDemo: true }, expectJson: true },
  { name: '4. Student Profile Proxy', url: 'http://localhost:3000/api/proxy/student/profile', method: 'GET', expectJson: true, useCookie: true },
  { name: '5. Student Attendance Proxy', url: 'http://localhost:3000/api/proxy/student/attendance', method: 'GET', expectJson: true, useCookie: true },
  { name: '6. Student Timetable Proxy', url: 'http://localhost:3000/api/proxy/student/timetable', method: 'GET', expectJson: true, useCookie: true },
  { name: '7. Student LMS / Courses Proxy', url: 'http://localhost:3000/api/proxy/student/lms', method: 'GET', expectJson: true, useCookie: true },
  { name: '8. Student Grades Proxy', url: 'http://localhost:3000/api/proxy/student/grades', method: 'GET', expectJson: true, useCookie: true },
  { name: '9. Student Finance / Fees Proxy', url: 'http://localhost:3000/api/proxy/student/finance', method: 'GET', expectJson: true, useCookie: true },
];

console.log('Testing SOP Portal Live Endpoints...\n');

async function run() {
  for (const ep of endpoints) {
    try {
      const headers = {};
      if (ep.useCookie) {
        headers['Cookie'] = cookieHeader;
      }
      if (ep.body) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body: ep.body ? JSON.stringify(ep.body) : undefined
      });

      console.log(`[PASS] ${ep.name} -> HTTP ${res.status} ${res.statusText}`);

      if (ep.expectJson) {
        const json = await res.json();
        if (ep.name.includes('Profile')) {
          const item = json.Item || (Array.isArray(json.Items) && json.Items[0]) || json;
          console.log(`       Student: ${item.FirstName} ${item.LastName || ''} | SAP: ${item.GlobalId} | Term: ${item.TermName || item.TermCode}`);
        } else if (ep.name.includes('Attendance')) {
          const count = Array.isArray(json) ? json.length : (Array.isArray(json.Item) ? json.Item.length : 0);
          console.log(`       Attendance Subjects count: ${count}`);
          if (Array.isArray(json) && json[0]) {
            console.log(`       First Subject: ${json[0].ModuleName} (${json[0].AttendancePercentage}%)`);
          }
        } else if (ep.name.includes('Timetable')) {
          const count = Array.isArray(json) ? json.length : 0;
          console.log(`       Timetable slots count: ${count}`);
          if (Array.isArray(json) && json[0]) {
            console.log(`       Sample Slot: ${json[0].DayofWeekDetails?.DayOfWeekName} ${json[0].SlotStartTime} - ${json[0].ModuleList?.[0]?.ModuleName}`);
          }
        } else if (ep.name.includes('LMS') || ep.name.includes('Grades')) {
          const prog = json.CourseProgressSummery || json;
          console.log(`       Program: ${prog.ProgramName} | CGPA: ${prog.CGPA} | Terms: ${prog.TaggedSemesters?.length || 0}`);
        } else if (ep.name.includes('Finance')) {
          const item = json.Item || json;
          console.log(`       Outstanding: ₹${item.OutstandingAmount} | Advance Credit: ₹${item.ExcessAmount}`);
        } else if (ep.name.includes('Demo Login')) {
          console.log(`       User: ${json.user?.FirstName} | Success: ${json.success}`);
        }
      }
    } catch (err) {
      console.log(`[FAIL] ${ep.name} -> Error: ${err.message}`);
    }
    console.log('');
  }
}

run();

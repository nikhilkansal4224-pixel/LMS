import {
  StudentProfile,
  AttendanceSubject,
  TimetableSlot,
  AcademicSemester,
  UpesProfilePictureInfo,
  LmsData,
  FinanceData,
  CalendarEvent,
} from "@/types/student";

/**
 * Defensive adapter to map UPES live Student Profile JSON into StudentProfile
 */
export function adaptProfilePayload(raw: any, fallbackEmail?: string): StudentProfile {
  if (!raw) {
    return {
      FirstName: "Student",
      LastName: "",
      GlobalId: "Pending Link",
      RollNo: "",
      ProgramTypeName: "B.Tech Computer Science & Engineering",
      CenterName: "Bidholi Campus, Dehradun",
      TermName: "SEM 01",
      AcademicYearName: "AY 2026–27",
      Email: fallbackEmail || "",
      ProfilePictureInfo: "",
    };
  }

  // Handle standard UPES wrapper { Item: { ... } } or { data: { ... } }
  const data = raw.Item || raw.data || raw.StudentProfile || raw;
  const userInfo = data.UserInfo || data;

  const firstName =
    userInfo.FirstName ||
    data.FirstName ||
    data.StudentName?.split(" ")[0] ||
    data.Name?.split(" ")[0] ||
    "Student";

  const lastName =
    userInfo.LastName ||
    data.LastName ||
    (data.StudentName?.split(" ").slice(1).join(" ")) ||
    "";

  const globalId = String(
    userInfo.UserId ||
    data.GlobalId ||
    data.SapId ||
    data.SAPID ||
    data.StudentId ||
    data.RollNo ||
    ""
  );

  const rollNo = String(data.RollNo || data.RollNumber || userInfo.RollNo || globalId);

  const programTypeName =
    data.ProgramTypeName ||
    data.ProgramName ||
    data.CourseName ||
    data.Degree ||
    "B.Tech Computer Science and Engineering — Global Pathway";

  const centerName =
    data.CenterName ||
    data.CampusName ||
    data.Campus ||
    "Bidholi Campus, Dehradun";

  const termName =
    data.TermName ||
    data.SemesterName ||
    data.Semester ||
    data.CurrentSemester ||
    "SEM 01";

  const academicYearName =
    data.AcademicYearName ||
    data.AcademicYear ||
    data.Session ||
    "AY 2026–27";

  const email =
    userInfo.EmailId ||
    data.EmailId ||
    data.Email ||
    fallbackEmail ||
    "";

  // Handle ProfilePictureInfo object or string
  let profilePictureInfo: string | UpesProfilePictureInfo = "";
  if (data.ProfilePictureInfo) {
    profilePictureInfo = data.ProfilePictureInfo;
  } else if (userInfo.ProfilePicture) {
    profilePictureInfo = userInfo.ProfilePicture;
  } else if (data.ProfilePicture) {
    profilePictureInfo = data.ProfilePicture;
  } else if (data.FilePath) {
    profilePictureInfo = {
      FilePath: data.FilePath,
      ContainerName: data.ContainerName || "iemsfilecontainer",
    };
  }

  return {
    FirstName: firstName,
    LastName: lastName,
    GlobalId: globalId,
    RollNo: rollNo,
    ProgramTypeName: programTypeName,
    CenterName: centerName,
    TermName: termName,
    AcademicYearName: academicYearName,
    Email: email,
    BloodGroup: data.BloodGroup || "O+ve",
    ValidUpto: data.ValidUpto || "June 2030",
    HostelBlock: data.HostelBlock || data.Hostel || "",
    Specialization: data.Specialization || "",
    ProfilePictureInfo: profilePictureInfo,
  };
}

/**
 * Defensive adapter to map UPES live Attendance JSON array into AttendanceSubject[]
 */
export function adaptAttendancePayload(raw: any): AttendanceSubject[] {
  if (!raw) return [];

  // UPES often returns { Item: [ ... ] }, { Items: [ ... ] }, { data: [ ... ] }, or nested within Item
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.Item)
    ? raw.Item
    : Array.isArray(raw.Items)
    ? raw.Items
    : Array.isArray(raw.data)
    ? raw.data
    : Array.isArray(raw.AttendanceList)
    ? raw.AttendanceList
    : Array.isArray(raw.Summary)
    ? raw.Summary
    : Array.isArray(raw.SubjectWiseAttendance)
    ? raw.SubjectWiseAttendance
    : Array.isArray(raw.Item?.AttendanceList)
    ? raw.Item.AttendanceList
    : Array.isArray(raw.Item?.SubjectWiseAttendance)
    ? raw.Item.SubjectWiseAttendance
    : Array.isArray(raw.Item?.Summary)
    ? raw.Item.Summary
    : [];

  return list.map((item: any, idx: number) => {
    // 1. Module Name (from live UPES ModuleName)
    const name =
      item.ModuleName ||
      item.CourseName ||
      item.SubjectName ||
      item.name ||
      item.Title ||
      `Subject ${idx + 1}`;

    // 2. Module ID / Code (from live UPES ModuleId)
    const code =
      item.ModuleId !== undefined && item.ModuleId !== null
        ? String(item.ModuleId)
        : item.CourseCode ||
          item.SubjectCode ||
          item.code ||
          item.ModuleCode ||
          `MOD-${idx + 1}`;

    const faculty =
      item.FacultyName ||
      item.Faculty ||
      item.TeacherName ||
      item.Instructor ||
      "UPES Faculty";

    // 3. Exact Present Sessions (from live UPES PresentCount)
    const attended = Number(
      item.PresentCount ??
      item.AttendedHours ??
      item.AttendedClasses ??
      item.attended ??
      item.Present ??
      item.TotalPresent ??
      0
    );

    // 4. Exact Total Sessions (from live UPES TotalSessions)
    const total = Number(
      item.TotalSessions ??
      item.TotalHours ??
      item.TotalClasses ??
      item.total ??
      item.Conducted ??
      item.TotalConducted ??
      attended
    );

    // 5. Exact Absent Sessions (from live UPES AbsentCount)
    const absent = Number(
      item.AbsentCount ??
      item.absent ??
      Math.max(0, total - attended)
    );

    // 6. Condoned Sessions (from live UPES CondonedAttendanceCount)
    const condoned = Number(
      item.CondonedAttendanceCount ??
      item.condoned ??
      0
    );

    // 7. Exact Attendance Percentage (from live UPES AttendancePercentage)
    const percentage = Number(
      item.AttendancePercentage ??
      (total > 0 ? (attended / total) * 100 : 0)
    );

    // 8. Threshold Percentage (from live UPES ThresholdPercentage)
    const threshold = Number(
      item.ThresholdPercentage ??
      item.threshold ??
      75.00
    );

    const startDate = item.SelectedStartDate ? String(item.SelectedStartDate) : undefined;
    const endDate = item.SelectedEndDate ? String(item.SelectedEndDate) : undefined;

    const rawType = String(item.CourseType || item.Type || item.type || (name.toLowerCase().includes("lab") ? "Lab" : "Lecture"));
    const type: AttendanceSubject["type"] =
      rawType.toLowerCase().includes("lab") || rawType.toLowerCase().includes("practical")
        ? "Lab"
        : rawType.toLowerCase().includes("tut")
        ? "Tutorial"
        : "Lecture";

    const credits = Number(item.Credits || item.credits || (type === "Lab" ? 2 : 4));
    const room = item.Room || item.RoomNumber || item.Location || "Bidholi Campus";

    return {
      id: String(item.ModuleId || item.Id || item.id || `att-${code}-${idx}`),
      code,
      name,
      faculty,
      attended,
      total,
      absent,
      condoned,
      percentage,
      threshold,
      startDate,
      endDate,
      type,
      credits,
      room,
    };
  });
}

/**
 * Defensive adapter to map UPES live Timetable JSON array into TimetableSlot[]
 * Handles exact live UPES schemas:
 * - DayofWeekDetails (DayOfWeekName, DayOfWeekShortName)
 * - SlotStartTime, SlotEndTime ("09:00:00")
 * - ModuleList (ModuleName, ModuleCode, CourseName, SubjectCode)
 * - TeacherList (TeacherName, FacultyName)
 * - FloorPlanDetails (VenueName, VenueCode, VenueCategory, MeetingLink, CenterName)
 * - IsCancelledSlot, TimeTableSlotStatusName
 */
export function adaptTimetablePayload(raw: any): TimetableSlot[] {
  if (!raw) return [];

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.Item)
    ? raw.Item
    : Array.isArray(raw.Items)
    ? raw.Items
    : Array.isArray(raw.data)
    ? raw.data
    : Array.isArray(raw.TimetableList)
    ? raw.TimetableList
    : Array.isArray(raw.Schedule)
    ? raw.Schedule
    : Array.isArray(raw.Item?.TimetableList)
    ? raw.Item.TimetableList
    : Array.isArray(raw.Item?.Schedule)
    ? raw.Item.Schedule
    : [];

  const dayMap: Record<string, TimetableSlot["day"]> = {
    mon: "Monday",
    monday: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",
    wed: "Wednesday",
    wednesday: "Wednesday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",
    fri: "Friday",
    friday: "Friday",
    sat: "Saturday",
    saturday: "Saturday",
    sun: "Sunday",
    sunday: "Sunday",
  };

  return list.map((item: any, idx: number) => {
    // 1. Determine day
    let rawDay =
      item.DayofWeekDetails?.DayOfWeekName ||
      item.DayofWeekDetails?.DayOfWeekShortName ||
      item.Day ||
      item.DayName ||
      item.day ||
      "";

    let day: TimetableSlot["day"] = "Monday";
    if (rawDay && dayMap[rawDay.toLowerCase()]) {
      day = dayMap[rawDay.toLowerCase()];
    } else if (item.SlotDate) {
      try {
        const d = new Date(item.SlotDate);
        if (!isNaN(d.getTime())) {
          const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ] as const;
          day = daysOfWeek[d.getDay()] as TimetableSlot["day"];
        }
      } catch {
        day = "Monday";
      }
    }

    // 2. Format times ("09:00:00" -> "09:00")
    const rawStart = String(
      item.SlotStartTime || item.StartTime || item.FromTime || item.startTime || "09:00"
    );
    const startTime = rawStart.length >= 5 ? rawStart.slice(0, 5) : rawStart;

    const rawEnd = String(
      item.SlotEndTime || item.EndTime || item.ToTime || item.endTime || "10:00"
    );
    const endTime = rawEnd.length >= 5 ? rawEnd.slice(0, 5) : rawEnd;

    // 3. Module/Course details
    const moduleItem =
      Array.isArray(item.ModuleList) && item.ModuleList.length > 0
        ? item.ModuleList[0]
        : null;

    const subjectCode =
      moduleItem?.ModuleCode ||
      moduleItem?.SubjectCode ||
      moduleItem?.Code ||
      item.SubjectCode ||
      item.CourseCode ||
      item.code ||
      `CSEN${1000 + idx}`;

    const subjectName =
      moduleItem?.ModuleName ||
      moduleItem?.CourseName ||
      moduleItem?.Name ||
      item.SubjectName ||
      item.CourseName ||
      item.name ||
      "Scheduled Class";

    // 4. Faculty details
    const teacherItem =
      Array.isArray(item.TeacherList) && item.TeacherList.length > 0
        ? item.TeacherList[0]
        : null;

    const faculty =
      teacherItem?.TeacherName ||
      teacherItem?.FacultyName ||
      teacherItem?.Name ||
      item.Faculty ||
      item.FacultyName ||
      item.Teacher ||
      "UPES Faculty";

    // 5. FloorPlan / Venue details
    const fp = item.FloorPlanDetails || {};
    const venueName = fp.VenueName || item.VenueName || "";
    const venueCode = fp.VenueCode || item.VenueCode || "";
    const centerName = fp.CenterName || item.CenterName || "Bidholi Campus";
    const meetingLink = fp.MeetingLink || item.MeetingLink || "";
    const colorCode = fp.ColorCode || item.ColorCode || "";

    const room =
      venueName ||
      venueCode ||
      item.Room ||
      item.RoomNo ||
      "Room 304";

    let block = "Block 9";
    if (venueName) {
      const blockMatch = venueName.match(/Block\s*[\w\d]+/i);
      if (blockMatch) {
        block = blockMatch[0];
      } else if (centerName) {
        block = centerName;
      }
    } else if (item.Block || item.Building) {
      block = item.Block || item.Building;
    }

    // 6. Slot type
    const categoryStr = String(
      fp.VenueCategory ||
        fp.VenueCategoryCode ||
        item.Type ||
        item.ClassType ||
        item.type ||
        ""
    ).toLowerCase();
    const subjectLower = subjectName.toLowerCase();

    let type: TimetableSlot["type"] = "Lecture";
    if (categoryStr.includes("lab") || subjectLower.includes("lab")) {
      type = "Lab";
    } else if (categoryStr.includes("tut") || subjectLower.includes("tutorial")) {
      type = "Tutorial";
    } else if (categoryStr.includes("prac") || subjectLower.includes("practical")) {
      type = "Practical";
    }

    // 7. Cancellation & Status
    const isCancelled = Boolean(item.IsCancelledSlot || item.isCancelled);
    const statusName =
      item.TimeTableSlotStatusName || (isCancelled ? "Cancelled" : "Scheduled");

    return {
      id: String(item.Id || item.id || `tt-${day}-${idx}`),
      day,
      startTime,
      endTime,
      subjectCode,
      subjectName,
      faculty,
      room,
      block,
      type,
      venueName: venueName || undefined,
      venueCode: venueCode || undefined,
      meetingLink: meetingLink || undefined,
      slotDate: item.SlotDate || undefined,
      isCancelled,
      statusName,
      colorCode: colorCode || undefined,
      centerName: centerName || undefined,
    };
  });
}

/**
 * Defensive adapter to map UPES live Grades/Marks JSON into Academic Semester matrix
 */
export function adaptGradesPayload(raw: any): {
  cgpa: number;
  currentSgpa: number;
  totalEarnedCredits: number;
  totalCreditsRequired: number;
  semesters: AcademicSemester[];
} {
  if (!raw) {
    return {
      cgpa: 0,
      currentSgpa: 0,
      totalEarnedCredits: 0,
      totalCreditsRequired: 160,
      semesters: [],
    };
  }

  const data = raw.Item || raw.data || raw;
  const summery = data.CourseProgressSummery || data;

  const cgpa = Number(summery.CGPA || summery.cgpa || data.CGPA || data.cgpa || data.CumulativeGpa || 0);
  const currentSgpa = Number(summery.SGPA || summery.currentSgpa || data.SGPA || data.currentSgpa || data.Sgpa || cgpa);
  const totalEarnedCredits = Number(summery.TotalCreditsEarned || summery.EarnedCredits || data.TotalEarnedCredits || data.EarnedCredits || 0);
  const totalCreditsRequired = Number(summery.TotalCreditsRequired || summery.TotalCredits || data.TotalCreditsRequired || 160);

  // Semesters array
  const rawSemesters = Array.isArray(data.Semesters)
    ? data.Semesters
    : Array.isArray(data.semesters)
    ? data.semesters
    : Array.isArray(data.TermWiseCourseProgress)
    ? data.TermWiseCourseProgress
    : Array.isArray(data.TermWiseAllCourseDetails)
    ? data.TermWiseAllCourseDetails
    : Array.isArray(data.Courses)
    ? [
        {
          Semester: data.CurrentSemester || "Semester 01 (Current)",
          SGPA: currentSgpa,
          Courses: data.Courses,
        },
      ]
    : [];

  const semesters: AcademicSemester[] = rawSemesters.map((sem: any, sIdx: number) => {
    const semesterName = sem.Semester || sem.SemesterName || `Semester ${sIdx + 1}`;
    const sgpa = Number(sem.SGPA || sem.sgpa || currentSgpa);
    const rawCourses = Array.isArray(sem.Courses)
      ? sem.Courses
      : Array.isArray(sem.courses)
      ? sem.courses
      : [];

    let semCreditsEarned = 0;

    const courses = rawCourses.map((c: any, cIdx: number) => {
      const credits = Number(c.Credits || c.credits || 4);
      semCreditsEarned += credits;

      const internals = Number(c.Internals ?? c.InternalMarks ?? c.internals ?? 0);
      const midSem = Number(c.MidSem ?? c.MidTermMarks ?? c.midSem ?? 0);
      const endSem = Number(c.EndSem ?? c.EndTermMarks ?? c.endSem ?? 0);
      const total = Number(c.Total ?? c.TotalMarks ?? internals + midSem + endSem);
      const grade = String(c.Grade || c.LetterGrade || (total >= 90 ? "A+" : total >= 80 ? "A" : total >= 70 ? "B+" : "B"));
      const gradePoint = Number(c.GradePoint ?? (grade === "A+" ? 10 : grade === "A" ? 9 : 8));

      return {
        code: String(c.CourseCode || c.code || `SUB${cIdx + 1}`),
        name: String(c.CourseName || c.name || `Course ${cIdx + 1}`),
        credits,
        grade,
        gradePoint,
        internals,
        midSem,
        endSem,
        total,
      };
    });

    return {
      semester: semesterName,
      sgpa,
      creditsEarned: semCreditsEarned,
      creditsTotal: semCreditsEarned,
      status: sIdx === 0 ? "In-Progress" : "Completed",
      courses,
    };
  });

  return {
    cgpa,
    currentSgpa,
    totalEarnedCredits,
    totalCreditsRequired,
    semesters,
  };
}

/**
 * Defensive adapter to map UPES live LMS / Blackboard Courses JSON into LmsData
 */
export function adaptLmsPayload(raw: any): LmsData {
  if (!raw) {
    return {
      courses: [],
      materials: [],
      assignments: [],
      announcements: [],
    };
  }

  const data = raw.Item || raw.data || raw;
  let rawCourses = Array.isArray(data.courses)
    ? data.courses
    : Array.isArray(data.Courses)
    ? data.Courses
    : Array.isArray(data)
    ? data
    : [];

  if (rawCourses.length === 0 && Array.isArray(data.TermWiseAllCourseDetails)) {
    for (const term of data.TermWiseAllCourseDetails) {
      if (Array.isArray(term.CourseDetails)) {
        rawCourses.push(...term.CourseDetails);
      } else if (Array.isArray(term.Courses)) {
        rawCourses.push(...term.Courses);
      } else if (term.CourseCode || term.CourseName) {
        rawCourses.push(term);
      }
    }
  } else if (rawCourses.length === 0 && Array.isArray(data.TermWiseCourseProgress)) {
    for (const term of data.TermWiseCourseProgress) {
      if (Array.isArray(term.CourseDetails)) {
        rawCourses.push(...term.CourseDetails);
      } else if (Array.isArray(term.Courses)) {
        rawCourses.push(...term.Courses);
      } else if (term.CourseCode || term.CourseName) {
        rawCourses.push(term);
      }
    }
  }

  const rawMaterials = Array.isArray(data.materials)
    ? data.materials
    : Array.isArray(data.Materials)
    ? data.Materials
    : [];

  const rawAssignments = Array.isArray(data.assignments)
    ? data.assignments
    : Array.isArray(data.Assignments)
    ? data.Assignments
    : [];

  const rawAnnouncements = Array.isArray(data.announcements)
    ? data.announcements
    : Array.isArray(data.Announcements)
    ? data.Announcements
    : [];

  const courses = rawCourses.map((c: any, idx: number) => ({
    id: String(c.CourseId || c.id || `lms-crs-${idx}`),
    code: String(c.CourseCode || c.code || `CSEN${1001 + idx}`),
    title: String(c.Title || c.CourseName || c.title || `Module ${idx + 1}`),
    instructor: String(c.Instructor || c.Faculty || "UPES Faculty"),
    semester: String(c.Semester || "SEM 01"),
    progress: Number(c.ProgressPercentage || c.progress || 75),
    credits: Number(c.Credits || c.credits || 4),
    department: String(c.Department || "Computer Science"),
  }));

  const materials = rawMaterials.map((m: any, idx: number) => ({
    id: String(m.MaterialId || m.id || `mat-${idx}`),
    courseCode: String(m.CourseCode || m.courseCode || "CSEN1001"),
    title: String(m.Title || m.title || "Lecture Notes"),
    fileUrl: m.FileUrl || m.url || "",
    uploadedDate: String(m.UploadedDate || m.date || "Recent"),
    fileType: (m.FileType || m.type || "pdf") as any,
    fileSize: m.FileSize || m.size || "2.4 MB",
  }));

  const assignments = rawAssignments.map((a: any, idx: number) => ({
    id: String(a.AssignmentId || a.id || `asg-${idx}`),
    courseCode: String(a.CourseCode || a.courseCode || "CSEN1001"),
    title: String(a.Title || a.title || "Lab Assignment"),
    dueDate: String(a.DueDate || a.dueDate || "Upcoming"),
    totalMarks: Number(a.TotalMarks || a.marks || 20),
    status: (a.Status || (a.IsSubmitted ? "Submitted" : "Pending")) as any,
    isSubmitted: Boolean(a.IsSubmitted || a.submitted),
  }));

  const announcements = rawAnnouncements.map((an: any, idx: number) => ({
    id: String(an.NoticeId || an.id || `notice-${idx}`),
    title: String(an.Title || an.title || "Course Announcement"),
    content: String(an.Content || an.content || ""),
    postedBy: String(an.PostedBy || an.author || "Course Coordinator"),
    date: String(an.Date || an.date || "Today"),
    priority: (an.Priority || "Normal") as any,
  }));

  return {
    courses,
    materials,
    assignments,
    announcements,
  };
}

/**
 * Defensive adapter to map UPES live Fees / Finance JSON into FinanceData
 */
export function adaptFinancePayload(raw: any): FinanceData {
  if (!raw) {
    return {
      outstandingAmount: 0,
      excessAmount: 0,
      isNoDues: true,
      currency: "INR",
      paymentSchedule: [],
    };
  }

  const data = raw.Item || raw.data || raw;
  const outstanding = Number(data.OutstandingAmount ?? data.outstandingAmount ?? 0);
  const excess = Number(data.ExcessAmount ?? data.excessAmount ?? 0);

  const rawSchedule = Array.isArray(data.StudentSchedulePayment)
    ? data.StudentSchedulePayment
    : Array.isArray(data.paymentSchedule)
    ? data.paymentSchedule
    : [];

  const paymentSchedule = rawSchedule.map((p: any, idx: number) => ({
    title: String(p.FeeHeadName || p.title || p.Description || `Installment ${idx + 1}`),
    amount: Number(p.DueAmount || p.Amount || p.amount || 0),
    dueDate: String(p.DueDate || p.dueDate || "Upcoming"),
    status: (p.Status || (outstanding === 0 ? "Paid" : "Pending")) as any,
  }));

  return {
    outstandingAmount: outstanding,
    excessAmount: excess,
    isNoDues: outstanding <= 0,
    currency: "INR",
    paymentSchedule,
  };
}

/**
 * Defensive adapter to map UPES live Calendar Event list into CalendarEvent[]
 */
export function adaptCalendarPayload(raw: any): CalendarEvent[] {
  if (!raw) return [];
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.Items)
    ? raw.Items
    : Array.isArray(raw.Item)
    ? raw.Item
    : [];

  return list.map((item: any, idx: number) => ({
    id: String(item.Id || item.id || `cal-${idx}`),
    name: String(item.Name || item.name || item.BatchName || "University Event"),
    type: String(item.Type || item.type || "Event"),
    subType: item.SubType || item.subType || "",
    startDate: String(item.StartDate || item.startDate || "Upcoming"),
    endDate: String(item.EndDate || item.endDate || ""),
  }));
}

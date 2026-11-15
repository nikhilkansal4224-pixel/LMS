import {
  StudentProfile,
  AttendanceSubject,
  TimetableSlot,
  AcademicSemester,
  UpesProfilePictureInfo,
  LmsData,
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
    const code =
      item.CourseCode ||
      item.SubjectCode ||
      item.code ||
      item.ModuleCode ||
      `SUB${idx + 1}`;

    const name =
      item.CourseName ||
      item.SubjectName ||
      item.name ||
      item.ModuleName ||
      `Subject ${idx + 1}`;

    const faculty =
      item.FacultyName ||
      item.Faculty ||
      item.TeacherName ||
      item.Instructor ||
      "UPES Faculty";

    const attended = Number(
      item.AttendedHours ??
      item.AttendedClasses ??
      item.attended ??
      item.Present ??
      item.TotalPresent ??
      0
    );

    const total = Number(
      item.TotalHours ??
      item.TotalClasses ??
      item.total ??
      item.Conducted ??
      item.TotalConducted ??
      attended
    );

    const rawType = String(item.CourseType || item.Type || item.type || "Lecture");
    const type: AttendanceSubject["type"] =
      rawType.toLowerCase().includes("lab") || rawType.toLowerCase().includes("practical")
        ? "Lab"
        : rawType.toLowerCase().includes("tut")
        ? "Tutorial"
        : "Lecture";

    const credits = Number(item.Credits || item.credits || (type === "Lab" ? 2 : 4));
    const room = item.Room || item.RoomNumber || item.Location || "Bidholi Complex";

    return {
      id: String(item.Id || item.id || `att-${code}-${idx}`),
      code,
      name,
      faculty,
      attended,
      total,
      type,
      credits,
      room,
    };
  });
}

/**
 * Defensive adapter to map UPES live Timetable JSON array into TimetableSlot[]
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

  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;

  return list.map((item: any, idx: number) => {
    let day = (item.Day || item.DayName || item.day || "Monday") as TimetableSlot["day"];
    if (!validDays.includes(day)) {
      day = "Monday";
    }

    const startTime = item.StartTime || item.FromTime || item.startTime || "09:00";
    const endTime = item.EndTime || item.ToTime || item.endTime || "10:00";

    const subjectCode =
      item.SubjectCode ||
      item.CourseCode ||
      item.code ||
      `CSEN${1000 + idx}`;

    const subjectName =
      item.SubjectName ||
      item.CourseName ||
      item.name ||
      "Scheduled Class";

    const faculty = item.Faculty || item.FacultyName || item.Teacher || "UPES Faculty";
    const room = item.Room || item.RoomNo || "Room 304";
    const block = item.Block || item.Building || "Block 9";

    const rawType = String(item.Type || item.ClassType || item.type || "Lecture");
    const type: TimetableSlot["type"] =
      rawType.toLowerCase().includes("lab")
        ? "Lab"
        : rawType.toLowerCase().includes("tut")
        ? "Tutorial"
        : "Lecture";

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

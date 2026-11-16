import { StudentDashboardData } from "@/types/student";

/**
 * Default empty template state.
 * All live student information, attendance records, timetable slots, and grade marks
 * are dynamically streamed from the UPES SLCM API endpoints via /api/proxy.
 */
export const defaultStudentData: StudentDashboardData = {
  profile: {
    FirstName: "Student",
    LastName: "",
    GlobalId: "",
    RollNo: "",
    ProgramTypeName: "UPES Academic Portal",
    CenterName: "UPES Dehradun",
    TermName: "Current Term",
    AcademicYearName: "AY 2026–27",
    Email: "",
    ProfilePictureInfo: "",
    PortalApiUrl: "https://myupes-beta.upes.ac.in",
  },
  attendance: [],
  timetable: [],
  academics: {
    cgpa: 0,
    currentSgpa: 0,
    totalEarnedCredits: 0,
    totalCreditsRequired: 160,
    semesters: [],
  },
  notifications: [
    {
      id: "notif-live-ready",
      type: "info",
      title: "Live UPES SLCM Stream Active",
      message: "Modules dynamically bind to live UPES Identity & Academic services.",
      timestamp: "Just now",
      read: false,
    },
  ],
};

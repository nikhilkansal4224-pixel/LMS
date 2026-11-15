export interface UpesProfilePictureInfo {
  FilePath?: string;
  ContainerName?: string;
}

export interface StudentProfile {
  FirstName: string;
  LastName?: string;
  GlobalId: string; // SAP ID
  RollNo: string;
  ProgramTypeName: string;
  CenterName: string;
  TermName: string;
  AcademicYearName: string;
  Email: string;
  BloodGroup?: string;
  ValidUpto?: string;
  ProfilePictureInfo: string | UpesProfilePictureInfo;
  HostelBlock?: string;
  Specialization?: string;
  SessionToken?: string;
  PortalApiUrl?: string;
}

export interface AttendanceSubject {
  id: string;
  code: string;
  name: string;
  faculty: string;
  attended: number;
  total: number;
  type: "Lecture" | "Lab" | "Tutorial" | "Practical";
  credits: number;
  room: string;
}

export interface TimetableSlot {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subjectCode: string;
  subjectName: string;
  faculty: string;
  room: string;
  block: string;
  type: "Lecture" | "Lab" | "Tutorial";
}

export interface AcademicSemester {
  semester: string;
  sgpa: number;
  creditsEarned: number;
  creditsTotal: number;
  status: "Completed" | "In-Progress";
  courses: {
    code: string;
    name: string;
    credits: number;
    grade: string;
    gradePoint: number;
    internals: number;
    midSem: number;
    endSem: number;
    total: number;
  }[];
}

export interface NotificationItem {
  id: string;
  type: "warning" | "alert" | "info" | "success" | "critical";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  attendance: AttendanceSubject[];
  timetable: TimetableSlot[];
  academics: {
    cgpa: number;
    currentSgpa: number;
    totalEarnedCredits: number;
    totalCreditsRequired: number;
    semesters: AcademicSemester[];
  };
  notifications: NotificationItem[];
}

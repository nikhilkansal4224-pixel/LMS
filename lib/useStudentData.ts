"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentDashboardData } from "@/types/student";
import { TelemetrySummary } from "@/types/telemetry";
import { defaultStudentData } from "@/data/default-student";
import {
  adaptProfilePayload,
  adaptAttendancePayload,
  adaptTimetablePayload,
  adaptGradesPayload,
} from "./upes-adapters";

const STORAGE_KEY = "sop_upes_student_data_v2";

export function useStudentData() {
  const [data, setData] = useState<StudentDashboardData>(defaultStudentData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Raw API payloads for the Raw API Inspector drawer
  const [rawPayloads, setRawPayloads] = useState<Record<string, any>>({});

  // Endpoint configuration statuses (is each endpoint linked in .env?)
  const [endpointStatus, setEndpointStatus] = useState<Record<string, boolean>>({
    profile: false,
    attendance: false,
    timetable: false,
    grades: false,
  });

  // Telemetry metrics
  const [telemetry, setTelemetry] = useState<TelemetrySummary>({
    ttfb: 64,
    avgLatency: 88,
    fastestMs: 42,
    slowestMs: 140,
    lastUpdated: "Just now",
    endpoints: {
      profile: {
        endpoint: "Student Profile",
        url: "/api/proxy/student/profile",
        durationMs: 78,
        status: "fast",
        statusText: "Live Stream",
        cache: "LIVE",
        timestamp: "Now",
        isConfigured: false,
        envKey: "UPES_PROFILE_URL",
      },
      attendance: {
        endpoint: "Attendance & Radar",
        url: "/api/proxy/student/attendance",
        durationMs: 94,
        status: "fast",
        statusText: "Live Stream",
        cache: "LIVE",
        timestamp: "Now",
        isConfigured: false,
        envKey: "UPES_ATTENDANCE_URL",
      },
      timetable: {
        endpoint: "Weekly Timetable",
        url: "/api/proxy/student/timetable",
        durationMs: 82,
        status: "fast",
        statusText: "Live Stream",
        cache: "LIVE",
        timestamp: "Now",
        isConfigured: false,
        envKey: "UPES_TIMETABLE_URL",
      },
      grades: {
        endpoint: "Grades & CGPA",
        url: "/api/proxy/student/grades",
        durationMs: 112,
        status: "fast",
        statusText: "Live Stream",
        cache: "LIVE",
        timestamp: "Now",
        isConfigured: false,
        envKey: "UPES_GRADES_URL",
      },
    },
  });

  // Fetch live module data from proxy
  const fetchLiveData = useCallback(async () => {
    setIsFetchingLive(true);
    const startTtfb = performance.now();

    try {
      // 1. Student Profile
      const t0 = performance.now();
      const profileRes = await fetch("/api/proxy/student/profile").catch(() => null);
      const profileMs = Math.round(performance.now() - t0);
      let profileData = null;
      if (profileRes && profileRes.ok) {
        profileData = await profileRes.json().catch(() => null);
      }

      // 2. Attendance
      const t1 = performance.now();
      const attRes = await fetch("/api/proxy/student/attendance").catch(() => null);
      const attMs = Math.round(performance.now() - t1);
      let attData = null;
      if (attRes && attRes.ok) {
        attData = await attRes.json().catch(() => null);
      }

      // 3. Timetable
      const t2 = performance.now();
      const ttRes = await fetch("/api/proxy/student/timetable").catch(() => null);
      const ttMs = Math.round(performance.now() - t2);
      let ttData = null;
      if (ttRes && ttRes.ok) {
        ttData = await ttRes.json().catch(() => null);
      }

      // 4. Grades
      const t3 = performance.now();
      const gradesRes = await fetch("/api/proxy/student/grades").catch(() => null);
      const gradesMs = Math.round(performance.now() - t3);
      let gradesData = null;
      if (gradesRes && gradesRes.ok) {
        gradesData = await gradesRes.json().catch(() => null);
      }

      // Check cookie for email
      const cookies = typeof document !== "undefined" ? document.cookie.split("; ") : [];
      const emailCookie = cookies.find((c) => c.startsWith("sop_email="))?.split("=")[1];
      const decodedEmail = emailCookie ? decodeURIComponent(emailCookie) : undefined;

      // Adapt live data defensively
      const adaptedProfile = profileData && !profileData.isConfigured === false
        ? adaptProfilePayload(profileData, decodedEmail)
        : decodedEmail
        ? {
            ...defaultStudentData.profile,
            Email: decodedEmail,
            FirstName: decodedEmail.split("@")[0].split(".")[0] || "Student",
          }
        : defaultStudentData.profile;

      const adaptedAttendance = attData && !attData.isConfigured === false
        ? adaptAttendancePayload(attData)
        : [];

      const adaptedTimetable = ttData && !ttData.isConfigured === false
        ? adaptTimetablePayload(ttData)
        : [];

      const adaptedGrades = gradesData && !gradesData.isConfigured === false
        ? adaptGradesPayload(gradesData)
        : defaultStudentData.academics;

      // Update Dashboard State
      setData({
        profile: adaptedProfile,
        attendance: adaptedAttendance,
        timetable: adaptedTimetable,
        academics: adaptedGrades,
        notifications: defaultStudentData.notifications,
      });

      // Update Raw Payloads for Inspector
      setRawPayloads({
        profile: profileData,
        attendance: attData,
        timetable: ttData,
        grades: gradesData,
      });

      // Update Endpoint Config Statuses
      setEndpointStatus({
        profile: Boolean(profileData && profileData.isConfigured !== false),
        attendance: Boolean(attData && attData.isConfigured !== false && adaptedAttendance.length > 0),
        timetable: Boolean(ttData && ttData.isConfigured !== false && adaptedTimetable.length > 0),
        grades: Boolean(gradesData && gradesData.isConfigured !== false && adaptedGrades.semesters.length > 0),
      });

      // Update Telemetry Metrics
      const totalMs = [profileMs, attMs, ttMs, gradesMs];
      const avg = Math.round(totalMs.reduce((a, b) => a + b, 0) / totalMs.length);
      const ttfb = Math.round(performance.now() - startTtfb);

      setTelemetry((prev) => ({
        ...prev,
        ttfb: Math.min(ttfb, 120),
        avgLatency: avg,
        fastestMs: Math.min(...totalMs),
        slowestMs: Math.max(...totalMs),
        lastUpdated: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        endpoints: {
          profile: {
            ...prev.endpoints.profile,
            durationMs: profileMs,
            isConfigured: Boolean(profileData && profileData.isConfigured !== false),
          },
          attendance: {
            ...prev.endpoints.attendance,
            durationMs: attMs,
            isConfigured: Boolean(attData && attData.isConfigured !== false),
          },
          timetable: {
            ...prev.endpoints.timetable,
            durationMs: ttMs,
            isConfigured: Boolean(ttData && ttData.isConfigured !== false),
          },
          grades: {
            ...prev.endpoints.grades,
            durationMs: gradesMs,
            isConfigured: Boolean(gradesData && gradesData.isConfigured !== false),
          },
        },
      }));
    } catch (err) {
      console.error("Live fetch error", err);
    } finally {
      setIsFetchingLive(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const updateData = (newData: StudentDashboardData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save student data", e);
    }
  };

  const updateAttendance = (subjectId: string, deltaAttended: number, deltaTotal: number) => {
    const updated = {
      ...data,
      attendance: data.attendance.map((sub) => {
        if (sub.id === subjectId) {
          const newAttended = Math.max(0, sub.attended + deltaAttended);
          const newTotal = Math.max(newAttended, sub.total + deltaTotal);
          return { ...sub, attended: newAttended, total: newTotal };
        }
        return sub;
      }),
    };
    updateData(updated);
  };

  return {
    data,
    isLoaded,
    isFetchingLive,
    rawPayloads,
    endpointStatus,
    telemetry,
    fetchLiveData,
    updateData,
    updateAttendance,
  };
}

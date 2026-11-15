"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentData } from "@/lib/useStudentData";
import { TopBar } from "@/components/navigation/TopBar";
import { NavDock, NavTab } from "@/components/navigation/NavDock";
import { CollegeIdCard } from "@/components/bento/CollegeIdCard";
import { OverallAttendanceRingCard } from "@/components/bento/OverallAttendanceRingCard";
import { TodayTimetableCard } from "@/components/bento/TodayTimetableCard";
import { SubjectAttendanceCard } from "@/components/bento/SubjectAttendanceCard";
import { GradesCgpaCard } from "@/components/bento/GradesCgpaCard";
import { EmptyEndpointCard } from "@/components/bento/EmptyEndpointCard";
import { AttendanceTab } from "@/components/tabs/AttendanceTab";
import { TimetableTab } from "@/components/tabs/TimetableTab";
import { AcademicsTab } from "@/components/tabs/AcademicsTab";
import { LmsTab } from "@/components/tabs/LmsTab";
import { PortalConfigModal } from "@/components/modals/PortalConfigModal";
import { RawApiInspectorModal } from "@/components/modals/RawApiInspectorModal";

export default function DashboardPage() {
  const {
    data,
    isLoaded,
    isFetchingLive,
    rawPayloads,
    endpointStatus,
    telemetry,
    fetchLiveData,
    updateData,
    updateAttendance,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [inspectorModule, setInspectorModule] = useState<string | null>(null);

  // Critical attendance warnings count for the dock badge
  const criticalCount = data.attendance.filter((s) => {
    const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
    return pct < 75;
  }).length;

  const handleMarkAllNotificationsRead = () => {
    updateData({
      ...data,
      notifications: data.notifications.map((n) => ({ ...n, read: true })),
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-obsidian-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl neu-inset-well border border-amber-500/30 flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-md bg-amber-500 shadow-neu-glow-amber" />
          </div>
          <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">
            Connecting Live UPES Gateway...
          </span>
        </div>
      </div>
    );
  }

  // Animation variants for smooth view transitions
  const tabVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-obsidian-base bg-ambient-glow text-slate-100 flex flex-col justify-between relative selection:bg-amber-500 selection:text-black">
      {/* Ambient background glow accents */}
      <div className="fixed top-10 left-1/4 w-96 h-96 bg-amber-500/[0.025] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col">
        {/* Top Utility Bar with Speed Telemetry Pill */}
        <TopBar
          profile={data.profile}
          notifications={data.notifications}
          telemetry={telemetry}
          onRefreshTelemetry={fetchLiveData}
          isPinging={isFetchingLive}
          onOpenConfig={() => setIsConfigOpen(true)}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        {/* Tab Views Content Area */}
        <main className="mt-6 flex-1">
          <AnimatePresence mode="wait">
            {/* VIEW 1: Overview (Main Bento Dashboard) */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* 12-Column Responsive Asymmetric Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                  {/* Card 1: Digital College ID Card (4 cols) */}
                  <div className="lg:col-span-4 min-h-[300px]">
                    <CollegeIdCard
                      profile={data.profile}
                      onOpenInspector={() => setInspectorModule("profile")}
                    />
                  </div>

                  {/* Card 2: Overall Attendance Ring Card (4 cols) */}
                  <div className="lg:col-span-4 min-h-[300px]">
                    {data.attendance.length > 0 ? (
                      <OverallAttendanceRingCard
                        attendance={data.attendance}
                        onViewDetails={() => setActiveTab("attendance")}
                      />
                    ) : (
                      <EmptyEndpointCard
                        title="Overall Attendance Ring"
                        moduleName="Attendance Sentinel"
                        envKey="UPES_ATTENDANCE_URL"
                        exampleUrl="https://slcm.upes.ac.in/api/v1/student/attendance"
                        onOpenConfig={() => setIsConfigOpen(true)}
                        onOpenInspector={() => setInspectorModule("attendance")}
                      />
                    )}
                  </div>

                  {/* Card 3: Today's Timetable — "Up Next" Card (4 cols) */}
                  <div className="lg:col-span-4 min-h-[300px]">
                    {data.timetable.length > 0 ? (
                      <TodayTimetableCard
                        timetable={data.timetable}
                        onViewAll={() => setActiveTab("timetable")}
                      />
                    ) : (
                      <EmptyEndpointCard
                        title="Today's Timetable & Up Next"
                        moduleName="Academic Schedule"
                        envKey="UPES_TIMETABLE_URL"
                        exampleUrl="https://slcm.upes.ac.in/api/v1/student/timetable"
                        onOpenConfig={() => setIsConfigOpen(true)}
                        onOpenInspector={() => setInspectorModule("timetable")}
                      />
                    )}
                  </div>

                  {/* Card 4: Subject-Wise Attendance + Bunk Calculator Card (7 cols) */}
                  <div className="lg:col-span-7 min-h-[420px]">
                    {data.attendance.length > 0 ? (
                      <SubjectAttendanceCard
                        attendance={data.attendance}
                        onUpdateAttendance={updateAttendance}
                        onOpenSimulator={() => setActiveTab("attendance")}
                      />
                    ) : (
                      <EmptyEndpointCard
                        title="Subject-Wise Attendance & Bunk Radar"
                        moduleName="Continuous Attendance Engine"
                        envKey="UPES_ATTENDANCE_URL"
                        exampleUrl="https://slcm.upes.ac.in/api/v1/student/attendance"
                        onOpenConfig={() => setIsConfigOpen(true)}
                        onOpenInspector={() => setInspectorModule("attendance")}
                      />
                    )}
                  </div>

                  {/* Card 5: Grades & CGPA Card (5 cols) */}
                  <div className="lg:col-span-5 min-h-[420px]">
                    {data.academics.semesters.length > 0 ? (
                      <GradesCgpaCard
                        cgpa={data.academics.cgpa}
                        currentSgpa={data.academics.currentSgpa}
                        totalEarnedCredits={data.academics.totalEarnedCredits}
                        totalCreditsRequired={data.academics.totalCreditsRequired}
                        semesters={data.academics.semesters}
                        onViewAcademics={() => setActiveTab("academics")}
                      />
                    ) : (
                      <EmptyEndpointCard
                        title="Academics, Marks & CGPA"
                        moduleName="Evaluation Transcript"
                        envKey="UPES_GRADES_URL"
                        exampleUrl="https://slcm.upes.ac.in/api/v1/student/grades"
                        onOpenConfig={() => setIsConfigOpen(true)}
                        onOpenInspector={() => setInspectorModule("grades")}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: Attendance & Bunk Simulator */}
            {activeTab === "attendance" && (
              <motion.div
                key="attendance"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {data.attendance.length > 0 ? (
                  <AttendanceTab
                    attendance={data.attendance}
                    onUpdateAttendance={updateAttendance}
                    onReset={fetchLiveData}
                  />
                ) : (
                  <div className="max-w-xl mx-auto min-h-[350px]">
                    <EmptyEndpointCard
                      title="Attendance & Bunk Simulator"
                      moduleName="Attendance Sentinel"
                      envKey="UPES_ATTENDANCE_URL"
                      exampleUrl="https://slcm.upes.ac.in/api/v1/student/attendance"
                      onOpenConfig={() => setIsConfigOpen(true)}
                      onOpenInspector={() => setInspectorModule("attendance")}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 3: Weekly Timetable */}
            {activeTab === "timetable" && (
              <motion.div
                key="timetable"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {data.timetable.length > 0 ? (
                  <TimetableTab timetable={data.timetable} />
                ) : (
                  <div className="max-w-xl mx-auto min-h-[350px]">
                    <EmptyEndpointCard
                      title="Weekly Academic Timetable"
                      moduleName="Schedule Routing"
                      envKey="UPES_TIMETABLE_URL"
                      exampleUrl="https://slcm.upes.ac.in/api/v1/student/timetable"
                      onOpenConfig={() => setIsConfigOpen(true)}
                      onOpenInspector={() => setInspectorModule("timetable")}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: LMS & Courses */}
            {activeTab === "lms" && (
              <motion.div
                key="lms"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LmsTab lms={data.lms} />
              </motion.div>
            )}

            {/* VIEW 5: Academics & Grades */}
            {activeTab === "academics" && (
              <motion.div
                key="academics"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {data.academics.semesters.length > 0 ? (
                  <AcademicsTab academics={data.academics} />
                ) : (
                  <div className="max-w-xl mx-auto min-h-[350px]">
                    <EmptyEndpointCard
                      title="Continuous Evaluation Matrix & Transcript"
                      moduleName="Grades Sentinel"
                      envKey="UPES_GRADES_URL"
                      exampleUrl="https://slcm.upes.ac.in/api/v1/student/grades"
                      onOpenConfig={() => setIsConfigOpen(true)}
                      onOpenInspector={() => setInspectorModule("grades")}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Sleek Floating Neumorphic Navigation Dock */}
      <NavDock
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        attendanceAlertCount={criticalCount}
      />

      {/* Demo / Custom Student Config Modal */}
      <PortalConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        data={data}
        onSave={updateData}
        onReset={fetchLiveData}
      />

      {/* Raw API Inspector Modal */}
      <RawApiInspectorModal
        isOpen={Boolean(inspectorModule)}
        onClose={() => setInspectorModule(null)}
        title={
          inspectorModule === "profile"
            ? "Student Profile"
            : inspectorModule === "attendance"
            ? "Attendance & Bunk Radar"
            : inspectorModule === "timetable"
            ? "Weekly Timetable"
            : inspectorModule === "lms"
            ? "LMS & Courses Engine"
            : "Academics & Grades"
        }
        endpointUrl={
          inspectorModule === "profile"
            ? process.env.UPES_PROFILE_URL || "/api/proxy/student/profile"
            : inspectorModule === "attendance"
            ? process.env.UPES_ATTENDANCE_URL || "/api/proxy/student/attendance"
            : inspectorModule === "timetable"
            ? process.env.UPES_TIMETABLE_URL || "/api/proxy/student/timetable"
            : inspectorModule === "lms"
            ? process.env.UPES_LMS_URL || "/api/proxy/student/lms"
            : process.env.UPES_GRADES_URL || "/api/proxy/student/grades"
        }
        payload={
          inspectorModule ? rawPayloads[inspectorModule] : null
        }
        durationMs={
          inspectorModule && telemetry.endpoints[inspectorModule]
            ? telemetry.endpoints[inspectorModule].durationMs
            : 82
        }
      />
    </div>
  );
}

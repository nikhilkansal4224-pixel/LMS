"use client";

import React, { useState } from "react";
import { LmsData, LmsCourse, LmsMaterial, LmsAssignment } from "@/types/student";
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

interface LmsTabProps {
  lms?: LmsData;
}

export function LmsTab({ lms }: LmsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"courses" | "materials" | "assignments">("courses");
  const [searchQuery, setSearchQuery] = useState("");

  const defaultCourses: LmsCourse[] = lms?.courses && lms.courses.length > 0
    ? lms.courses
    : [
        {
          id: "crs-1",
          code: "CSEN1001",
          title: "Object Oriented Programming with C++ & Modern Design",
          instructor: "Dr. Arvind Bhattacharya",
          semester: "SEM 01",
          progress: 85,
          credits: 4,
          department: "Computer Science & Engineering",
        },
        {
          id: "crs-2",
          code: "CSEN1002",
          title: "Discrete Mathematical Structures & Graph Theory",
          instructor: "Prof. Sunita Negi",
          semester: "SEM 01",
          progress: 72,
          credits: 4,
          department: "Mathematical Sciences",
        },
        {
          id: "crs-3",
          code: "CSEN1003",
          title: "Data Structures & Modern Algorithms Implementation",
          instructor: "Dr. Vikramaditya Rawat",
          semester: "SEM 01",
          progress: 68,
          credits: 4,
          department: "Computer Science & Engineering",
        },
        {
          id: "crs-4",
          code: "CSEN1005",
          title: "Linux Kernel & Cloud Infrastructure Lab",
          instructor: "Er. Rohitashwa Semwal",
          semester: "SEM 01",
          progress: 90,
          credits: 2,
          department: "Cloud Computing & AI",
        },
        {
          id: "crs-5",
          code: "MATH1001",
          title: "Engineering Mathematics I (Multivariable Calculus)",
          instructor: "Dr. K. S. Panwar",
          semester: "SEM 01",
          progress: 55,
          credits: 4,
          department: "Applied Sciences",
        },
      ];

  const defaultMaterials: LmsMaterial[] = lms?.materials && lms.materials.length > 0
    ? lms.materials
    : [
        {
          id: "mat-1",
          courseCode: "CSEN1001",
          title: "Module 4: Smart Pointers, Move Semantics & RAII in C++20",
          uploadedDate: "Yesterday",
          fileType: "pdf",
          fileSize: "4.2 MB",
        },
        {
          id: "mat-2",
          courseCode: "CSEN1003",
          title: "Lecture Notes: Red-Black Trees & Balanced Search Trees",
          uploadedDate: "3 days ago",
          fileType: "slides",
          fileSize: "6.8 MB",
        },
        {
          id: "mat-3",
          courseCode: "CSEN1005",
          title: "Lab Guide 05: Docker Containers & Linux Namespace Isolation",
          uploadedDate: "Nov 12",
          fileType: "doc",
          fileSize: "1.8 MB",
        },
        {
          id: "mat-4",
          courseCode: "MATH1001",
          title: "Vector Calculus: Green's & Stokes' Theorem Practice Set",
          uploadedDate: "Nov 10",
          fileType: "pdf",
          fileSize: "2.5 MB",
        },
      ];

  const defaultAssignments: LmsAssignment[] = lms?.assignments && lms.assignments.length > 0
    ? lms.assignments
    : [
        {
          id: "asg-1",
          courseCode: "CSEN1001",
          title: "C++ Memory Allocation & Custom Deleter Task",
          dueDate: "Tomorrow at 11:59 PM",
          totalMarks: 20,
          status: "Pending",
          isSubmitted: false,
        },
        {
          id: "asg-2",
          courseCode: "CSEN1003",
          title: "Binary Heap & Dijkstra Algorithm Performance Benchmark",
          dueDate: "Friday at 5:00 PM",
          totalMarks: 30,
          status: "Pending",
          isSubmitted: false,
        },
        {
          id: "asg-3",
          courseCode: "CSEN1005",
          title: "Shell Scripting & Kernel Syscall Tracer",
          dueDate: "Nov 14",
          totalMarks: 25,
          status: "Submitted",
          isSubmitted: true,
        },
      ];

  const filteredCourses = defaultCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="neu-card p-6 border border-white/5 bg-gradient-to-r from-[#1B1F28] via-[#1E232F] to-[#1B1F28]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl neu-inset-well border border-amber-500/20">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  UPES LMS &amp; Course Materials Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full neu-inset-well text-amber-400 uppercase font-bold border border-amber-500/20">
                  BLACKBOARD SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated syllabus tracking, study resource downloads &amp; assignment deadlines
              </p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 neu-inset-well p-1 rounded-xl">
            {(["courses", "materials", "assignments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                  activeSubTab === tab
                    ? "neu-raised-sm text-amber-300 bg-[#1F2430] border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Tab 1: Enrolled Courses */}
      {activeSubTab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Active Enrolled Modules ({filteredCourses.length})
            </span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search course or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl neu-inset-well text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="neu-card neu-card-hover p-5 border border-white/5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md neu-inset-well text-amber-400 border border-amber-500/20">
                      {course.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    Faculty: {course.instructor}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-slate-400">Syllabus Covered</span>
                    <span className="text-amber-400 font-bold">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full neu-inset-track overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-neu-glow-amber transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Materials & Lecture Slides */}
      {activeSubTab === "materials" && (
        <div className="neu-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-mono">
              Course Lecture Notes &amp; Downloadable Study Packs
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {defaultMaterials.length} Resources Mapped
            </span>
          </div>

          <div className="space-y-2.5">
            {defaultMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-3.5 rounded-2xl neu-raised-sm hover:border-amber-500/30 transition-all flex items-center justify-between gap-4 border border-white/[0.03]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl neu-inset-well border border-amber-500/20 shrink-0">
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.2 rounded neu-inset-well">
                        {mat.courseCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {mat.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      Uploaded {mat.uploadedDate} • {mat.fileSize || "PDF Document"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Initiating direct download for: ${mat.title}`)}
                  className="px-3 py-1.5 rounded-xl neu-raised-btn hover:text-amber-300 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Assignments & Tasks */}
      {activeSubTab === "assignments" && (
        <div className="neu-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-mono">
              Continuous Assessment Deadlines &amp; Lab Submissions
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {defaultAssignments.filter((a) => !a.isSubmitted).length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {defaultAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl neu-raised-sm border border-white/[0.03] flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.2 rounded neu-inset-well">
                      {asg.courseCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        asg.isSubmitted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {asg.status}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                    {asg.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Due: {asg.dueDate}
                    </span>
                    <span>Max Marks: {asg.totalMarks}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Opening submission portal for: ${asg.title}`)}
                  className="px-3.5 py-2 rounded-xl neu-raised-btn text-xs font-mono font-bold text-amber-300 hover:text-white shrink-0 transition-all"
                >
                  {asg.isSubmitted ? "Review Submission" : "Submit File →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AttendanceSubject } from "@/types/student";
import { calculateAttendanceStatus, getBunkAdvice } from "@/lib/utils";
import { BookMarked, Plus, Minus, RotateCcw, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface SubjectAttendanceCardProps {
  attendance: AttendanceSubject[];
  onUpdateAttendance?: (id: string, deltaAttended: number, deltaTotal: number) => void;
  onOpenSimulator?: () => void;
}

export function SubjectAttendanceCard({
  attendance,
  onUpdateAttendance,
  onOpenSimulator,
}: SubjectAttendanceCardProps) {
  // Local quick simulations for subjects
  const [filterType, setFilterType] = useState<"All" | "Lecture" | "Lab">("All");

  const filteredSubjects = attendance.filter((sub) => {
    if (filterType === "All") return true;
    return sub.type === filterType;
  });

  return (
    <div className="relative neu-card neu-card-hover p-5 lg:p-6 flex flex-col justify-between border border-white/5 h-full group">
      {/* Header with Type Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg neu-inset-well">
            <BookMarked className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Subject-Wise Attendance &amp; Bunk Radar
            </h3>
            <p className="text-[11px] text-slate-400">
              Live eligibility status and margin analysis (75% Threshold)
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 neu-inset-well p-1 rounded-xl">
          {(["All", "Lecture", "Lab"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                filterType === type
                  ? "neu-raised-sm text-amber-300 font-bold bg-[#1F2430] border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects List */}
      <div className="my-3 space-y-3.5 max-h-[380px] overflow-y-auto pr-1.5">
        {filteredSubjects.map((subject) => {
          const percentage =
            subject.total > 0 ? (subject.attended / subject.total) * 100 : 0;
          const status = calculateAttendanceStatus(percentage);
          const advice = getBunkAdvice(subject.attended, subject.total, 75);

          return (
            <div
              key={subject.id}
              className="p-3.5 rounded-2xl neu-raised-sm hover:border-amber-500/20 transition-all border border-white/[0.03] bg-[#181C25]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md neu-inset-well text-amber-400 border border-amber-500/20">
                      Module {subject.code}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded neu-inset-track text-slate-400">
                      {subject.attended} / {subject.total} Sessions
                    </span>
                    {subject.absent !== undefined && subject.absent > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded neu-inset-track text-rose-400/80">
                        {subject.absent} Absent
                      </span>
                    )}
                    {subject.condoned !== undefined && subject.condoned > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded neu-inset-track text-emerald-400/90">
                        +{subject.condoned} Condoned
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 mt-1 line-clamp-1">
                    {subject.name}
                  </h4>
                </div>

                {/* Percentage Readout */}
                <div className="text-right shrink-0">
                  <span
                    className="font-mono text-base font-extrabold"
                    style={{ color: status.color }}
                  >
                    {(subject.percentage !== undefined ? subject.percentage : percentage).toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {subject.attended}/{subject.total} Present
                  </span>
                </div>
              </div>

              {/* Deeply Pressed Inset Progress Track */}
              <div className="mt-2.5 h-2.5 w-full rounded-full neu-inset-track overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    backgroundColor: status.color,
                    boxShadow: `0 0 10px ${status.glow}`,
                  }}
                />
              </div>

              {/* Bunk / Recovery Calculator Pill & Quick Simulator Controls */}
              <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                {/* Advice Pill */}
                <div
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5"
                  style={{
                    backgroundColor: status.badgeBg,
                    color: status.color,
                    border: `1px solid ${status.badgeBorder}`,
                  }}
                >
                  {advice.status === "safe" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : advice.status === "warning" ? (
                    <Flame className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  <span>{advice.text}</span>
                </div>

                {/* Quick Interactive Tweak Buttons */}
                {onUpdateAttendance && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-500 mr-1 hidden sm:inline">
                      Simulate:
                    </span>
                    <button
                      onClick={() => onUpdateAttendance(subject.id, 1, 1)}
                      className="px-2 py-0.5 rounded-md neu-raised-sm hover:text-emerald-400 text-slate-300 text-[10px] font-mono flex items-center gap-0.5 transition-colors"
                      title="Simulate attending next class"
                    >
                      <Plus className="w-3 h-3" /> Attend
                    </button>
                    <button
                      onClick={() => onUpdateAttendance(subject.id, 0, 1)}
                      className="px-2 py-0.5 rounded-md neu-raised-sm hover:text-rose-400 text-slate-300 text-[10px] font-mono flex items-center gap-0.5 transition-colors"
                      title="Simulate skipping next class"
                    >
                      <Minus className="w-3 h-3" /> Bunk
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">
          Target: 75% for Exam Hall Ticket Eligibility
        </span>
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
          >
            Launch Full Simulator →
          </button>
        )}
      </div>
    </div>
  );
}

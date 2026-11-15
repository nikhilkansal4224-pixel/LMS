"use client";

import React from "react";
import { AcademicSemester } from "@/types/student";
import { GraduationCap, Award, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

interface GradesCgpaCardProps {
  cgpa: number;
  currentSgpa: number;
  totalEarnedCredits: number;
  totalCreditsRequired: number;
  semesters: AcademicSemester[];
  onViewAcademics?: () => void;
}

export function GradesCgpaCard({
  cgpa,
  currentSgpa,
  totalEarnedCredits,
  totalCreditsRequired,
  semesters,
  onViewAcademics,
}: GradesCgpaCardProps) {
  const currentSemester = semesters[0];
  const courses = currentSemester ? currentSemester.courses.slice(0, 4) : [];
  const creditProgress = (totalEarnedCredits / totalCreditsRequired) * 100;

  return (
    <div className="relative neu-card neu-card-hover p-5 lg:p-6 flex flex-col justify-between border border-white/5 h-full group">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg neu-inset-well">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Academics &amp; CGPA</h3>
            <p className="text-[11px] text-slate-400">Credit progression &amp; scores</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Top 5%</span>
        </div>
      </div>

      {/* Prominent CGPA / SGPA Metrics */}
      <div className="my-3 grid grid-cols-2 gap-3">
        {/* Cumulative GPA */}
        <div className="p-4 rounded-2xl neu-inset-well border border-white/5 relative overflow-hidden bg-[#161920]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              CUMULATIVE CGPA
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {cgpa.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 10.0</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 block mt-1">
            ▲ +0.12 vs Target
          </span>
        </div>

        {/* Current Semester SGPA */}
        <div className="p-4 rounded-2xl neu-inset-well border border-white/5 relative overflow-hidden bg-[#161920]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              SEMESTER SGPA
            </span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-amber-400 tracking-tight">
              {currentSgpa.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 10.0</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 block mt-1">
            Dean&apos;s Honor List
          </span>
        </div>
      </div>

      {/* Degree Credits Progression Track */}
      <div className="p-3 rounded-2xl neu-raised-sm border border-white/[0.03] bg-[#181C25] my-2">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400">Degree Credits Completed</span>
          <span className="text-white font-bold">
            {totalEarnedCredits} / {totalCreditsRequired} ({creditProgress.toFixed(0)}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full neu-inset-track overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 shadow-neu-glow-amber transition-all duration-700"
            style={{ width: `${Math.max(5, creditProgress)}%` }}
          />
        </div>
      </div>

      {/* Recent Course Scores Preview */}
      <div className="space-y-1.5 my-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
          Key Course Grades
        </span>
        <div className="grid grid-cols-2 gap-2">
          {courses.map((course) => (
            <div
              key={course.code}
              className="p-2 rounded-xl neu-inset-well flex items-center justify-between text-xs"
            >
              <div className="truncate mr-1">
                <span className="font-mono text-[11px] font-bold text-slate-200 block truncate">
                  {course.code}
                </span>
                <span className="text-[9px] text-slate-500">
                  Total: {course.total}/100
                </span>
              </div>
              <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded neu-raised-sm text-amber-300 border border-amber-500/20 shrink-0">
                {course.grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer view detailed marks */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          Semester 01 • Autumn Cycle
        </span>
        {onViewAcademics && (
          <button
            onClick={onViewAcademics}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Full Transcript</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

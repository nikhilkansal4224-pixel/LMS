"use client";

import React, { useState } from "react";
import { AcademicSemester } from "@/types/student";
import { GraduationCap, Award, TrendingUp, BookOpen, Calculator, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AcademicsTabProps {
  academics: {
    cgpa: number;
    currentSgpa: number;
    totalEarnedCredits: number;
    totalCreditsRequired: number;
    semesters: AcademicSemester[];
  };
}

export function AcademicsTab({ academics }: AcademicsTabProps) {
  const currentSemester = academics.semesters[0];
  const [targetSgpa, setTargetSgpa] = useState<number>(9.0);

  // Grade point scale helper
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "O":
      case "A+":
        return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
      case "A":
        return "text-amber-300 bg-amber-500/15 border-amber-500/30";
      case "B+":
      case "B":
        return "text-sky-300 bg-sky-500/15 border-sky-500/30";
      default:
        return "text-rose-300 bg-rose-500/15 border-rose-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="neu-card p-6 border border-white/5 bg-gradient-to-r from-[#1B1F28] via-[#1E232F] to-[#1B1F28]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl neu-inset-well">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Academic Performance &amp; Evaluation Transcript
              </h2>
              <p className="text-xs text-slate-400">
                UPES SLCM Verified Transcript Records • Continuous Evaluation &amp; CGPA Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="neu-amber-pill px-4 py-2 rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300">
                Dean&apos;s Honor Distinction (Tier 1)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* High Impact GPA Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative CGPA */}
        <div className="neu-card p-5 border border-white/5 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            CUMULATIVE CGPA
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-white">
              {academics.cgpa.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 10.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grade Point Average: Excellent</span>
          </div>
        </div>

        {/* Semester SGPA */}
        <div className="neu-card p-5 border border-amber-500/20 shadow-neu-glow-amber relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            CURRENT SEMESTER SGPA
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-amber-400">
              {academics.currentSgpa.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 10.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Semester 01 Rank: #4 in Cohort</span>
          </div>
        </div>

        {/* Earned Credits */}
        <div className="neu-card p-5 border border-white/5 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            EARNED CREDITS
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-white">
              {academics.totalEarnedCredits}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / {academics.totalCreditsRequired}
            </span>
          </div>
          <span className="mt-2 text-[11px] font-mono text-slate-400 block">
            100% Core Course Completion
          </span>
        </div>

        {/* Academic Standing */}
        <div className="neu-card p-5 border border-white/5 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            ACADEMIC STANDING
          </span>
          <div className="mt-2">
            <span className="font-mono text-2xl font-black text-emerald-400">
              REGULAR
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>0 Active Backlogs • Clean</span>
          </div>
        </div>
      </div>

      {/* Interactive Target SGPA Predictor */}
      <div className="neu-card p-6 border border-white/5 bg-[#191D26]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Interactive Target SGPA Predictor
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Current SGPA: {academics.currentSgpa.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="p-4 rounded-2xl neu-inset-well">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Desired Target SGPA:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="7.0"
                max="10.0"
                step="0.05"
                value={targetSgpa}
                onChange={(e) => setTargetSgpa(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-lg font-bold text-amber-400 min-w-[48px]">
                {targetSgpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-inset-well col-span-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Required End-Sem Strategy:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              To hit <span className="text-amber-400 font-bold">{targetSgpa.toFixed(2)} SGPA</span>, you need an average of{" "}
              <span className="text-emerald-400 font-bold">
                {Math.min(100, Math.round(targetSgpa * 9.5))}/100
              </span>{" "}
              marks across pending End-Term written examinations with at least 4 &quot;A+&quot; grades in 4-credit courses.
            </p>
          </div>
        </div>
      </div>

      {/* Semester Breakdown & Course Marks Table */}
      {currentSemester && (
        <div className="neu-card p-6 border border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white">
                {currentSemester.semester} — Course Evaluation Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Internals (30) • Mid-Sem (30) • End-Sem (40) = Total (100)
              </p>
            </div>

            <div className="px-3 py-1 rounded-xl neu-inset-well text-xs font-mono text-amber-300 font-bold">
              Total Credits: {currentSemester.creditsEarned}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">COURSE CODE &amp; TITLE</th>
                  <th className="pb-3 font-semibold text-center">CREDITS</th>
                  <th className="pb-3 font-semibold text-center">INTERNALS (30)</th>
                  <th className="pb-3 font-semibold text-center">MID SEM (30)</th>
                  <th className="pb-3 font-semibold text-center">END SEM (40)</th>
                  <th className="pb-3 font-semibold text-center">TOTAL (100)</th>
                  <th className="pb-3 font-semibold text-center">GRADE</th>
                  <th className="pb-3 font-semibold text-right">GRADE POINT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentSemester.courses.map((course) => (
                  <tr key={course.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4">
                      <span className="font-mono font-bold text-amber-400 block">
                        {course.code}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {course.name}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {course.credits}
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {course.internals}/30
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {course.midSem > 0 ? `${course.midSem}/30` : "N/A"}
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {course.endSem}/40
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-white">
                      {course.total}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-extrabold border ${getGradeBadge(
                          course.grade
                        )}`}
                      >
                        {course.grade}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-amber-300">
                      {course.gradePoint} / 10
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

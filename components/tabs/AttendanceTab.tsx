"use client";

import React, { useState } from "react";
import { AttendanceSubject } from "@/types/student";
import { calculateAttendanceStatus, getBunkAdvice } from "@/lib/utils";
import {
  UserCheck,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

interface AttendanceTabProps {
  attendance: AttendanceSubject[];
  onUpdateAttendance: (id: string, deltaAttended: number, deltaTotal: number) => void;
  onReset: () => void;
}

export function AttendanceTab({
  attendance,
  onUpdateAttendance,
  onReset,
}: AttendanceTabProps) {
  // Selected subject for the What-If Simulator
  const [selectedSubId, setSelectedSubId] = useState<string>(attendance[0]?.id || "");
  const [simAttendExtra, setSimAttendExtra] = useState<number>(0);
  const [simBunkExtra, setSimBunkExtra] = useState<number>(0);
  const [targetThreshold, setTargetThreshold] = useState<number>(75);

  const activeSubject =
    attendance.find((s) => s.id === selectedSubId) || attendance[0];

  // Calculate simulated values
  const simulatedAttended = Math.max(
    0,
    (activeSubject?.attended || 0) + simAttendExtra
  );
  const simulatedTotal = Math.max(
    simulatedAttended,
    (activeSubject?.total || 0) + simAttendExtra + simBunkExtra
  );
  const simulatedPct =
    simulatedTotal > 0 ? (simulatedAttended / simulatedTotal) * 100 : 0;
  const currentPct =
    activeSubject && activeSubject.total > 0
      ? (activeSubject.attended / activeSubject.total) * 100
      : 0;

  const simStatus = calculateAttendanceStatus(simulatedPct);
  const simAdvice = getBunkAdvice(simulatedAttended, simulatedTotal, targetThreshold);

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="neu-card p-6 border border-white/5 bg-gradient-to-r from-[#1B1F28] via-[#1E232F] to-[#1B1F28]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl neu-inset-well">
              <UserCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Attendance &amp; Bunk Intelligence Sentinel
              </h2>
              <p className="text-xs text-slate-400">
                UPES Dehradun 75% Mandate Simulator • Predict your safe absence margins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 neu-inset-well px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-slate-400">Target Rule:</span>
              <button
                onClick={() => setTargetThreshold(targetThreshold === 75 ? 80 : 75)}
                className="text-amber-400 font-bold hover:underline"
              >
                {targetThreshold}% Threshold
              </button>
            </div>

            <button
              onClick={() => {
                setSimAttendExtra(0);
                setSimBunkExtra(0);
                onReset();
              }}
              className="neu-raised-btn px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Bunk & Attendance Simulator */}
      <div className="neu-card p-6 border border-amber-500/20 shadow-neu-glow-amber bg-[#191D26]">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Interactive &quot;What-If&quot; Attendance Simulator
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400/90 px-2.5 py-0.5 rounded-full neu-inset-well border border-amber-500/20">
            Real-Time Mathematical Engine
          </span>
        </div>

        {/* Simulator Grid */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Subject Selector */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                Select Course to Simulate:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attendance.map((sub) => {
                  const isSelected = sub.id === activeSubject?.id;
                  const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        setSimAttendExtra(0);
                        setSimBunkExtra(0);
                      }}
                      className={`p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? "neu-inset-well border border-amber-500/40 bg-[#14171E]"
                          : "neu-raised-sm hover:border-amber-500/20 bg-[#1B1F28]"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold block text-amber-400">
                        {sub.code}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {sub.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold mt-1 block ${
                          pct >= 75
                            ? "text-emerald-400"
                            : pct >= 65
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {pct.toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Sliders / Increments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Simulate Attending Next Classes */}
              <div className="p-4 rounded-2xl neu-inset-well border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Attend Next Classes
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSimAttendExtra(Math.max(0, simAttendExtra - 1))}
                    className="w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center text-slate-300 hover:text-emerald-400 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xl font-black text-emerald-400">
                    +{simAttendExtra}
                  </span>
                  <button
                    onClick={() => setSimAttendExtra(simAttendExtra + 1)}
                    className="w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center text-slate-300 hover:text-emerald-400 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500 text-center block mt-2">
                  Simulate perfect attendance
                </span>
              </div>

              {/* Simulate Bunking / Skipping Classes */}
              <div className="p-4 rounded-2xl neu-inset-well border border-rose-500/20">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                  <Flame className="w-4 h-4" />
                  Bunk / Skip Next Classes
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSimBunkExtra(Math.max(0, simBunkExtra - 1))}
                    className="w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center text-slate-300 hover:text-rose-400 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xl font-black text-rose-400">
                    +{simBunkExtra}
                  </span>
                  <button
                    onClick={() => setSimBunkExtra(simBunkExtra + 1)}
                    className="w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center text-slate-300 hover:text-rose-400 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500 text-center block mt-2">
                  Simulate planned absences
                </span>
              </div>
            </div>
          </div>

          {/* Outcome Prediction Card (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl neu-inset-well border border-amber-500/30 bg-[#14171E] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  PROJECTED STATUS
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: simStatus.badgeBg,
                    color: simStatus.color,
                  }}
                >
                  {simStatus.label}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className="font-mono text-4xl font-black tracking-tight"
                  style={{ color: simStatus.color }}
                >
                  {simPctFormatted(simulatedPct)}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  (was {currentPct.toFixed(1)}%)
                </span>
              </div>

              {/* Attended / Total Readout */}
              <div className="mt-2 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Simulated Attended:</span>
                <span className="font-bold text-white">
                  {simulatedAttended} / {simulatedTotal}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-3 w-full rounded-full neu-inset-track overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${Math.min(100, simulatedPct)}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ backgroundColor: simStatus.color }}
                />
              </div>

              {/* Result Advice Pill */}
              <div
                className="mt-4 p-3 rounded-xl border text-xs font-mono leading-relaxed"
                style={{
                  backgroundColor: simStatus.badgeBg,
                  borderColor: simStatus.badgeBorder,
                  color: simStatus.color,
                }}
              >
                <strong>Outcome: </strong>
                {simAdvice.text}.{" "}
                {simulatedPct >= targetThreshold
                  ? "You remain eligible for end-sem exams."
                  : "Debarment risk! You must attend further lectures."}
              </div>
            </div>

            {/* Quick Commit button */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Temporary simulation preview
              </span>
              <button
                onClick={() => {
                  if (activeSubject) {
                    onUpdateAttendance(
                      activeSubject.id,
                      simAttendExtra,
                      simAttendExtra + simBunkExtra
                    );
                    setSimAttendExtra(0);
                    setSimBunkExtra(0);
                  }
                }}
                disabled={simAttendExtra === 0 && simBunkExtra === 0}
                className="neu-raised-btn px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-all"
              >
                Apply to Portal Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Table of All Enrolled Subjects */}
      <div className="neu-card p-6 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4">
          All Enrolled Subject Attendance Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">MODULE ID &amp; NAME</th>
                <th className="pb-3 font-semibold">TYPE</th>
                <th className="pb-3 font-semibold">PRESENT / SESSIONS</th>
                <th className="pb-3 font-semibold">ABSENT</th>
                <th className="pb-3 font-semibold">PERCENTAGE</th>
                <th className="pb-3 font-semibold">BUNK MARGIN</th>
                <th className="pb-3 font-semibold text-right">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendance.map((sub) => {
                const pct = sub.percentage !== undefined ? sub.percentage : (sub.total > 0 ? (sub.attended / sub.total) * 100 : 0);
                const status = calculateAttendanceStatus(pct);
                const advice = getBunkAdvice(sub.attended, sub.total, sub.threshold || 75);
                const absentSessions = sub.absent !== undefined ? sub.absent : Math.max(0, sub.total - sub.attended);

                return (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded neu-inset-well text-[10px]">
                          {sub.code}
                        </span>
                        <span className="text-slate-200 font-medium">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {sub.startDate && sub.endDate ? `${sub.startDate} to ${sub.endDate}` : sub.faculty}
                        {sub.condoned !== undefined && sub.condoned > 0 ? ` • +${sub.condoned} Condoned (OD/Medical)` : ""}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-slate-400">
                      {sub.type}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-slate-200 font-bold">
                      {sub.attended} / {sub.total}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-rose-400 font-semibold">
                      {absentSessions}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono font-bold"
                          style={{ color: status.color }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full neu-inset-track overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, pct)}%`,
                              backgroundColor: status.color,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium"
                        style={{
                          backgroundColor: status.badgeBg,
                          color: status.color,
                        }}
                      >
                        {advice.text}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        onClick={() => onUpdateAttendance(sub.id, 1, 1)}
                        className="neu-raised-sm px-2 py-1 rounded text-emerald-400 hover:text-emerald-300 font-mono text-[10px]"
                        title="Simulate Attend"
                      >
                        +1 Attended
                      </button>
                      <button
                        onClick={() => onUpdateAttendance(sub.id, 0, 1)}
                        className="neu-raised-sm px-2 py-1 rounded text-rose-400 hover:text-rose-300 font-mono text-[10px]"
                        title="Simulate Bunk"
                      >
                        +1 Bunk
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function simPctFormatted(val: number) {
  return isNaN(val) ? "0.0" : val.toFixed(1);
}

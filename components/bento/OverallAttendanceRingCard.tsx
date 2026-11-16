"use client";

import React from "react";
import { AttendanceSubject } from "@/types/student";
import { calculateAttendanceStatus, getBunkAdvice } from "@/lib/utils";
import { ShieldCheck, Flame, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface OverallAttendanceRingCardProps {
  attendance: AttendanceSubject[];
  onViewDetails?: () => void;
}

export function OverallAttendanceRingCard({
  attendance,
  onViewDetails,
}: OverallAttendanceRingCardProps) {
  const totalAttended = attendance.reduce((acc, curr) => acc + curr.attended, 0);
  const totalConducted = attendance.reduce((acc, curr) => acc + curr.total, 0);
  const totalAbsent = attendance.reduce(
    (acc, curr) => acc + (curr.absent ?? Math.max(0, curr.total - curr.attended)),
    0
  );
  const totalCondoned = attendance.reduce((acc, curr) => acc + (curr.condoned ?? 0), 0);
  const aggregatePercentage =
    totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;
  const formattedPct = aggregatePercentage.toFixed(1);

  const status = calculateAttendanceStatus(aggregatePercentage);
  const overallBunk = getBunkAdvice(totalAttended, totalConducted, 75);

  // SVG Circular parameters
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (aggregatePercentage / 100) * circumference;

  return (
    <div className="relative neu-card neu-card-hover p-5 lg:p-6 flex flex-col justify-between border border-white/5 h-full group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg neu-inset-well">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Overall Attendance</h3>
            <p className="text-[11px] text-slate-400">Semester aggregate gauge</p>
          </div>
        </div>

        {/* Status Pill */}
        <div
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5"
          style={{
            backgroundColor: status.badgeBg,
            borderColor: status.badgeBorder,
            color: status.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.label}
        </div>
      </div>

      {/* Center Animated Progress Ring */}
      <div className="my-3 flex items-center justify-around gap-4">
        <div className="relative flex items-center justify-center">
          {/* Deeply Inset Neumorphic Circular Well */}
          <div
            className="rounded-full neu-inset-well flex items-center justify-center p-3"
            style={{ width: size + 20, height: size + 20 }}
          >
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 overflow-visible"
            >
              <defs>
                <linearGradient
                  id="amberGoldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>

              {/* Inset Circular Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#13161D"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Animated Foreground Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#amberGoldGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  filter: "drop-shadow(0px 0px 6px rgba(245, 158, 11, 0.45))",
                }}
              />
            </svg>

            {/* Inner Percentage Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-black text-white tracking-tight">
                {formattedPct}%
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                AGGREGATE
              </span>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col gap-2">
          <div className="p-2.5 rounded-xl neu-inset-well">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Present / Conducted
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-mono font-bold text-white">
                {totalAttended}
              </span>
              <span className="text-xs font-mono text-slate-500">
                / {totalConducted} Sessions
              </span>
            </div>
            {totalAbsent > 0 && (
              <span className="text-[10px] font-mono text-rose-400/90 block mt-0.5">
                {totalAbsent} Absent {totalCondoned > 0 ? `• +${totalCondoned} Condoned` : ""}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl neu-inset-well">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Bunk Cushion
            </span>
            <span
              className={`text-xs font-mono font-bold mt-0.5 block ${
                overallBunk.status === "safe"
                  ? "text-emerald-400"
                  : overallBunk.status === "warning"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {overallBunk.text}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation link */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>UPES 75% Rule Compliant</span>
        </div>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Simulate</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

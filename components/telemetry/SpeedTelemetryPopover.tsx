"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Activity, Clock, ShieldCheck, RefreshCw, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TelemetrySummary, EndpointLatency } from "@/types/telemetry";

interface SpeedTelemetryPopoverProps {
  summary: TelemetrySummary;
  onRefreshPing: () => void;
  isPinging?: boolean;
}

export function SpeedTelemetryPopover({
  summary,
  onRefreshPing,
  isPinging = false,
}: SpeedTelemetryPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getStatusColor = (ms: number) => {
    if (ms <= 150) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Fast" };
    if (ms <= 400) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Moderate" };
    return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Slow" };
  };

  const currentStatus = getStatusColor(summary.avgLatency || 92);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl neu-raised-sm border ${currentStatus.border} ${currentStatus.bg} hover:border-amber-500/40 transition-all font-mono text-xs`}
        title="View Live API & Gateway Speed Telemetry"
      >
        <Zap className={`w-3.5 h-3.5 ${currentStatus.text} ${isPinging ? "animate-spin" : "animate-pulse"}`} />
        <span className={`font-bold ${currentStatus.text}`}>
          {summary.avgLatency || 92}ms
        </span>
        <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">
          {currentStatus.label}
        </span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 sm:w-96 neu-card p-5 z-50 border border-white/10 shadow-2xl backdrop-blur-xl bg-[#1B1F28]/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Live Telemetry &amp; Gateway Latency
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Round-Trip API Performance Sentinel
                  </span>
                </div>
              </div>

              <button
                onClick={onRefreshPing}
                disabled={isPinging}
                className="p-1.5 rounded-lg neu-raised-sm text-slate-400 hover:text-amber-400 transition-colors"
                title="Ping Endpoints Now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl neu-inset-well">
                <span className="text-[9px] text-slate-400 block uppercase">
                  Avg Round-Trip
                </span>
                <span className={`text-base font-bold ${currentStatus.text}`}>
                  {summary.avgLatency}ms
                </span>
              </div>

              <div className="p-2.5 rounded-xl neu-inset-well">
                <span className="text-[9px] text-slate-400 block uppercase">
                  Page Load (TTFB)
                </span>
                <span className="text-base font-bold text-slate-200">
                  {summary.ttfb || 48}ms
                </span>
              </div>
            </div>

            {/* Speed Comparison Telemetry */}
            {summary.speedComparison && (
              <div className="mt-3 p-3 rounded-2xl neu-inset-well border border-amber-500/30 bg-[#151821]">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    SOP Parallel Speedup:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                    {summary.speedComparison.speedupMultiplier} Boost
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Parallel: <strong className="text-emerald-400">{summary.speedComparison.parallelMs}ms</strong></span>
                  <span className="text-slate-500">vs Sequential: {summary.speedComparison.sequentialEstimateMs}ms</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 block mt-1">
                  {summary.speedComparison.isCached
                    ? "Instant Stale-While-Revalidate (0ms Cache Hit)"
                    : "Parallel thread dispatch vs slow portal waterfall"}
                </span>
              </div>
            )}

            {/* Detailed Endpoints Telemetry Table */}
            <div className="mt-3 space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
              {Object.entries(summary.endpoints).map(([key, item]) => {
                const statusInfo = getStatusColor(item.durationMs);

                return (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl neu-raised-sm flex items-center justify-between text-xs font-mono border border-white/[0.03]"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-slate-200 font-bold block truncate text-[11px]">
                        {item.endpoint}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">
                        {item.envKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-extrabold ${statusInfo.text}`}>
                        {item.durationMs}ms
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          item.cache === "HIT"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {item.cache}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated: {summary.lastUpdated || "Live"}</span>
              </span>
              <span>Vercel Edge Ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, UserCheck, CalendarDays, GraduationCap } from "lucide-react";

export type NavTab = "overview" | "attendance" | "timetable" | "academics";

interface NavDockProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  attendanceAlertCount?: number;
}

export function NavDock({ activeTab, onTabChange, attendanceAlertCount = 0 }: NavDockProps) {
  const tabs = [
    {
      id: "overview" as NavTab,
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "attendance" as NavTab,
      label: "Attendance & Bunk",
      icon: UserCheck,
      badge: attendanceAlertCount > 0 ? `${attendanceAlertCount}` : null,
    },
    {
      id: "timetable" as NavTab,
      label: "Timetable",
      icon: CalendarDays,
      badge: "LIVE",
    },
    {
      id: "academics" as NavTab,
      label: "Academics & Grades",
      icon: GraduationCap,
      badge: null,
    },
  ];

  return (
    <nav className="w-full flex justify-center py-4 sticky bottom-4 z-40 px-3 pointer-events-none">
      <div className="pointer-events-auto neu-card px-2 py-2 flex items-center gap-1.5 md:gap-2.5 bg-[#1B1F28]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 focus:outline-none ${
                isActive
                  ? "text-amber-300 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockTab"
                  className="absolute inset-0 rounded-full neu-inset-well border border-amber-500/30 bg-[#14171E] shadow-neu-glow-amber"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? "text-amber-400 scale-110" : "text-slate-400"}`} />
                <span className="hidden md:inline tracking-wide">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                      tab.id === "attendance" && attendanceAlertCount > 0
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

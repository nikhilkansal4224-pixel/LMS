"use client";

import React, { useState } from "react";
import { TimetableSlot } from "@/types/student";
import { Calendar, Clock, MapPin, User, Filter, Sparkles, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface TimetableTabProps {
  timetable: TimetableSlot[];
}

export function TimetableTab({ timetable }: TimetableTabProps) {
  const days: TimetableSlot["day"][] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [activeDay, setActiveDay] = useState<TimetableSlot["day"]>("Monday");
  const [filterType, setFilterType] = useState<"All" | "Lecture" | "Lab" | "Tutorial" | "Practical">("All");

  const daySlots = timetable
    .filter((slot) => slot.day === activeDay)
    .filter((slot) => (filterType === "All" ? true : slot.type === filterType));

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Lab":
        return "bg-purple-500/15 text-purple-300 border border-purple-500/30";
      case "Tutorial":
        return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
      case "Practical":
        return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="neu-card p-6 border border-white/5 bg-gradient-to-r from-[#1B1F28] via-[#1E232F] to-[#1B1F28]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl neu-inset-well">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                UPES Weekly Academic Timetable
              </h2>
              <p className="text-xs text-slate-400">
                Bidholi Campus Complex • Mon–Sat Schedule &amp; Lab Routing
              </p>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 neu-inset-well p-1 rounded-xl">
            {(["All", "Lecture", "Lab", "Tutorial", "Practical"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
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
      </div>

      {/* Day Selector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const isSelected = activeDay === day;
          const count = timetable.filter((s) => s.day === day).length;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-3 rounded-2xl text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-2.5 ${
                isSelected
                  ? "neu-inset-well border border-amber-500/40 text-amber-300 bg-[#14171E] shadow-neu-glow-amber"
                  : "neu-raised-btn text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{day}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full neu-inset-well text-amber-400/90 font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timetable Schedule Cards for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daySlots.length > 0 ? (
          daySlots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="neu-card neu-card-hover p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Type colored accent stripe */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  slot.isCancelled
                    ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                    : slot.type === "Lab"
                    ? "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : slot.type === "Tutorial"
                    ? "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)]"
                    : slot.type === "Practical"
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-amber-500 shadow-neu-glow-amber"
                }`}
              />

              <div className="pl-2">
                {/* Header Time & Type */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 px-2.5 py-1 rounded-xl neu-inset-well">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {slot.isCancelled && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Cancelled
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${getTypeBadgeStyle(
                        slot.type
                      )}`}
                    >
                      {slot.type}
                    </span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="my-2">
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    {slot.subjectCode}
                  </span>
                  <h4 className={`text-base font-bold text-white mt-0.5 ${slot.isCancelled ? "line-through opacity-70" : ""}`}>
                    {slot.subjectName}
                  </h4>
                </div>

                {/* Faculty & Room Info */}
                <div className="space-y-1.5 pt-3 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-slate-200">
                        {slot.venueName || `${slot.block} • ${slot.room}`}
                      </span>
                    </div>
                    {slot.meetingLink && (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-mono underline ml-auto"
                      >
                        Join Online →
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{slot.faculty}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full neu-card p-10 text-center text-slate-400 text-sm border border-white/5">
            No {filterType !== "All" ? filterType : ""} sessions scheduled for {activeDay}.
          </div>
        )}
      </div>

      {/* Campus Map & Navigation Tips Footer */}
      <div className="neu-card p-5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>
            UPES Bidholi Campus Map: Block 9 (CSE &amp; AI Labs) • Block 11 (High Performance Clusters) • Block 7 (Applied Sciences)
          </span>
        </div>
        <span className="font-mono text-[11px] text-amber-400">
          Standard Slot Duration: 60 mins / Lab: 120 mins
        </span>
      </div>
    </div>
  );
}

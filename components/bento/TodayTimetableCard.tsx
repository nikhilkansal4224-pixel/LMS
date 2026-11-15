"use client";

import React, { useState } from "react";
import { TimetableSlot } from "@/types/student";
import { MapPin, User, ArrowRight, BookOpen, Clock } from "lucide-react";

interface TodayTimetableCardProps {
  timetable: TimetableSlot[];
  onViewAll?: () => void;
}

export function TodayTimetableCard({ timetable, onViewAll }: TodayTimetableCardProps) {
  // Let's get today's slots or default to Monday if weekend
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
  const currentDayName = daysOfWeek[new Date().getDay()];
  const targetDay = (currentDayName === "Sunday" ? "Monday" : currentDayName) as TimetableSlot["day"];

  const [selectedDay] = useState<TimetableSlot["day"]>(targetDay);

  const daySlots = timetable.filter((slot) => slot.day === selectedDay);
  const upNextSlot = daySlots.length > 0 ? daySlots[0] : null;
  const remainingSlots = daySlots.slice(1);

  return (
    <div className="relative neu-card neu-card-hover p-5 lg:p-6 flex flex-col justify-between border border-white/5 h-full group">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg neu-inset-well">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Today&apos;s Schedule</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md neu-inset-well text-amber-400 uppercase">
                {selectedDay}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Classes &amp; Labs roadmap</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Full Week</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Up Next / Live Slot Feature Card */}
      {upNextSlot ? (
        <div className="my-3 p-3.5 rounded-2xl neu-inset-well border border-amber-500/30 relative overflow-hidden bg-[#151821]">
          {/* Glowing active indicator strip */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 shadow-neu-glow-amber" />

          <div className="pl-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                UP NEXT • {upNextSlot.startTime} – {upNextSlot.endTime}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {upNextSlot.type}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
              {upNextSlot.subjectName}
            </h4>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200 font-medium">
                  {upNextSlot.block} • {upNextSlot.room}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{upNextSlot.faculty}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl neu-inset-well text-center my-3 text-slate-400 text-xs">
          No classes scheduled for today!
        </div>
      )}

      {/* Remaining Classes List (Compact scrollable) */}
      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
          Remaining Today ({remainingSlots.length})
        </span>

        {remainingSlots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between p-2 rounded-xl neu-raised-sm hover:border-amber-500/20 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 px-1.5 py-0.5 rounded neu-inset-well">
                {slot.startTime}
              </span>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {slot.subjectName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {slot.block} • {slot.room}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
              {slot.type}
            </span>
          </div>
        ))}
      </div>

      {/* Footer quick room finding reminder */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>Bidholi Academic Complex</span>
        </span>
        <span>{daySlots.length} Slots Total</span>
      </div>
    </div>
  );
}

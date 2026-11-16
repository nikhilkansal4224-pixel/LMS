"use client";

import React from "react";
import { CalendarEvent } from "@/types/student";
import { Calendar, Clock, Tag, ExternalLink } from "lucide-react";

interface CalendarTabProps {
  events?: CalendarEvent[];
}

export function CalendarTab({ events = [] }: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <div className="neu-card p-6 bg-[#1B1F28] border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl neu-inset-well border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">University Calendar & Academic Events</h3>
              <span className="text-xs font-mono text-slate-400">
                Official holiday schedule and academic calendar from UPES SLCM
              </span>
            </div>
          </div>

          <a
            href="https://myupes-beta.upes.ac.in/connectportal/user/student/calendar-events"
            target="_blank"
            rel="noopener noreferrer"
            className="neu-raised-btn px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-all"
          >
            <span>Live Calendar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl neu-inset-well border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {ev.type || "Event"}
                    </span>
                    {ev.subType && (
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                        {ev.subType}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-2">{ev.name}</h4>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {ev.startDate}
                    {ev.endDate && ev.endDate !== ev.startDate ? ` – ${ev.endDate}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl neu-inset-well border border-white/5 text-center">
            <Calendar className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-white">Upcoming Events Synced</h4>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Events and official holidays will appear here as scheduled on UPES portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

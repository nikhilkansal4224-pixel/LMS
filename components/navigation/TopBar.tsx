"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, Calendar, ShieldCheck, Sliders, ChevronDown, LogOut, Zap } from "lucide-react";
import { StudentProfile, NotificationItem } from "@/types/student";
import { TelemetrySummary } from "@/types/telemetry";
import { getProfilePictureUrl, FALLBACK_AVATAR } from "@/lib/avatar";
import { NotificationPopover } from "./NotificationPopover";
import { SpeedTelemetryPopover } from "@/components/telemetry/SpeedTelemetryPopover";

interface TopBarProps {
  profile: StudentProfile;
  notifications: NotificationItem[];
  telemetry?: TelemetrySummary;
  onRefreshTelemetry?: () => void;
  isPinging?: boolean;
  onOpenConfig: () => void;
  onMarkAllNotificationsRead: () => void;
}

export function TopBar({
  profile,
  notifications,
  telemetry,
  onRefreshTelemetry,
  isPinging,
  onOpenConfig,
  onMarkAllNotificationsRead,
}: TopBarProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const avatarUrl = getProfilePictureUrl(profile.ProfilePictureInfo, FALLBACK_AVATAR);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue anyway
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="w-full neu-card px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-md bg-[#1B1F28]/95 border border-white/5">
      {/* Brand Logo & Emblem */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#262B37] to-[#161820] shadow-neu-raised-sm border border-amber-500/20 group cursor-pointer">
          <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-amber-500 to-amber-300 shadow-neu-glow-amber transition-transform duration-300 group-hover:rotate-45" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#1B1F28]" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-slate-100 font-sans">
              SOP
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-md neu-inset-well text-amber-400 border border-amber-500/25">
              UPES
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Student Operations Portal
          </span>
        </div>
      </div>

      {/* Center Live Clock & Semester Week Badge */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Real-time Ticking Clock */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-inset-well border border-white/5">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            {currentTime || "12:00:00 PM"}
          </span>
          <span className="text-slate-600">|</span>
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-xs text-slate-400">
            {currentDate || "Mon, Nov 16"}
          </span>
        </div>

        {/* Academic Semester Week Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-amber-pill">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span className="text-xs font-semibold font-mono text-amber-300">
            Semester Week 12
          </span>
          <span className="text-amber-500/50">•</span>
          <span className="text-[11px] font-mono text-amber-200/80">
            {profile.AcademicYearName || "AY 2026–27"}
          </span>
        </div>
      </div>

      {/* Right Actions: Speed Telemetry Pill + Notification Bell + Profile / Connect Portal */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Speed Telemetry Pill */}
        {telemetry && (
          <SpeedTelemetryPopover
            summary={telemetry}
            onRefreshPing={onRefreshTelemetry || (() => {})}
            isPinging={isPinging}
          />
        )}

        {/* Notification Bell with Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl neu-raised-btn text-slate-300 hover:text-amber-400 transition-colors focus:outline-none"
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-mono font-bold text-black shadow-neu-glow-amber">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPopover
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkAllRead={onMarkAllNotificationsRead}
          />
        </div>

        {/* Student Profile / Connect Portal Modal Trigger */}
        <button
          onClick={onOpenConfig}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl neu-raised-btn group border border-white/5 hover:border-amber-500/30 transition-all"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden neu-inset-well border border-amber-500/40 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={profile.FirstName}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_AVATAR;
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors leading-tight">
              {profile.FirstName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 leading-tight">
              {profile.GlobalId}
            </span>
          </div>
          <div className="flex items-center text-slate-400 group-hover:text-amber-400 pl-1">
            <Sliders className="w-3.5 h-3.5 hidden sm:inline" />
            <ChevronDown className="w-3 h-3 sm:hidden" />
          </div>
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="p-2.5 rounded-xl neu-raised-btn text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all focus:outline-none"
          title="Sign Out from Portal"
          aria-label="Sign Out"
        >
          <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}

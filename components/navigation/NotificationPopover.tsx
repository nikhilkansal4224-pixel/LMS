"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/types/student";
import { AlertTriangle, Info, CheckCircle2, XCircle, Bell, Check } from "lucide-react";

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export function NotificationPopover({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-14 w-80 md:w-96 neu-card p-4 z-50 border border-white/10 shadow-2xl backdrop-blur-md bg-[#1B1F28]/95"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-sm text-slate-100">Portal Notifications</span>
              <span className="text-xs px-2 py-0.5 rounded-full neu-inset-well text-amber-400 font-mono">
                {notifications.filter((n) => !n.read).length} new
              </span>
            </div>
            <button
              onClick={onMarkAllRead}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl transition-all ${
                  item.read
                    ? "bg-[#14171E]/40 border border-white/[0.02]"
                    : "neu-inset-well border border-amber-500/20 bg-[#161920]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              UPES SLCM Automated Attendance Sentinel
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/types/student";
import { getProfilePictureUrl, FALLBACK_AVATAR } from "@/lib/avatar";
import { Copy, Check, MapPin, Sparkles, Cpu, GraduationCap, Terminal } from "lucide-react";

interface CollegeIdCardProps {
  profile: StudentProfile;
  onOpenInspector?: () => void;
}

export function CollegeIdCard({ profile, onOpenInspector }: CollegeIdCardProps) {
  const [copied, setCopied] = useState(false);
  const avatarUrl = getProfilePictureUrl(profile.ProfilePictureInfo, FALLBACK_AVATAR);

  const handleCopySapId = () => {
    navigator.clipboard.writeText(profile.GlobalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative neu-card neu-card-hover p-5 lg:p-6 flex flex-col justify-between overflow-hidden border border-white/5 h-full group">
      {/* Metallic Amber Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200" />

      {/* Decorative Smart Hologram Chip & University Emblem Watermark */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-md neu-inset-well border border-amber-500/30 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              SMART ID PASS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">NFC ENCRYPTED</span>
        </div>

        {/* Tactile Raised Semester Number Badge & Raw API trigger */}
        <div className="flex items-center gap-2">
          {onOpenInspector && (
            <button
              onClick={onOpenInspector}
              className="p-1 rounded-lg neu-inset-well text-[10px] font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              title="Inspect Raw Profile JSON"
            >
              <Terminal className="w-3 h-3 text-amber-400" />
              <span>JSON</span>
            </button>
          )}

          <div className="px-3 py-1 rounded-xl neu-raised-sm border border-amber-500/20 bg-[#1D212B] flex items-center gap-1.5 shadow-neu-raised-sm">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-extrabold text-amber-400 tracking-wider">
              {profile.TermName || "SEM 01"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Student Profile Identity Section */}
      <div className="my-4 flex items-center gap-4">
        {/* Avatar with Glowing Amber Ring */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden neu-inset-well p-0.5 border-2 border-amber-500/60 shadow-neu-glow-amber">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={profile.FirstName}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_AVATAR;
              }}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#1B1F28] border border-amber-500/40">
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight truncate">
              {[profile.FirstName, profile.LastName].filter(Boolean).join(" ")}
            </h2>
          </div>

          <p className="text-xs text-amber-400 font-medium mt-0.5 line-clamp-1">
            {profile.ProgramTypeName}
          </p>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1.5">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{profile.CenterName}</span>
          </div>
        </div>
      </div>

      {/* Footer Info: SAP ID with 1-Click Copy & Barcode graphic */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            SAP / GLOBAL ID
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm font-bold text-slate-100 tracking-wider">
              {profile.GlobalId}
            </span>
            <button
              onClick={handleCopySapId}
              className="p-1 rounded-md neu-raised-sm hover:text-amber-400 text-slate-400 transition-colors"
              title="Copy SAP ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {copied && (
              <span className="text-[10px] font-mono text-emerald-400 animate-fade-in">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* Minimalist Barcode representation */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-[2.5px] h-6 px-2 py-1 rounded neu-inset-track">
            <span className="w-[1.5px] h-full bg-slate-400" />
            <span className="w-[3px] h-full bg-slate-300" />
            <span className="w-[1px] h-full bg-slate-500" />
            <span className="w-[2px] h-full bg-slate-300" />
            <span className="w-[1px] h-full bg-slate-500" />
            <span className="w-[4px] h-full bg-amber-400/80" />
            <span className="w-[1.5px] h-full bg-slate-400" />
            <span className="w-[2px] h-full bg-slate-300" />
            <span className="w-[1px] h-full bg-slate-400" />
            <span className="w-[3px] h-full bg-slate-300" />
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">
            UPES • VALID {profile.ValidUpto || "2030"}
          </span>
        </div>
      </div>
    </div>
  );
}

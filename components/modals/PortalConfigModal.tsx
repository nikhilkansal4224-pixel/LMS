"use client";

import React, { useState } from "react";
import { StudentDashboardData, StudentProfile } from "@/types/student";
import { getProfilePictureUrl, FALLBACK_AVATAR } from "@/lib/avatar";
import { X, Check, RotateCcw, Link2, Sparkles, Copy, Download, Upload, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PortalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StudentDashboardData;
  onSave: (newData: StudentDashboardData) => void;
  onReset: () => void;
}

export function PortalConfigModal({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
}: PortalConfigModalProps) {
  const [profile, setProfile] = useState<StudentProfile>(data.profile);
  const [activeTab, setActiveTab] = useState<"profile" | "portal" | "json">("profile");
  const [proxyTestResult, setProxyTestResult] = useState<any>(null);
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [jsonString, setJsonString] = useState<string>(
    JSON.stringify(data, null, 2)
  );

  const handleProfileChange = (field: keyof StudentProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const updated = { ...data, profile };
    onSave(updated);
    onClose();
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      onSave(parsed);
      onClose();
    } catch (e: any) {
      alert("Invalid JSON format: " + e.message);
    }
  };

  const handleTestProxy = async () => {
    setIsTestingProxy(true);
    setProxyTestResult(null);
    try {
      const res = await fetch("/api/proxy/student/attendance", {
        headers: {
          "x-session-token": profile.SessionToken || "sample-session-token-upes",
          "x-sap-id": profile.GlobalId,
          "x-target-url": profile.PortalApiUrl || "https://slcm.upes.ac.in/api/v1",
        },
      });
      const json = await res.json();
      setProxyTestResult(json);
    } catch (e: any) {
      setProxyTestResult({ error: e.message || "Failed to contact proxy" });
    } finally {
      setIsTestingProxy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="neu-card w-full max-w-2xl bg-[#1B1F28] border border-white/10 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl neu-inset-well">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Customize Template &amp; Connect UPES Portal
                </h3>
                <p className="text-xs text-slate-400">
                  Update student identity details or bind your live SLCM session token
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl neu-raised-sm hover:text-amber-400 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-2 mt-4 p-1 rounded-xl neu-inset-well">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
                activeTab === "profile"
                  ? "neu-raised-sm text-amber-300 font-bold bg-[#1F2430] border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1. Profile Identity
            </button>
            <button
              onClick={() => setActiveTab("portal")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
                activeTab === "portal"
                  ? "neu-raised-sm text-amber-300 font-bold bg-[#1F2430] border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2. Live Portal &amp; CORS Proxy
            </button>
            <button
              onClick={() => {
                setJsonString(JSON.stringify({ ...data, profile }, null, 2));
                setActiveTab("json");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
                activeTab === "json"
                  ? "neu-raised-sm text-amber-300 font-bold bg-[#1F2430] border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              3. Raw JSON
            </button>
          </div>

          {/* Tab 1: Profile Details */}
          {activeTab === "profile" && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.FirstName}
                    onChange={(e) => handleProfileChange("FirstName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.LastName || ""}
                    onChange={(e) => handleProfileChange("LastName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    SAP / Global ID
                  </label>
                  <input
                    type="text"
                    value={profile.GlobalId}
                    onChange={(e) => handleProfileChange("GlobalId", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Semester Code (e.g. SEM 01)
                  </label>
                  <input
                    type="text"
                    value={profile.TermName}
                    onChange={(e) => handleProfileChange("TermName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm font-mono text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  Program &amp; Specialization
                </label>
                <input
                  type="text"
                  value={profile.ProgramTypeName}
                  onChange={(e) => handleProfileChange("ProgramTypeName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    value={profile.CenterName}
                    onChange={(e) => handleProfileChange("CenterName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={profile.AcademicYearName}
                    onChange={(e) => handleProfileChange("AcademicYearName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset-well text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  Avatar / Photo (URL or UPES FilePath e.g. /edutech/documents/iemsfilecontainer/...)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden neu-inset-well border border-amber-500/40 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProfilePictureUrl(profile.ProfilePictureInfo, FALLBACK_AVATAR)}
                      alt="Avatar preview"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={
                      typeof profile.ProfilePictureInfo === "object" && profile.ProfilePictureInfo !== null
                        ? profile.ProfilePictureInfo.FilePath || ""
                        : profile.ProfilePictureInfo || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith("/edutech/") || val.includes("iemsfilecontainer")) {
                        handleProfileChange("ProfilePictureInfo", {
                          FilePath: val,
                          ContainerName: "iemsfilecontainer",
                        } as any);
                      } else {
                        handleProfileChange("ProfilePictureInfo", val);
                      }
                    }}
                    placeholder="/edutech/documents/iemsfilecontainer/photo.jpeg or https://..."
                    className="flex-1 px-3 py-2 rounded-xl neu-inset-well text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={onReset}
                  className="neu-raised-sm px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Sample (Nikhil)</span>
                </button>

                <button
                  onClick={handleSaveProfile}
                  className="neu-raised-btn px-5 py-2 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-all shadow-neu-glow-amber"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Live UPES Portal & CORS Proxy */}
          {activeTab === "portal" && (
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl neu-inset-well border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-400 font-mono">CORS Proxy Route: </strong>
                <code>/api/proxy/[...path]</code> is configured to forward requests to UPES SLCM with your session token, bypassing browser cross-origin blocks.
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  UPES SLCM Session Token / Bearer Token
                </label>
                <input
                  type="text"
                  placeholder="Paste your token from browser cookies / session storage..."
                  value={profile.SessionToken || ""}
                  onChange={(e) => handleProfileChange("SessionToken", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset-well text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  Target Portal API Base URL
                </label>
                <input
                  type="text"
                  value={profile.PortalApiUrl || "https://slcm.upes.ac.in/api/v1"}
                  onChange={(e) => handleProfileChange("PortalApiUrl", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset-well text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Test Proxy Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestProxy}
                  disabled={isTestingProxy}
                  className="neu-raised-btn px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2 transition-all"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{isTestingProxy ? "Pinging Proxy..." : "Test Proxy Connection"}</span>
                </button>
              </div>

              {/* Proxy Test Result Box */}
              {proxyTestResult && (
                <div className="p-3.5 rounded-xl neu-inset-well border border-white/5 font-mono text-[11px] max-h-48 overflow-y-auto">
                  <span className="text-amber-400 font-bold block mb-1">
                    Proxy Response:
                  </span>
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(proxyTestResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-white/5">
                <button
                  onClick={handleSaveProfile}
                  className="neu-raised-btn px-5 py-2 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Portal Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Raw JSON */}
          {activeTab === "json" && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  Full Dashboard State JSON
                </label>
                <textarea
                  rows={12}
                  value={jsonString}
                  onChange={(e) => setJsonString(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset-well text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    const blob = new Blob([jsonString], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `sop-student-${profile.GlobalId}.json`;
                    a.click();
                  }}
                  className="neu-raised-sm px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleSaveJson}
                  className="neu-raised-btn px-5 py-2 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-all shadow-neu-glow-amber"
                >
                  <Check className="w-4 h-4" />
                  <span>Load JSON State</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

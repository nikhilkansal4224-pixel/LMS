"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Clock, ShieldCheck, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RawApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpointUrl: string;
  payload: any;
  durationMs?: number;
  statusText?: string;
}

export function RawApiInspectorModal({
  isOpen,
  onClose,
  title,
  endpointUrl,
  payload,
  durationMs = 84,
  statusText = "200 OK (Live)",
}: RawApiInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(payload || { status: "Empty or Unconfigured" }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="neu-card w-full max-w-3xl bg-[#1B1F28] border border-white/10 shadow-2xl p-6 relative max-h-[85vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl neu-inset-well border border-amber-500/30">
                  <Terminal className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Raw API Inspector: {title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live UPES SLCM Response Payload
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg neu-raised-sm hover:text-amber-400 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target URL & Stats banner */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl neu-inset-well flex items-center gap-2 col-span-2">
                <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300 truncate">
                  {endpointUrl || "/api/proxy/student/..."}
                </span>
              </div>
              <div className="p-2.5 rounded-xl neu-inset-well flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {durationMs}ms
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          {/* JSON code area */}
          <div className="my-4 flex-1 min-h-[220px] max-h-[420px] overflow-y-auto rounded-xl neu-inset-well p-4 border border-white/5">
            <pre className="font-mono text-xs text-amber-200/90 whitespace-pre-wrap leading-relaxed">
              {jsonString}
            </pre>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] text-slate-500">
              Payload Size: ~{(jsonString.length / 1024).toFixed(1)} KB
            </span>

            <button
              onClick={handleCopy}
              className="neu-raised-btn px-4 py-2 rounded-xl text-amber-300 hover:text-white flex items-center gap-1.5 text-xs transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Payload</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Raw JSON</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

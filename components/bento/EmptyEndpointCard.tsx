"use client";

import React, { useState } from "react";
import { Link2Off, Copy, Check, Terminal, ExternalLink } from "lucide-react";

interface EmptyEndpointCardProps {
  title: string;
  moduleName: string;
  envKey: string;
  exampleUrl: string;
  onOpenConfig?: () => void;
  onOpenInspector?: () => void;
}

export function EmptyEndpointCard({
  title,
  moduleName,
  envKey,
  exampleUrl,
  onOpenConfig,
  onOpenInspector,
}: EmptyEndpointCardProps) {
  const [copied, setCopied] = useState(false);

  const copyConfigSnippet = () => {
    navigator.clipboard.writeText(`${envKey}=${exampleUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="neu-card p-6 border border-amber-500/20 relative overflow-hidden flex flex-col justify-between h-full bg-[#1B1F28] group">
      {/* Amber corner accent indicator */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.04] rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl neu-inset-well border border-amber-500/30">
              <Link2Off className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <span className="text-[10px] font-mono text-amber-400">
                {moduleName} • Live Stream Pending
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full neu-inset-well text-slate-400 border border-white/5">
            100% API DRIVEN
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          No static fake subjects are stored in this template. To populate this card with your live UPES portal records, link your endpoint in <code className="text-amber-300 font-mono">.env.local</code>:
        </p>

        {/* Copyable snippet well */}
        <div className="mt-3 p-3 rounded-xl neu-inset-well flex items-center justify-between gap-2 border border-white/5">
          <code className="text-xs font-mono text-slate-200 truncate">
            {envKey}={exampleUrl}
          </code>
          <button
            onClick={copyConfigSnippet}
            className="p-1.5 rounded-lg neu-raised-sm hover:text-amber-400 text-slate-400 transition-colors shrink-0"
            title="Copy Config Line"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Footer controls */}
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-500">
          Vercel / Localhost Ready
        </span>

        <div className="flex items-center gap-2">
          {onOpenInspector && (
            <button
              onClick={onOpenInspector}
              className="px-2.5 py-1 rounded-lg neu-inset-well text-[10px] font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3 h-3" />
              <span>Inspect API</span>
            </button>
          )}

          {onOpenConfig && (
            <button
              onClick={onOpenConfig}
              className="px-3 py-1 rounded-lg neu-raised-btn text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Configure →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

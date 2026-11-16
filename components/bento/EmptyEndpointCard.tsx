"use client";

import React, { useState } from "react";
import {
  Link2Off,
  Copy,
  Check,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export interface EndpointDiagnosticInfo {
  targetUrl?: string;
  statusCode?: number | string;
  statusText?: string;
  rawSnippet?: string;
  method?: string;
  sentBody?: any;
  expectedSchemaFromBlueprint?: any;
}

interface EmptyEndpointCardProps {
  title: string;
  moduleName: string;
  envKey: string;
  exampleUrl: string;
  diagnostic?: EndpointDiagnosticInfo;
  onOpenConfig?: () => void;
  onOpenInspector?: () => void;
  onRetry?: () => void;
}

export function EmptyEndpointCard({
  title,
  moduleName,
  envKey,
  exampleUrl,
  diagnostic,
  onOpenConfig,
  onOpenInspector,
  onRetry,
}: EmptyEndpointCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isDiagnosticExpanded, setIsDiagnosticExpanded] = useState(false);

  const copyConfigSnippet = () => {
    navigator.clipboard.writeText(`${envKey}=${exampleUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const hasDiagnostic = Boolean(diagnostic?.targetUrl || diagnostic?.statusCode);

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
          No hardcoded student data is stored in this portal. Connecting live to UPES endpoint:
        </p>

        {/* Copyable snippet well */}
        <div className="mt-2.5 p-3 rounded-xl neu-inset-well flex items-center justify-between gap-2 border border-white/5">
          <code className="text-xs font-mono text-slate-200 truncate" title={exampleUrl}>
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

        {/* Live "Connection Inspector" Diagnostic Banner */}
        <div className="mt-3 rounded-xl neu-inset-well border border-amber-500/20 overflow-hidden">
          <button
            onClick={() => setIsDiagnosticExpanded(!isDiagnosticExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono font-medium text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/[0.03]"
          >
            <div className="flex items-center gap-2 truncate">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold">Live API Diagnostic</span>
              {diagnostic?.statusCode && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    Number(diagnostic.statusCode) >= 200 && Number(diagnostic.statusCode) < 300
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  HTTP {diagnostic.statusCode}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <span className="text-[10px] hidden sm:inline">
                {isDiagnosticExpanded ? "Collapse" : "Expand"}
              </span>
              {isDiagnosticExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
          </button>

          {isDiagnosticExpanded && (
            <div className="p-3 border-t border-white/5 space-y-2.5 text-xs font-mono bg-black/20">
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                  Target Endpoint URL:
                </span>
                <code className="text-[11px] text-amber-300 break-all select-all block mt-0.5 font-semibold">
                  {diagnostic?.targetUrl || exampleUrl}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    HTTP Method:
                  </span>
                  <span className="text-slate-200 text-[11px] font-bold">
                    {diagnostic?.method || "POST / GET"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Response Status:
                  </span>
                  <span className="text-slate-200 text-[11px] font-bold">
                    {diagnostic?.statusCode || "Awaiting Stream"} {diagnostic?.statusText || ""}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider">
                    UPES Server Response (First 300 chars):
                  </span>
                  {diagnostic?.rawSnippet && (
                    <button
                      onClick={() => copySnippet(diagnostic.rawSnippet || "")}
                      className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                    >
                      {copiedSnippet ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <pre className="p-2.5 rounded-lg bg-black/50 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono border border-white/5 select-all leading-relaxed">
                  {diagnostic?.rawSnippet ||
                    "No server response received yet. Ensure you are signed in with your UPES student account."}
                </pre>
              </div>

              {diagnostic?.sentBody && (
                <div className="pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-400/80 text-[10px] uppercase tracking-wider font-bold">
                      Sent Payload (JSON):
                    </span>
                    <button
                      onClick={() =>
                        copySnippet(
                          typeof diagnostic.sentBody === "string"
                            ? diagnostic.sentBody
                            : JSON.stringify(diagnostic.sentBody, null, 2)
                        )
                      }
                      className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Payload</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-black/60 text-[10px] text-amber-200/90 overflow-x-auto whitespace-pre-wrap font-mono border border-amber-500/20 select-all leading-relaxed">
                    {typeof diagnostic.sentBody === "string"
                      ? diagnostic.sentBody
                      : JSON.stringify(diagnostic.sentBody, null, 2)}
                  </pre>
                </div>
              )}

              {diagnostic?.expectedSchemaFromBlueprint && (
                <div className="pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sky-400/80 text-[10px] uppercase tracking-wider font-bold">
                      Expected Blueprint Schema:
                    </span>
                    <button
                      onClick={() =>
                        copySnippet(
                          JSON.stringify(diagnostic.expectedSchemaFromBlueprint, null, 2)
                        )
                      }
                      className="text-[10px] text-slate-400 hover:text-sky-400 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Schema</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-black/60 text-[10px] text-sky-200/90 overflow-x-auto whitespace-pre-wrap font-mono border border-sky-500/20 select-all leading-relaxed">
                    {JSON.stringify(diagnostic.expectedSchemaFromBlueprint, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-500">
          Vercel & Localhost Ready
        </span>

        <div className="flex items-center gap-2">
          {onOpenInspector && (
            <button
              onClick={onOpenInspector}
              className="px-2.5 py-1 rounded-lg neu-inset-well text-[10px] font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3 h-3" />
              <span>Inspect Raw</span>
            </button>
          )}

          {onOpenConfig && (
            <button
              onClick={onOpenConfig}
              className="px-3 py-1 rounded-lg neu-raised-btn text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Blueprint Config →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

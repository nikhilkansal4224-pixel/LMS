"use client";

import React from "react";
import { FinanceData } from "@/types/student";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, ArrowUpRight } from "lucide-react";

interface FinanceTabProps {
  finance?: FinanceData;
}

export function FinanceTab({ finance }: FinanceTabProps) {
  const outstanding = finance?.outstandingAmount ?? 0;
  const excess = finance?.excessAmount ?? 0;
  const isNoDues = finance?.isNoDues ?? true;

  return (
    <div className="space-y-6">
      {/* Top Banner Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outstanding Dues Card */}
        <div className="neu-card p-6 bg-[#1B1F28] border border-amber-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Outstanding Dues
            </span>
            <div className={`p-2 rounded-xl neu-inset-well ${outstanding > 0 ? "text-red-400" : "text-emerald-400"}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              ₹{outstanding.toLocaleString("en-IN")}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              {outstanding === 0 ? "Zero pending fee balance" : "Payment pending for current term"}
            </span>
          </div>
        </div>

        {/* Excess Balance Card */}
        <div className="neu-card p-6 bg-[#1B1F28] border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Advance / Excess Credit
            </span>
            <div className="p-2 rounded-xl neu-inset-well text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
              ₹{excess.toLocaleString("en-IN")}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">
              Adjustable against future semester fees
            </span>
          </div>
        </div>

        {/* No-Dues Clearance Status */}
        <div className="neu-card p-6 bg-[#1B1F28] border border-emerald-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              No-Dues Clearance
            </span>
            <div className="p-2 rounded-xl neu-inset-well text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isNoDues ? "CLEARED & ELIGIBLE" : "PENDING CLEARANCE"}</span>
            </div>
            <span className="text-xs font-mono text-slate-400 mt-2 block">
              {isNoDues ? "Eligible for End-Term Hall Ticket & LMS Access" : "Clear dues to download Hall Ticket"}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Schedule Table */}
      <div className="neu-card p-6 bg-[#1B1F28] border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Fee Schedule & Transaction Record</h3>
            <span className="text-xs font-mono text-slate-400">
              Live records synced from UPES Finance Integrations API
            </span>
          </div>

          <a
            href="https://myupes-beta.upes.ac.in/connectportal/user/student/integration/examination/exam-registration"
            target="_blank"
            rel="noopener noreferrer"
            className="neu-raised-btn px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-all"
          >
            <span>Open UPES Fee Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {finance?.paymentSchedule && finance.paymentSchedule.length > 0 ? (
          <div className="space-y-3">
            {finance.paymentSchedule.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl neu-inset-well border border-white/5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span className="text-xs font-mono text-slate-400">Due Date: {item.dueDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-bold text-amber-400">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`block text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full mt-1 ${
                      item.status === "Paid"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl neu-inset-well border border-white/5 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">All Dues Cleared</h4>
            <p className="text-xs font-mono text-slate-400 mt-1">
              No outstanding payment installments recorded for the current semester.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

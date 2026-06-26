import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Eye, AlertCircle, Sparkles } from "lucide-react";
import { Issue } from "../types";

interface MyReportsProps {
  issues: Issue[];
  onClose: () => void;
  onSelectIssue: (issue: Issue) => void;
}

export default function MyReports({ issues, onClose, onSelectIssue }: MyReportsProps) {
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");

  const myReports = issues.filter((i) => i.isUserReport);
  const activeMyReports = myReports.filter((i) => i.status !== "Resolved");
  const resolvedMyReports = myReports.filter((i) => i.status === "Resolved");

  const activeCount = activeMyReports.length;
  const resolvedCount = resolvedMyReports.length;

  const currentReports = activeTab === "active" ? activeMyReports : resolvedMyReports;

  // Color helper for category pills
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pothole":
        return "bg-red-50 text-red-650 border border-red-100";
      case "Streetlight":
        return "bg-blue-50 text-blue-650 border border-blue-100";
      case "Garbage":
        return "bg-green-50 text-green-700 border border-green-100";
      case "Water leakage":
        return "bg-teal-50 text-teal-700 border border-teal-100";
      case "Blocked parking":
        return "bg-orange-50 text-orange-700 border border-orange-100";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-150";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white pb-20 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-950 p-1 rounded-full hover:bg-gray-50 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-950 tracking-tight">My reports</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white select-none">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 text-center py-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "active" ? "text-gray-950" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>Active ({activeCount})</span>
          {activeTab === "active" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-950 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`flex-1 text-center py-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "resolved" ? "text-gray-950" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>Resolved ({resolvedCount})</span>
          {activeTab === "resolved" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-950 rounded-full" />
          )}
        </button>
      </div>

      {/* List content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {currentReports.length === 0 ? (
          <div className="text-center py-16 text-gray-450 text-xs">
            {activeTab === "active"
              ? "You don't have any active submitted reports right now."
              : "No resolved reports in your history yet."}
          </div>
        ) : (
          currentReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectIssue(report)}
              className="bg-white hover:bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex items-start gap-3 transition-all cursor-pointer shadow-sm hover:border-gray-250"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-150">
                <img
                  src={report.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Contents */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                  <span className="text-[9px] text-gray-400">{report.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-gray-950 truncate leading-snug">{report.title}</h4>

                {/* Status bar lines */}
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  {/* Left segment */}
                  {report.category === "Blocked parking" && report.status === "Pending" ? (
                    <div className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Auto-resolves in ~3h</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${report.status === "Resolved" ? "bg-green-600" : "bg-orange-500"}`} />
                      <span className="capitalize">{report.status}</span>
                      <span className="text-gray-300">·</span>
                      <span>{report.confirmations} confirmations</span>
                    </div>
                  )}

                  {/* Right segment: quick detail eye */}
                  <span className="text-[9px] font-bold text-gray-950 flex items-center gap-0.5 opacity-80 hover:opacity-100">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

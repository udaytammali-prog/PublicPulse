import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Circle, Clock, ThumbsUp, Share2, AlertCircle, RefreshCw, Check } from "lucide-react";
import { Issue } from "../types";

interface IssueDetailProps {
  issue: Issue;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onMove: (id: string) => void;
}

export default function IssueDetail({ issue, onClose, onConfirm, onMove }: IssueDetailProps) {
  const [copied, setCopied] = useState(false);
  const [parkingCountdown, setParkingCountdown] = useState("");

  // Countdown timer logic for Blocked Parking category
  useEffect(() => {
    if (issue.category !== "Blocked parking" || issue.status === "Resolved" || !issue.parkingTimerExpires) {
      return;
    }

    const updateTimer = () => {
      const difference = new Date(issue.parkingTimerExpires!).getTime() - Date.now();
      if (difference <= 0) {
        setParkingCountdown("Expired (Resolving...)");
        return;
      }

      const hours = Math.floor(difference / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      setParkingCountdown(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [issue]);

  // Color helper for category pills
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pothole":
        return "bg-red-50 text-red-600 border border-red-100";
      case "Streetlight":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Garbage":
        return "bg-green-50 text-green-600 border border-green-100";
      case "Water leakage":
        return "bg-teal-50 text-teal-600 border border-teal-100";
      case "Blocked parking":
        return "bg-orange-50 text-orange-600 border border-orange-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  const handleShare = () => {
    setCopied(true);
    // Simulate share or copy to clipboard
    navigator.clipboard.writeText(
      `Community Hero: Help resolve this issue: "${issue.title}" located at ${issue.location} in Jubilee Hills! #CommunityHero`
    ).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine stage progress
  // 1: Reported (Always complete)
  // 2: Verified (Complete if confirmations >= 15 or status is In progress or Resolved)
  // 3: In progress (Complete if status is In progress or Resolved)
  // 4: Resolved (Complete if status is Resolved)
  const isVerified = issue.confirmations >= 15 || issue.status === "In progress" || issue.status === "Resolved";
  const isInProgress = issue.status === "In progress" || issue.status === "Resolved";
  const isResolved = issue.status === "Resolved";

  return (
    <div className="flex-1 flex flex-col bg-white pb-20 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Feed</span>
        </button>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Issue detail
        </span>
        <div className="w-8" /> {/* Balance layout */}
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto pt-14 space-y-4">
        {/* Large Image */}
        <div className="aspect-video w-full bg-gray-100 relative border-b border-gray-100">
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-gray-900/85 px-2 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wider">
            AI SCORE: {issue.priorityScore}/100
          </div>
        </div>

        {/* Content container */}
        <div className="px-4 space-y-4">
          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getCategoryColor(issue.category)}`}>
              {issue.category}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Reported by <strong className="text-gray-900">{issue.reporterName}</strong> · {issue.timestamp}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-gray-950 tracking-tight leading-snug">
              {issue.title}
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Connected horizontal Stepper Tracker */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3.5 select-none">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Resolution Status
            </div>

            {/* Stepper display */}
            <div className="relative flex items-center justify-between w-full px-2">
              {/* Stepper Connector Lines */}
              <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-gray-200 -z-10" />
              <div
                className="absolute left-6 top-3.5 h-[2px] bg-gray-900 -z-10 transition-all duration-300"
                style={{
                  width: isResolved
                    ? "100%"
                    : isInProgress
                    ? "66%"
                    : isVerified
                    ? "33%"
                    : "0%",
                }}
              />

              {/* Step 1: Reported */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center border border-gray-900">
                  <Check className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-bold text-gray-900 mt-1.5 uppercase">
                  Reported
                </span>
              </div>

              {/* Step 2: Verified */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isVerified
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}
                >
                  {isVerified ? <Check className="w-4.5 h-4.5" /> : <Circle className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1.5 uppercase ${
                    isVerified ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Verified
                </span>
              </div>

              {/* Step 3: In progress */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isInProgress
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}
                >
                  {isInProgress ? <Check className="w-4.5 h-4.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1.5 uppercase ${
                    isInProgress ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  In Progress
                </span>
              </div>

              {/* Step 4: Resolved */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isResolved
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}
                >
                  {isResolved ? <Check className="w-4.5 h-4.5" /> : <Circle className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1.5 uppercase ${
                    isResolved ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Resolved
                </span>
              </div>
            </div>

            {/* Stepper helper label text explanation */}
            <div className="pt-2 text-[10px] text-gray-500 leading-normal text-center select-none border-t border-gray-100">
              {isResolved
                ? "This civic issue has been officially resolved. Thank you community heroes!"
                : isInProgress
                ? "The municipal authority has accepted the report and work is actively underway."
                : isVerified
                ? `Verified by community members. Escalated to Jubilee Hills Civic body.`
                : `Awaiting community confirmation. Need ${Math.max(15 - issue.confirmations, 0)} more upvotes to escalate.`}
            </div>
          </div>

          {/* Small Notification banner for parking auto-resolve */}
          {issue.category === "Blocked parking" && issue.status === "Pending" && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle className="w-4.5 h-4.5 text-orange-600 mt-0.5 shrink-0 animate-pulse" />
              <div className="text-[10px] text-orange-700 leading-normal">
                Auto-resolves in <strong className="text-orange-950 font-bold">{parkingCountdown || "4h"}</strong> if not re-confirmed · tap "still there" to keep it active.
              </div>
            </div>
          )}

          {/* Action buttons section */}
          <div className="grid grid-cols-2 gap-3.5 pt-2 select-none">
            {issue.category === "Blocked parking" && issue.status === "Pending" ? (
              <>
                {/* Blocked parking Action Buttons */}
                <button
                  onClick={() => onConfirm(issue.id)}
                  className="py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                  <span>Still There</span>
                </button>
                <button
                  onClick={() => onMove(issue.id)}
                  className="py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>It Moved</span>
                </button>
              </>
            ) : (
              <>
                {/* Normal Issues Action Buttons */}
                <button
                  disabled={isResolved}
                  onClick={() => onConfirm(issue.id)}
                  className={`py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
                    isResolved
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : issue.userConfirmed
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${issue.userConfirmed ? "fill-white text-white" : "text-white"}`} />
                  <span>{issue.userConfirmed ? "Confirmed" : `Confirm (${issue.confirmations})`}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 shadow-md transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-gray-800" />
                  <span>{copied ? "Copied Link!" : "Share Link"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

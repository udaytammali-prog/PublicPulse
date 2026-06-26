import React from "react";
import { TrendingUp, AlertTriangle, CheckSquare, Calendar, Award, BarChart3 } from "lucide-react";
import { Issue } from "../types";

interface ImpactDashboardProps {
  issues: Issue[];
  areaName?: string;
}

export default function ImpactDashboard({ issues, areaName = "Jubilee Hills" }: ImpactDashboardProps) {
  // Compute live quantities + seed baselines for high-fidelity representation
  const liveReportedCount = issues.length;
  const liveResolvedCount = issues.filter((i) => i.status === "Resolved").length;

  const totalReported = 124 + liveReportedCount;
  const totalResolved = 68 + liveResolvedCount;
  const avgResolveTime = "2.4 days";
  const activeReporters = 34 + issues.filter((i) => i.isUserReport).length;

  // Compute category volume distribution for the horizontal bar charts
  const categoryCounts: Record<string, number> = {
    Potholes: 42 + issues.filter((i) => i.category === "Pothole").length,
    Streetlights: 28 + issues.filter((i) => i.category === "Streetlight").length,
    Garbage: 31 + issues.filter((i) => i.category === "Garbage").length,
    WaterLeakage: 18 + issues.filter((i) => i.category === "Water leakage").length,
    Parking: 14 + issues.filter((i) => i.category === "Blocked parking").length,
  };

  const maxVolume = Math.max(...Object.values(categoryCounts));

  return (
    <div className="flex-1 flex flex-col bg-white p-4 pb-20 select-none animate-in fade-in duration-250">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5.5 h-5.5 text-gray-950" />
            <span>Impact Dashboard</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>This Month: {areaName}</span>
          </p>
        </div>
      </div>

      {/* Main Stats Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Reported
          </div>
          <div className="text-2xl font-bold text-gray-950 leading-tight">
            {totalReported}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 flex items-center gap-0.5 font-semibold">
            <TrendingUp className="w-3 h-3 text-red-500" />
            <span className="text-red-500">+12%</span>
            <span>vs last month</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Resolved
          </div>
          <div className="text-2xl font-bold text-green-600 leading-tight">
            {totalResolved}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 flex items-center gap-0.5 font-semibold">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-green-600">+18%</span>
            <span>efficiency bump</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Avg Resolve Time
          </div>
          <div className="text-2xl font-bold text-gray-950 leading-tight">
            {avgResolveTime}
          </div>
          <div className="text-[9px] text-green-600 font-bold uppercase tracking-wide">
            ★ Top 5% in District
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Active Reporters
          </div>
          <div className="text-2xl font-bold text-gray-950 leading-tight">
            {activeReporters}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 flex items-center gap-1 font-semibold">
            <Award className="w-3 h-3 text-gray-800" />
            <span>Community champions</span>
          </div>
        </div>
      </div>

      {/* Category volume section */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm flex-1">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-200/50 pb-2">
          Volume By Category
        </h3>

        <div className="space-y-4">
          {/* Row 1: Potholes */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">Potholes</span>
              <span className="text-gray-500 font-bold">{categoryCounts.Potholes} reported</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${(categoryCounts.Potholes / maxVolume) * 100}%` }}
              />
            </div>
          </div>

          {/* Row 2: Garbage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">Garbage & Waste</span>
              <span className="text-gray-500 font-bold">{categoryCounts.Garbage} reported</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-650 rounded-full transition-all duration-500"
                style={{ width: `${(categoryCounts.Garbage / maxVolume) * 100}%` }}
              />
            </div>
          </div>

          {/* Row 3: Streetlights */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">Streetlights</span>
              <span className="text-gray-500 font-bold">{categoryCounts.Streetlights} reported</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(categoryCounts.Streetlights / maxVolume) * 100}%` }}
              />
            </div>
          </div>

          {/* Row 4: Water leakage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">Water Leakage</span>
              <span className="text-gray-500 font-bold">{categoryCounts.WaterLeakage} reported</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${(categoryCounts.WaterLeakage / maxVolume) * 100}%` }}
              />
            </div>
          </div>

          {/* Row 5: Parking */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">Illegal Parking</span>
              <span className="text-gray-500 font-bold">{categoryCounts.Parking} reported</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(categoryCounts.Parking / maxVolume) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Informative text bubble */}
        <div className="mt-5 p-3.5 bg-green-50 border border-green-100 rounded-xl flex gap-2.5">
          <Award className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-[10px] text-green-950 leading-relaxed">
            By reporting issues and confirming reports, Jubilee Hills citizens have successfully accelerated the municipal resolution time by <strong className="text-green-850">14 hours</strong> on average! Keep being the hero!
          </p>
        </div>
      </div>
    </div>
  );
}

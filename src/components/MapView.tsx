import React, { useState } from "react";
import { Search, MapPin, ZoomIn, ZoomOut, Compass, ChevronRight, X, Sparkles, Filter } from "lucide-react";
import { Issue, Category } from "../types";

interface MapViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export default function MapView({ issues, onSelectIssue }: MapViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<"All" | Category>("All");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [userLocationActive, setUserLocationActive] = useState(false);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  // Coordinates for user location simulation
  const userGps = { x: 45, y: 50 };

  // Filter issues based on chip selection and user location proximity
  const filteredIssues = issues.filter((issue) => {
    if (userLocationActive) {
      const distance = Math.sqrt(
        Math.pow(issue.gps.x - userGps.x, 2) + Math.pow(issue.gps.y - userGps.y, 2)
      );
      if (distance > 25) return false; // Only show issues close to the user's position (radius of 25)
    }
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Garbage" && issue.category === "Garbage") return true;
    return issue.category === selectedFilter;
  });

  // Get active selected pin for the sliding bottom sheet drawer
  const activeIssue = issues.find((i) => i.id === activePinId);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));

  const handleLocateMe = () => {
    setUserLocationActive((prev) => !prev);
    if (!userLocationActive) {
      setActivePinId(null); // Clear selected pin when centering on user
    }
  };

  // Color helper for pins based on priority score & status
  const getPinStyle = (issue: Issue) => {
    if (issue.status === "Resolved") {
      return {
        bg: "bg-green-500",
        ring: "ring-green-500/30",
        size: "w-6 h-6",
        text: "text-green-500"
      };
    }
    if (issue.priorityScore >= 90) {
      return {
        bg: "bg-red-500",
        ring: "ring-red-500/40 animate-pulse",
        size: "w-8.5 h-8.5",
        text: "text-red-500"
      };
    }
    if (issue.priorityScore >= 60) {
      return {
        bg: "bg-orange-500",
        ring: "ring-orange-500/30 animate-pulse",
        size: "w-7.5 h-7.5",
        text: "text-orange-500"
      };
    }
    return {
      bg: "bg-gray-400",
      ring: "ring-gray-300/30",
      size: "w-6.5 h-6.5",
      text: "text-gray-400"
    };
  };

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

  // Chip counts
  const totalCount = issues.length;
  const potholesCount = issues.filter((i) => i.category === "Pothole").length;
  const lightsCount = issues.filter((i) => i.category === "Streetlight").length;
  const trashCount = issues.filter((i) => i.category === "Garbage").length;
  const parkingCount = issues.filter((i) => i.category === "Blocked parking").length;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white/90 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-gray-950 tracking-tight flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-950" />
          <span>Issue map</span>
        </h2>
        <button className="text-gray-500 hover:text-gray-950 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
          <Filter className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Horizontal Scrollable Filter Chips */}
      <div className="px-4 py-2 bg-white border-b border-gray-100/80 overflow-x-auto flex gap-2 scrollbar-none z-10">
        <button
          onClick={() => setSelectedFilter("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedFilter === "All"
              ? "bg-gray-950 text-white font-bold animate-in fade-in duration-100"
              : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setSelectedFilter("Pothole")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedFilter === "Pothole"
              ? "bg-gray-950 text-white font-bold animate-in fade-in duration-100"
              : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
          }`}
        >
          Potholes ({potholesCount})
        </button>
        <button
          onClick={() => setSelectedFilter("Streetlight")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedFilter === "Streetlight"
              ? "bg-gray-950 text-white font-bold animate-in fade-in duration-100"
              : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
          }`}
        >
          Streetlights ({lightsCount})
        </button>
        <button
          onClick={() => setSelectedFilter("Garbage")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedFilter === "Garbage"
              ? "bg-gray-950 text-white font-bold animate-in fade-in duration-100"
              : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
          }`}
        >
          Garbage ({trashCount})
        </button>
        <button
          onClick={() => setSelectedFilter("Blocked parking")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedFilter === "Blocked parking"
              ? "bg-gray-950 text-white font-bold animate-in fade-in duration-100"
              : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
          }`}
        >
          Parking ({parkingCount})
        </button>
      </div>

      {/* Map Vector Canvas Stage Area */}
      <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center">
        {userLocationActive && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-blue-600 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass className="w-3.5 h-3.5 text-white animate-spin-slow shrink-0" />
              <span className="truncate">Showing problems near you ({filteredIssues.length})</span>
            </div>
            <button
              onClick={() => setUserLocationActive(false)}
              className="bg-blue-700 hover:bg-blue-850 text-white font-bold text-[8px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
            >
              Show All
            </button>
          </div>
        )}

        {/* SVG Schematic Roadmap of Jubilee Hills */}
        <div
          className="absolute inset-0 transition-transform duration-300 origin-center flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            className="w-[500px] h-[500px] opacity-40 text-gray-200 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            {/* Outline grids */}
            <circle cx="50" cy="50" r="45" strokeDasharray="2,2" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="25" strokeDasharray="1,2" strokeWidth="0.4" />

            {/* Roads */}
            {/* Road No 36 */}
            <path d="M5,20 L95,80" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M5,20 L95,80" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Road No 10 */}
            <path d="M10,80 Q30,40 90,20" strokeWidth="2" strokeLinecap="round" />

            {/* Lane 5 */}
            <path d="M30,10 L35,90" strokeWidth="1.5" />

            {/* Peddamma Temple Road */}
            <path d="M70,5 Q75,45 95,55" strokeWidth="1.8" />

            {/* KBR Park Area Outline */}
            <rect x="40" y="55" width="25" height="25" rx="5" fill="green-500" fillOpacity="0.05" stroke="green-200" strokeWidth="0.5" />
            <text x="52" y="68" fill="green-600/50" fontSize="3" fontWeight="bold">KBR PARK</text>

            {/* Metro line path */}
            <path d="M5,18 L95,78" stroke="blue" strokeWidth="0.3" strokeDasharray="4,1" />
          </svg>

          {/* Interactive Map Issue Pins */}
          {filteredIssues.map((issue) => {
            const pin = getPinStyle(issue);
            const isActive = issue.id === activePinId;

            return (
              <button
                key={issue.id}
                onClick={() => {
                  setActivePinId(issue.id);
                  setUserLocationActive(false); // deselect locate me on pin touch
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 cursor-pointer ${
                  isActive ? "scale-125 z-30" : "hover:scale-110 z-20"
                }`}
                style={{ left: `${issue.gps.x}%`, top: `${issue.gps.y}%` }}
              >
                {/* Ping Ring */}
                <span className={`absolute inline-flex h-full w-full rounded-full bg-inherit opacity-75 ring-4 ${pin.ring}`} />

                {/* Main Pin Dot */}
                <div className={`rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-colors ${pin.size} ${pin.bg}`}>
                  <MapPin className="w-3.5 h-3.5 text-white fill-white" />
                </div>

                {/* Floating category text bubble on active */}
                {isActive && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-gray-900 border border-gray-850 rounded px-1.5 py-0.5 whitespace-nowrap text-[9px] font-bold text-white shadow-md">
                    {issue.category} · {issue.priorityScore}
                  </div>
                )}
              </button>
            );
          })}

          {/* Simulated User Location Blue Pin */}
          {userLocationActive && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30 pointer-events-none"
              style={{ left: `${userGps.x}%`, top: `${userGps.y}%` }}
            >
              <span className="absolute inline-flex h-10 w-10 rounded-full bg-blue-500/20 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-3 border-white flex items-center justify-center shadow-lg relative">
                <Compass className="w-3 h-3 text-white animate-spin-slow" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Zoom and Compass buttons (Bottom Right) */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-600 flex items-center justify-center shadow-md hover:bg-gray-50 hover:text-gray-950 cursor-pointer"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-600 flex items-center justify-center shadow-md hover:bg-gray-50 hover:text-gray-950 cursor-pointer"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Locate Me button (Bottom Left) */}
        <div className="absolute left-4 bottom-4 z-20">
          <button
            onClick={handleLocateMe}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-md transition-all cursor-pointer ${
              userLocationActive
                ? "bg-blue-600 border-blue-600 text-white font-bold"
                : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Compass className={`w-5 h-5 ${userLocationActive ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Visual Map Legend (Top Left) */}
        <div className="absolute left-4 top-4 bg-white/95 border border-gray-100 rounded-xl p-2.5 space-y-1 z-20 text-[10px] select-none text-gray-500 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>High priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Medium priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* ------------------- SLIDING DRAWER SHEET (Pin Click Preview) ------------------- */}
      {activeIssue && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 rounded-t-2xl shadow-2xl z-30 p-4 pb-6 transform animate-in slide-in-from-bottom duration-200 select-none">
          {/* Drag Handle representation */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

          {/* Close button */}
          <button
            onClick={() => setActivePinId(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-950 hover:bg-gray-50 p-1 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Issue summary container */}
          <div className="flex gap-3 items-start">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              <img
                src={activeIssue.photoUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-1.5 items-center mb-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${getCategoryColor(activeIssue.category)}`}>
                  {activeIssue.category}
                </span>
                <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Score: {activeIssue.priorityScore}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-950 truncate">{activeIssue.title}</h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                <span>120m away</span>
                <span>·</span>
                <span>{activeIssue.confirmations} confirmed</span>
                <span>·</span>
                <span className="text-green-600 font-semibold">{activeIssue.status}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActivePinId(null);
              onSelectIssue(activeIssue);
            }}
            className="w-full mt-4 py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer shadow-md"
          >
            <span>View issue details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

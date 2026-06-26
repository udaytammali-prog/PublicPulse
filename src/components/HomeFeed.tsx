import React, { useState, useRef, useEffect } from "react";
import { MapPin, Sparkles, ThumbsUp, Loader2, Navigation, Search, Check, X } from "lucide-react";
import { Issue } from "../types";

interface HomeFeedProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onNavigateToProfile: () => void;
  onNavigateToReport: (prefill?: any) => void;
  onConfirmIssue: (id: string) => void;
  userName: string;
  userAvatar?: string;
  areaName: string;
  onUpdateAreaName: (newArea: string) => void;
}

export default function HomeFeed({
  issues,
  onSelectIssue,
  onNavigateToProfile,
  onNavigateToReport,
  onConfirmIssue,
  userName,
  userAvatar,
  areaName,
  onUpdateAreaName,
}: HomeFeedProps) {
  // Dynamic Location States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleDetectLocation = () => {
    setLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Query free OpenStreetMap Nominatim reverse geocoder
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          if (!res.ok) throw new Error("Failed to contact reverse geocoding service.");
          const data = await res.json();
          
          // Try to extract a human-friendly suburb, neighborhood, district, city or village
          const addr = data.address || {};
          const detectedArea = 
            addr.suburb || 
            addr.neighbourhood || 
            addr.quarter || 
            addr.residential || 
            addr.district || 
            addr.city_district || 
            addr.city || 
            addr.town || 
            addr.village || 
            "My Location";

          onUpdateAreaName(detectedArea);
          setLocating(false);
          setShowLocationModal(false);
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          const approxName = `Lat: ${position.coords.latitude.toFixed(3)}, Lon: ${position.coords.longitude.toFixed(3)}`;
          onUpdateAreaName(approxName);
          setLocating(false);
          setShowLocationModal(false);
        }
      },
      (error) => {
        console.warn("Geolocation permission or GPS failed", error);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please enter it manually below!";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location signal unavailable. Please enter it manually below!";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please enter it manually below!";
        }
        setLocationError(errorMsg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLocationInput.trim()) {
      onUpdateAreaName(manualLocationInput.trim());
      setShowLocationModal(false);
      setManualLocationInput("");
      setLocationError(null);
    }
  };

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

  // Color helper for priority score badges
  const getPriorityBadgeColor = (score: number) => {
    if (score >= 90) return "bg-red-50 text-red-600 border border-red-100";
    if (score >= 60) return "bg-orange-50 text-orange-600 border border-orange-100";
    return "bg-gray-50 text-gray-500 border border-gray-100";
  };

  // Color helper for status text
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "text-green-600 font-medium";
      case "In progress":
        return "text-orange-600 font-medium";
      default:
        return "text-gray-400";
    }
  };

  // Dynamic values calculated from current loaded issues
  const activeCount = issues.filter((i) => i.status !== "Resolved").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved").length;

  return (
    <div className="flex-1 flex flex-col p-4 pb-20 relative select-none bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div 
          onClick={() => setShowLocationModal(true)}
          className="cursor-pointer group flex flex-col hover:opacity-80 transition-opacity"
          title="Click to update location"
        >
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 transition-colors group-hover:text-gray-700">
              {areaName}
            </h1>
            <MapPin className="w-4 h-4 text-gray-400 group-hover:text-gray-950 transition-colors shrink-0" />
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-500 font-medium">
            <span className="underline decoration-dotted decoration-gray-400 hover:text-gray-850">Tap to set current location</span>
          </div>
        </div>
        <button
          onClick={onNavigateToProfile}
          className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-900 overflow-hidden font-semibold text-sm transition-all shadow-sm cursor-pointer"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            userName
              .split(" ")
              .map((word) => word[0])
              .join("")
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium mb-1">Active issues</div>
          <div className="text-2xl font-bold text-gray-950">{activeCount}</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium mb-1">Resolved this month</div>
          <div className="text-2xl font-bold text-green-600">{resolvedCount + 62}</div>
        </div>
      </div>

      {/* Sort Indicator */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-950 bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 mb-4 select-none">
        <Sparkles className="w-3.5 h-3.5 text-gray-950 animate-pulse" />
        <span>Sorted by AI Priority Score</span>
      </div>

      {/* Issue Feed List */}
      <div className="flex-1 space-y-3.5">
        {issues.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No issues reported in this area yet. Be the first hero!
          </div>
        ) : (
          issues
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-3 transition-all cursor-pointer shadow-sm hover:border-gray-200"
              >
                {/* Thumbnail Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Right Area content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getCategoryColor(issue.category)}`}>
                      {issue.category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wider ${getPriorityBadgeColor(issue.priorityScore)}`}>
                      PRIORITY {issue.priorityScore}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-950 truncate mb-1">{issue.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-gray-900 fill-gray-900/10" />
                      <span>{issue.confirmations} confirmed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className={getStatusColor(issue.status)}>{issue.status}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span>{issue.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* ------------------- LOCATION SELECTION OVERLAY MODAL ------------------- */}
      {showLocationModal && (
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-[340px] p-5 shadow-2xl relative select-none animate-in zoom-in-95 duration-150 text-xs">
            <button
              onClick={() => {
                setShowLocationModal(false);
                setLocationError(null);
              }}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-950 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-gray-950" />
              <h3 className="text-sm font-bold text-gray-950">
                Set Current Location
              </h3>
            </div>

            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Updating your location changes the community feed, services, and impact insights for your active area.
            </p>

            <div className="space-y-4">
              {/* GPS Auto-detect Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="w-full py-3 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors active:scale-[0.98]"
              >
                {locating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Detecting current location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-white" />
                    <span>Detect GPS Location</span>
                  </>
                )}
              </button>

              {locationError && (
                <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] rounded-lg leading-relaxed font-medium">
                  {locationError}
                </div>
              )}

              {/* Divider line */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-150"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or enter manually</span>
                <div className="flex-grow border-t border-gray-150"></div>
              </div>

              {/* Manual input form */}
              <form onSubmit={handleSaveManualLocation} className="space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualLocationInput}
                    onChange={(e) => setManualLocationInput(e.target.value)}
                    placeholder="Enter suburb, area or city name..."
                    className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 pl-9 pr-3 text-xs border border-gray-200 focus:outline-none focus:border-gray-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualLocationInput.trim()}
                  className="w-full py-2.5 bg-gray-50 text-gray-950 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 text-gray-950" />
                  <span>Update Location</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

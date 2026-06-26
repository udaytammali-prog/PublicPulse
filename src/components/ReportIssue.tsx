import React, { useState, useEffect } from "react";
import { X, Camera, Sparkles, MapPin, Loader2, Image as ImageIcon } from "lucide-react";
import { Category, BlockedDetail } from "../types";

interface ReportIssueProps {
  onClose: () => void;
  onSubmit: (report: {
    title: string;
    description: string;
    category: Category;
    location: string;
    photoUrl: string;
    blockedDetails?: BlockedDetail;
  }) => void;
  prefill?: {
    category?: string;
    title?: string;
    description?: string;
    location?: string;
  };
  userHomeAddress: string;
}

// Preset scenario images for high-fidelity interactive simulation
const PRESET_SCENARIOS = [
  {
    name: "Road Pothole",
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80",
    description: "Deep pothole opening up on the road.",
  },
  {
    name: "Dark Lane",
    image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400&q=80",
    description: "Entire line of streetlights broken.",
  },
  {
    name: "Garbage Pile",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80",
    description: "Overflowing commercial garbage bins.",
  },
  {
    name: "Driveway Blocked",
    image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80",
    description: "Vehicle parked illegally directly blocking resident gate.",
  },
];

export default function ReportIssue({ onClose, onSubmit, prefill, userHomeAddress }: ReportIssueProps) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Other");
  const [title, setTitle] = useState("");
  const [blockedDetails, setBlockedDetails] = useState<BlockedDetail | undefined>(undefined);
  const [location, setLocation] = useState("Road No 12, Jubilee Hills · auto-detected");

  // AI categorization suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<Category | null>(null);
  const [aiSuggestedTitle, setAiSuggestedTitle] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load prefill values if provided (from AI Chat)
  useEffect(() => {
    if (prefill) {
      if (prefill.category) {
        setCategory(prefill.category as Category);
      }
      if (prefill.description) {
        setDescription(prefill.description);
      }
      if (prefill.location) {
        setLocation(`${prefill.location} · auto-detected`);
      }
      if (prefill.title) {
        setTitle(prefill.title);
      }
    }
  }, [prefill]);

  // Adjust location default if blocked parking & "My driveway" is chosen
  useEffect(() => {
    if (category === "Blocked parking" && blockedDetails === "My driveway") {
      setLocation(`${userHomeAddress} · registered home address`);
    } else {
      setLocation("Road No 12, Jubilee Hills · auto-detected");
    }
  }, [category, blockedDetails, userHomeAddress]);

  // Trigger AI analysis when photo is added or description is updated
  const triggerAiAnalysis = async (url: string, desc: string) => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          photoData: url, // Simulated or base64
        }),
      });
      const data = await response.json();
      if (data.category) {
        setAiSuggestion(data.category as Category);
      }
      if (data.title) {
        setAiSuggestedTitle(data.title);
      }
    } catch (e) {
      console.error("AI analysis failed", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectPreset = (image: string, desc: string) => {
    setPhotoUrl(image);
    setDescription(desc);
    triggerAiAnalysis(image, desc);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        triggerAiAnalysis(base64, description);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion);
      if (aiSuggestedTitle) {
        setTitle(aiSuggestedTitle);
      }
      setAiSuggestion(null); // Clear suggestion after tap
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    // Use current title or generate a fallback
    const finalTitle = title.trim() || `${category} reported at ${location.split(" ·")[0]}`;

    onSubmit({
      title: finalTitle,
      description,
      category,
      location,
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1599740831419-b5ce14bd5f94?auto=format&fit=crop&w=400&q=80",
      blockedDetails: category === "Blocked parking" ? blockedDetails : undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white p-4 pb-20 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-950">New report</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        {/* Photo capture and simulation presets */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Report Photo
          </label>
          <div className="relative group">
            {photoUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl("");
                    setAiSuggestion(null);
                  }}
                  className="absolute top-2.5 right-2.5 bg-gray-950/80 hover:bg-gray-950 text-white rounded-full p-1.5 shadow-md border border-gray-800 transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 text-gray-500 cursor-pointer transition-all aspect-video">
                <Camera className="w-10 h-10 mb-2.5 text-gray-400 group-hover:text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">Take or upload a photo</span>
                <span className="text-[10px] text-gray-400 mt-1">Tap to select files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Preset options under the photo capture for sandbox use */}
          {!photoUrl && (
            <div className="mt-3">
              <span className="text-[10px] text-gray-400 font-medium block mb-1.5">
                Or tap a Preset Scenario to simulate AI:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.image, preset.description)}
                    className="flex flex-col items-center bg-gray-50 border border-gray-100 hover:border-gray-200 p-1.5 rounded-lg text-[9px] transition-all cursor-pointer"
                  >
                    <div className="w-full h-8 rounded overflow-hidden mb-1">
                      <img src={preset.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-gray-700 font-medium leading-none truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestion Banner */}
        {isAiLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl p-3 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>AI analyzing report details...</span>
          </div>
        )}

        {!isAiLoading && aiSuggestion && (
          <div
            onClick={handleApplyAiSuggestion}
            className="flex items-center justify-between gap-2.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl p-3 cursor-pointer transition-all animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-500 shrink-0 fill-blue-500/10" />
              <span>
                AI suggests: <strong className="text-blue-800">{aiSuggestion}</strong> · tap to confirm
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 shrink-0 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded">
              Apply
            </span>
          </div>
        )}

        {/* Category dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Issue Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-gray-950 cursor-pointer"
          >
            <option value="Pothole">Pothole</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Garbage">Garbage / Waste</option>
            <option value="Water leakage">Water Leakage</option>
            <option value="Blocked parking">Blocked / Illegal Parking</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Conditional Field - Blocked Parking */}
        {category === "Blocked parking" && (
          <div className="space-y-2 select-none animate-in fade-in slide-in-from-top-3 duration-150">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              What's blocked?
            </label>
            <div className="flex flex-wrap gap-2">
              {(["My driveway", "Fire lane", "Footpath", "No-parking zone"] as BlockedDetail[]).map((detail) => (
                <button
                  key={detail}
                  type="button"
                  onClick={() => setBlockedDetails(detail)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    blockedDetails === detail
                      ? "bg-gray-950 border-gray-950 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {detail}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={category === "Blocked parking" ? 2 : 4}
            placeholder={
              category === "Blocked parking"
                ? "e.g. White sedan, blocking gate for 2 hours"
                : "Describe the civic issue. Providing landmark details helps resolve faster!"
            }
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-gray-950"
          />
        </div>

        {/* Location display */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-start gap-2.5 select-none">
          <MapPin className="w-5 h-5 text-gray-900 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Location details
            </div>
            <div className="text-xs text-gray-950 mt-0.5 leading-relaxed">{location}</div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!description}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center cursor-pointer ${
              description
                ? "bg-gray-950 text-white hover:bg-gray-800 active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit report
          </button>
        </div>
      </form>
    </div>
  );
}

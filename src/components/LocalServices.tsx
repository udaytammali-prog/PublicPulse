import React, { useState, useEffect } from "react";
import { Phone, Star, Search, Plus, X, User, ChevronRight, Check, AlertCircle, Bot } from "lucide-react";
import { ServiceProvider, Review, NotificationNudge } from "../types";

interface LocalServicesProps {
  providers: ServiceProvider[];
  onAddProvider: (provider: { name: string; role: string; phone: string }) => void;
  onSubmitReview: (providerId: string, review: { rating: number; comment: string; chips: string[] }) => void;
  areaName: string;
}

const CATEGORIES = ["All", "Cook", "Maid", "Electrician", "Plumber", "Laundry"];

const RATING_CHIPS = ["On time", "Good work", "Fair price", "Polite"];

export default function LocalServices({ providers, onAddProvider, onSubmitReview, areaName }: LocalServicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Listing Form state
  const [listFormOpen, setListFormOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceRole, setNewServiceRole] = useState("Cook");
  const [newServicePhone, setNewServicePhone] = useState("");

  // Review Flow State
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<ServiceProvider | null>(null);
  const [activeNudge, setActiveNudge] = useState<NotificationNudge | null>(null);
  const [reviewCardOpen, setReviewCardOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedReviewChips, setSelectedReviewChips] = useState<string[]>([]);

  // Calling Simulation
  const [activeCall, setActiveCall] = useState<ServiceProvider | null>(null);

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.role.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Handle phone call simulation
  const handlePlaceCall = (provider: ServiceProvider) => {
    setActiveCall(provider);

    // After 3 seconds, automatically end call and trigger notification feedback nudge
    setTimeout(() => {
      setActiveCall(null);

      // Trigger feedback nudge mimicking "the next day" (appears 1 second later)
      setTimeout(() => {
        setActiveNudge({
          id: "nudge-" + Date.now(),
          providerId: provider.id,
          providerName: provider.name,
          providerRole: provider.role,
          avatar: provider.avatar,
          timestamp: "Called yesterday",
        });
      }, 1000);
    }, 3000);
  };

  const handleOpenReviewFromNudge = (stars: number) => {
    setReviewRating(stars);
    setReviewCardOpen(true);
  };

  const handleToggleReviewChip = (chip: string) => {
    setSelectedReviewChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNudge) return;

    onSubmitReview(activeNudge.providerId, {
      rating: reviewRating,
      comment: reviewComment,
      chips: selectedReviewChips,
    });

    // Close review dialog, clear state, clear nudge
    setReviewCardOpen(false);
    setActiveNudge(null);
    setReviewComment("");
    setSelectedReviewChips([]);
    setReviewRating(5);
  };

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePhone) return;

    onAddProvider({
      name: newServiceName,
      role: newServiceRole,
      phone: newServicePhone,
    });

    setNewServiceName("");
    setNewServicePhone("");
    setListFormOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-white p-4 pb-20 select-none overflow-y-auto scrollbar-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
          <Phone className="w-5.5 h-5.5 text-gray-950" />
          <span>Local services</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">
          Trusted by your neighbours in <strong className="text-gray-950">{areaName}</strong>
        </p>
      </div>

      {/* Notification Nudge - Low Friction Banner */}
      {activeNudge && (
        <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3 flex gap-3 relative animate-in slide-in-from-top duration-200 shadow-lg">
          <div className="w-9 h-9 rounded-full bg-green-100 text-green-750 border border-green-200 flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {activeNudge.avatar}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-xs font-bold text-gray-950 leading-tight">
              Rate your experience with {activeNudge.providerName}?
            </h4>
            <p className="text-[10px] text-gray-500 mt-0.5">
              You called them yesterday as a {activeNudge.providerRole} · tap to rate
            </p>

            {/* 5 Tappable Star Selector Row */}
            <div className="flex gap-1.5 mt-2 select-none">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => handleOpenReviewFromNudge(stars)}
                  className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star className="w-5 h-5 fill-none" />
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveNudge(null)}
            className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-950 p-0.5 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cook, maid, electrician, plumber..."
          className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 pl-10 pr-4 text-xs border border-gray-200 focus:outline-none focus:border-gray-950 shadow-sm"
        />
      </div>

      {/* Quick select Category Scrollable Row */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none shrink-0 select-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-gray-950 text-white font-bold shadow-md animate-in fade-in duration-100"
                : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Providers list */}
      <div className="flex-1 space-y-3.5 select-none">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No listings found. Be the first to add one!
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => setSelectedProviderForDetail(provider)}
              className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-gray-250 hover:bg-gray-50/50 transition-all cursor-pointer"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-950 border border-gray-150 flex items-center justify-center font-bold text-xs select-none">
                  {provider.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-950 truncate leading-snug">
                    {provider.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {provider.role} · <strong className="text-gray-950 font-bold">{provider.neighboursUsed}</strong> neighbours used
                  </p>
                  {/* Star Rating summary line */}
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-550">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    <span className="text-gray-950 font-bold">{provider.rating}</span>
                    <span>({provider.reviewsCount} reviews)</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-gray-500">{provider.availability}</span>
                  </div>
                </div>
              </div>

              {/* Green Call button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Don't trigger list item details sheet
                  handlePlaceCall(provider);
                }}
                className="w-9 h-9 rounded-full bg-gray-950 hover:bg-gray-800 text-white flex items-center justify-center shadow-md shrink-0 active:scale-90 transition-transform cursor-pointer"
              >
                <Phone className="w-4.5 h-4.5" />
              </button>
            </div>
          ))
        )}

        {/* "List your service" dashed outline button */}
        <button
          onClick={() => setListFormOpen(true)}
          className="w-full border-2 border-dashed border-gray-200 hover:border-gray-400 p-4 rounded-xl flex items-center justify-center gap-2 text-gray-500 text-xs font-semibold hover:text-gray-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gray-900" />
          <span>List your service</span>
        </button>
      </div>

      {/* ------------------- DIALING OVERLAY MODAL ------------------- */}
      {activeCall && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-between p-12 z-50 select-none animate-in fade-in duration-200">
          <div className="w-16 h-1 bg-gray-200 rounded-full mb-8" />

          {/* Callee info */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-gray-950 text-gray-950 flex items-center justify-center font-black text-3xl animate-pulse select-none">
              {activeCall.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-950 tracking-tight">{activeCall.name}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                Calling {activeCall.role}...
              </p>
            </div>
          </div>

          {/* Calling Action animation */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Dialing: {activeCall.phone}
            </p>
            <button
              onClick={() => setActiveCall(null)}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------- REVIEW INPUT CARD POPUP ------------------- */}
      {reviewCardOpen && activeNudge && (
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs z-40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-[340px] p-5 shadow-2xl relative select-none animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setReviewCardOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-950 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-gray-950 mb-3">
              Write review for {activeNudge.providerName}
            </h3>

            {/* Stars row */}
            <div className="flex justify-center gap-2 mb-4 select-none">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setReviewRating(stars)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      stars <= reviewRating
                        ? "fill-amber-500 text-amber-500"
                        : "text-gray-200 fill-none"
                    }`}
                  />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating chips multi select */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Praise tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RATING_CHIPS.map((chip) => {
                    const isSelected = selectedReviewChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleReviewChip(chip)}
                        className={`text-[10px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gray-950 border-gray-950 text-white font-bold animate-in fade-in duration-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text-area */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of their work to help others..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 text-xs rounded-xl p-2.5 focus:outline-none focus:border-gray-950"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                <span>Submit review</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- PROVIDER DETAIL PROFILE BOTTOM DRAWER ------------------- */}
      {selectedProviderForDetail && (
        <div className="absolute inset-0 bg-gray-950/30 backdrop-blur-xs z-40 flex flex-col justify-end">
          {/* Backdrop Touch Close */}
          <div className="flex-1" onClick={() => setSelectedProviderForDetail(null)} />

          {/* Drawer Body */}
          <div className="bg-white border-t border-gray-100 rounded-t-3xl max-h-[85%] overflow-y-auto p-4 pb-8 space-y-4 shadow-2xl relative select-none animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" />

            <button
              onClick={() => setSelectedProviderForDetail(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 p-1 rounded-full hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Provider Meta Summary */}
            <div className="flex gap-3.5 items-start border-b border-gray-100 pb-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-950 border border-gray-200 flex items-center justify-center font-black text-xl shrink-0 select-none">
                {selectedProviderForDetail.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-950 tracking-tight leading-snug">
                  {selectedProviderForDetail.name}
                </h3>
                <p className="text-xs text-gray-500 font-semibold">{selectedProviderForDetail.role}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="text-gray-950 font-bold">{selectedProviderForDetail.rating}</span>
                  <span>({selectedProviderForDetail.reviewsCount} reviews)</span>
                  <span>·</span>
                  <span>{selectedProviderForDetail.neighboursUsed} used</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <button
              onClick={() => {
                const temp = selectedProviderForDetail;
                setSelectedProviderForDetail(null);
                handlePlaceCall(temp);
              }}
              className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <Phone className="w-4.5 h-4.5" />
              <span>Call {selectedProviderForDetail.name} Directly</span>
            </button>

            {/* Reviews list log */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1.5">
                Past Customer Reviews ({selectedProviderForDetail.reviewsCount})
              </h4>

              <div className="space-y-3">
                {selectedProviderForDetail.reviews.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    No customer reviews logged yet.
                  </div>
                ) : (
                  selectedProviderForDetail.reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-950">{rev.reviewerName}</span>
                          <span className="text-[9px] text-gray-400 ml-2">{rev.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {rev.comment}
                      </p>

                      {/* Review chips */}
                      {rev.chips && rev.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 select-none">
                          {rev.chips.map((c) => (
                            <span
                              key={c}
                              className="text-[9px] font-semibold bg-green-50 text-green-705 px-1.5 py-0.5 rounded border border-green-100"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- LIST MY SERVICE DRAWER SHEET FORM ------------------- */}
      {listFormOpen && (
        <div className="absolute inset-0 bg-gray-950/30 backdrop-blur-xs z-40 flex flex-col justify-end">
          <div className="flex-1 animate-fade-in" onClick={() => setListFormOpen(false)} />
          <div className="bg-white border-t border-gray-150 rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl relative select-none animate-in slide-in-from-bottom duration-200">
            <button
              onClick={() => setListFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 p-1 rounded-full hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-2">
              List your service
            </h3>

            <form onSubmit={handleSubmitListing} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-gray-950"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Role Type
                </label>
                <select
                  value={newServiceRole}
                  onChange={(e) => setNewServiceRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-gray-950 cursor-pointer"
                >
                  <option value="Cook">Cook</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Maid">Maid</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newServicePhone}
                  onChange={(e) => setNewServicePhone(e.target.value)}
                  placeholder="e.g. +91 98765 XXXXX"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-gray-950"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { User, MapPin, Phone, Mail, Award, Trophy, ChevronRight, LogOut, ClipboardList, Star, ShieldAlert, BadgePlus, Settings, X, Check, Camera, Upload } from "lucide-react";
import { Issue } from "../types";

interface ProfileProps {
  userName: string;
  userPhone: string;
  userEmail: string;
  userHomeAddress: string;
  userAvatar?: string;
  issues: Issue[];
  onNavigateToMyReports: () => void;
  onNavigateToListService: () => void;
  onLogOut: () => void;
  onUpdateProfile: (updated: { name: string; phone: string; email: string; address: string; avatarUrl?: string }) => void;
}

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

export default function Profile({
  userName,
  userPhone,
  userEmail,
  userHomeAddress,
  userAvatar,
  issues,
  onNavigateToMyReports,
  onNavigateToListService,
  onLogOut,
  onUpdateProfile,
}: ProfileProps) {
  // Local form editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editAddress, setEditAddress] = useState(userHomeAddress);
  const [editAvatar, setEditAvatar] = useState(userAvatar || DEFAULT_AVATAR);

  // Sync with incoming prop changes
  useEffect(() => {
    setEditName(userName);
    setEditPhone(userPhone);
    setEditEmail(userEmail);
    setEditAddress(userHomeAddress);
    setEditAvatar(userAvatar || DEFAULT_AVATAR);
  }, [userName, userPhone, userEmail, userHomeAddress, userAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim() || !editEmail.trim() || !editAddress.trim()) return;
    onUpdateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
      avatarUrl: editAvatar,
    });
    setIsEditing(false);
  };

  // Compute user statistics dynamically from state
  const myReports = issues.filter((i) => i.isUserReport);
  const myReportedCount = myReports.length;
  const myResolvedCount = myReports.filter((i) => i.status === "Resolved").length;

  // Static gamification statistics, blended with active reports
  const totalConfirmationsGiven = 41;
  const points = 650 + myReportedCount * 50 + myResolvedCount * 100;

  // Level computation: e.g. level 3 baseline is 500, next is 1000.
  const level = points >= 1000 ? 4 : 3;
  const pointsForNextLevel = level === 4 ? 1500 : 1000;
  const pointsProgress = points - 500; // relative progress in level 3
  const progressPercent = Math.min((pointsProgress / 500) * 100, 100);

  return (
    <div className="flex-1 flex flex-col bg-white p-4 pb-20 relative select-none overflow-y-auto scrollbar-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
          <User className="w-5.5 h-5.5 text-gray-950" />
          <span>Profile</span>
        </h2>
      </div>

      {/* Identity Card */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4 border-b border-gray-200/50 pb-4">
          <div 
            onClick={() => setIsEditing(true)}
            className="relative cursor-pointer group shrink-0"
            title="Click to edit profile & picture"
          >
            {userAvatar ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center transition-all group-hover:border-gray-950">
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-950 text-white border-2 border-gray-950 flex items-center justify-center font-bold text-2xl select-none transition-all group-hover:bg-gray-800">
                {userName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-gray-950 text-white rounded-full flex items-center justify-center shadow-md border border-white group-hover:bg-gray-800 transition-colors">
              <Settings className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-950 tracking-tight truncate leading-snug">
              {userName}
            </h3>
            <div className="flex items-start gap-1 text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span className="truncate">{userHomeAddress.split(",")[0]}</span>
            </div>
          </div>
        </div>

        {/* Contact details list */}
        <div className="pt-3.5 space-y-2 text-xs text-gray-600 select-all">
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{userPhone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
        </div>
      </div>

      {/* Gamification Banner */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm mb-4 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-inner">
              <Trophy className="w-5.5 h-5.5 fill-amber-500/10" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-950">
                Community Champion · Level {level}
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Keep upvoting and reporting to reach Level {level + 1}!
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-gray-950 tracking-tight">
              {points} pts
            </span>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mt-4 space-y-1">
          <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-950 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
            <span>Level {level}</span>
            <span>{pointsForNextLevel - points} pts to Level {level + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats Row (3 Columns) */}
      <div className="grid grid-cols-3 gap-2.5 text-center mb-5 select-none">
        <div className="bg-gray-50 border border-gray-100/50 rounded-xl py-3 px-1.5 shadow-sm">
          <div className="text-lg font-bold text-gray-950">{myReportedCount}</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wider">
            Reported
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100/50 rounded-xl py-3 px-1.5 shadow-sm">
          <div className="text-lg font-bold text-green-600">{myResolvedCount}</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wider">
            Resolved
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100/50 rounded-xl py-3 px-1.5 shadow-sm">
          <div className="text-lg font-bold text-gray-950">{totalConfirmationsGiven}</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wider">
            Upvotes
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm select-none">
        {/* Item 1: My reports */}
        <button
          onClick={onNavigateToMyReports}
          className="w-full flex items-center justify-between p-3.5 text-gray-600 hover:text-gray-950 hover:bg-gray-50/50 transition-all cursor-pointer text-xs"
        >
          <div className="flex items-center gap-3 font-semibold">
            <ClipboardList className="w-4.5 h-4.5 text-gray-400" />
            <span>My reports</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
        </button>

        {/* Item 2: My reviews */}
        <button
          onClick={onNavigateToMyReports} // Redirects to reports/history page in state
          className="w-full flex items-center justify-between p-3.5 text-gray-600 hover:text-gray-950 hover:bg-gray-50/50 transition-all cursor-pointer text-xs"
        >
          <div className="flex items-center gap-3 font-semibold">
            <Star className="w-4.5 h-4.5 text-gray-400" />
            <span>My reviews of services</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
        </button>

        {/* Item 3: Edit Profile (Replaced Badges & Leaderboard) */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-between p-3.5 text-gray-600 hover:text-gray-950 hover:bg-gray-50/50 transition-all cursor-pointer text-xs"
        >
          <div className="flex items-center gap-3 font-semibold">
            <Settings className="w-4.5 h-4.5 text-gray-400" />
            <span>Edit profile details</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
        </button>

        {/* Item 4: List my service */}
        <button
          onClick={onNavigateToListService}
          className="w-full flex items-center justify-between p-3.5 text-gray-600 hover:text-gray-950 hover:bg-gray-50/50 transition-all cursor-pointer text-xs"
        >
          <div className="flex items-center gap-3 font-semibold">
            <BadgePlus className="w-4.5 h-4.5 text-gray-400" />
            <span>List my service</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
        </button>

        {/* Item 5: Log out (Red/Danger colored, no chevron) */}
        <button
          onClick={onLogOut}
          className="w-full flex items-center p-3.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer text-xs font-bold border-t border-gray-100"
        >
          <LogOut className="w-4.5 h-4.5 mr-3 shrink-0" />
          <span>Log out</span>
        </button>
      </div>

      {/* ------------------- EDIT PROFILE OVERLAY MODAL ------------------- */}
      {isEditing && (
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-[340px] p-5 shadow-2xl relative select-none animate-in zoom-in-95 duration-150 text-xs">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(userName);
                setEditPhone(userPhone);
                setEditEmail(userEmail);
                setEditAddress(userHomeAddress);
              }}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-950 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-gray-950" />
              <h3 className="text-sm font-bold text-gray-950">
                Edit Profile Details
              </h3>
            </div>

            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Update your personal details below to customize your community profile and reports.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-left">
              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-950 shrink-0 bg-gray-50 flex items-center justify-center shadow-sm">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor="profile-photo-file-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-950 hover:bg-gray-850 text-white rounded-lg text-[11px] font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <span>Upload Photo</span>
                    </label>
                    <input
                      type="file"
                      id="profile-photo-file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                      Browse standard photo files (JPG/PNG).
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or paste an online photo URL..."
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-gray-50 text-gray-950 rounded-xl py-2 px-3 text-[10px] border border-gray-200 focus:outline-none focus:border-gray-950 font-medium"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 px-3 text-xs border border-gray-200 focus:outline-none focus:border-gray-950 font-medium"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 px-3 text-xs border border-gray-200 focus:outline-none focus:border-gray-950 font-medium"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 px-3 text-xs border border-gray-200 focus:outline-none focus:border-gray-950 font-medium"
                  required
                />
              </div>

              {/* Home Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Home Address</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Your home address"
                  rows={2}
                  className="w-full bg-gray-50 text-gray-950 rounded-xl py-2.5 px-3 text-xs border border-gray-200 focus:outline-none focus:border-gray-950 resize-none font-medium"
                  required
                />
              </div>

              {/* Save & Cancel buttons */}
              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(userName);
                    setEditPhone(userPhone);
                    setEditEmail(userEmail);
                    setEditAddress(userHomeAddress);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-950 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

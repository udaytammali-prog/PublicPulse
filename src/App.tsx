import React, { useState, useEffect } from "react";
import { Home as HomeIcon, Map as MapIcon, Plus, Phone as PhoneIcon, User as UserIcon, ShieldAlert, Check, Loader2 } from "lucide-react";
import PhoneFrame from "./components/PhoneFrame";
import HomeFeed from "./components/HomeFeed";
import ReportIssue from "./components/ReportIssue";
import IssueDetail from "./components/IssueDetail";
import MapView from "./components/MapView";
import ImpactDashboard from "./components/ImpactDashboard";
import LocalServices from "./components/LocalServices";
import Profile from "./components/Profile";
import MyReports from "./components/MyReports";
import { Issue, ServiceProvider } from "./types";

type TabState = "home" | "map" | "services" | "profile" | "dashboard";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function App() {
  // Global States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [activeTab, setActiveTab] = useState<TabState>("home");
  const [currentScreen, setCurrentScreen] = useState<"tabs" | "report" | "detail" | "my-reports">("tabs");
  const [areaName, setAreaName] = useState(() => {
    return localStorage.getItem("community_hero_area") || "Jubilee Hills";
  });

  const handleUpdateAreaName = (newArea: string) => {
    setAreaName(newArea);
    localStorage.setItem("community_hero_area", newArea);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    localStorage.setItem("community_hero_user", JSON.stringify(updatedProfile));
  };

  // Secondary stack states
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [prefillReport, setPrefillReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login Form States (Lightweight auth)
  const [loginName, setLoginName] = useState("Uday Tammali");
  const [loginPhone, setLoginPhone] = useState("+91 91234 56789");
  const [loginEmail, setLoginEmail] = useState("udaytammali@gmail.com");
  const [loginAddress, setLoginAddress] = useState("Plot 42, Road No 5, Jubilee Hills, Hyderabad");

  // Load user profile & seed backend data
  useEffect(() => {
    // Check local storage for logged-in user
    const savedUser = localStorage.getItem("community_hero_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }

    // Fetch initial datasets from Express REST APIs
    const fetchData = async () => {
      try {
        const [issuesRes, providersRes] = await Promise.all([
          fetch("/api/issues"),
          fetch("/api/services"),
        ]);
        const issuesData = await issuesRes.json();
        const providersData = await providersRes.json();

        setIssues(issuesData);
        setProviders(providersData);
      } catch (e) {
        console.error("Failed to fetch initial server state", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Check issues status periodically (every 10 seconds) to simulate background timers
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName || !loginPhone || !loginEmail || !loginAddress) return;

    const profile: UserProfile = {
      name: loginName,
      phone: loginPhone,
      email: loginEmail,
      address: loginAddress,
    };

    setUser(profile);
    localStorage.setItem("community_hero_user", JSON.stringify(profile));
  };

  const handleLogOut = () => {
    setUser(null);
    localStorage.removeItem("community_hero_user");
    setActiveTab("home");
    setCurrentScreen("tabs");
  };

  // Submit report handler
  const handleCreateReport = async (reportData: {
    title: string;
    description: string;
    category: any;
    location: string;
    photoUrl: string;
    blockedDetails?: any;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      const newIssue = await res.json();

      setIssues((prev) => [newIssue, ...prev]);
      setCurrentScreen("tabs");
      setActiveTab("home");
      setPrefillReport(null);
    } catch (e) {
      console.error("Failed to submit issue report", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Upvote/Confirm issue handler
  const handleConfirmIssue = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/confirm`, {
        method: "POST",
      });
      const updatedIssue = await res.json();

      setIssues((prev) => prev.map((i) => (i.id === id ? updatedIssue : i)));
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(updatedIssue);
      }
    } catch (e) {
      console.error("Failed to confirm issue", e);
    }
  };

  // Resolve parking issue immediately ("It Moved")
  const handleMoveParking = async (id: string) => {
    try {
      const res = await fetch(`/api/issues/${id}/move`, {
        method: "POST",
      });
      const updatedIssue = await res.json();

      setIssues((prev) => prev.map((i) => (i.id === id ? updatedIssue : i)));
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(updatedIssue);
      }
    } catch (e) {
      console.error("Failed to resolve parking issue", e);
    }
  };

  // Submit service provider review
  const handleSubmitReview = async (
    providerId: string,
    reviewData: { rating: number; comment: string; chips: string[] }
  ) => {
    try {
      const res = await fetch(`/api/services/${providerId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewData,
          reviewerName: user?.name,
        }),
      });
      const updatedProvider = await res.json();

      setProviders((prev) => prev.map((p) => (p.id === providerId ? updatedProvider : p)));
    } catch (e) {
      console.error("Failed to submit provider review", e);
    }
  };

  // Add new service provider listing
  const handleAddProvider = async (providerData: { name: string; role: string; phone: string }) => {
    try {
      const res = await fetch("/api/services", {
        // Simple mock trigger as Express endpoint
      });
      // Prepend to our list in state directly
      const initial = providerData.name.split(" ").map((w) => w[0]).join("");
      const newProvider: ServiceProvider = {
        id: "p" + Date.now(),
        name: providerData.name,
        role: providerData.role,
        avatar: initial,
        rating: 5.0,
        reviewsCount: 0,
        neighboursUsed: 1,
        availability: "Available now",
        phone: providerData.phone,
        reviews: [],
      };

      setProviders((prev) => [newProvider, ...prev]);
    } catch (e) {
      console.error("Failed to add provider", e);
    }
  };

  // Navigation handlers
  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentScreen("detail");
  };

  const handleNavigateToReport = (prefill?: any) => {
    if (prefill) {
      setPrefillReport(prefill);
    }
    setCurrentScreen("report");
  };

  // Render Screens depending on layout state
  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "home":
        return (
          <HomeFeed
            issues={issues}
            onSelectIssue={handleSelectIssue}
            onNavigateToProfile={() => setActiveTab("profile")}
            onNavigateToReport={handleNavigateToReport}
            onConfirmIssue={handleConfirmIssue}
            userName={user.name}
            userAvatar={user.avatarUrl}
            areaName={areaName}
            onUpdateAreaName={handleUpdateAreaName}
          />
        );
      case "map":
        return <MapView issues={issues} onSelectIssue={handleSelectIssue} />;
      case "services":
        return (
          <LocalServices
            providers={providers}
            onAddProvider={handleAddProvider}
            onSubmitReview={handleSubmitReview}
            areaName={areaName}
          />
        );
      case "profile":
        return (
          <Profile
            userName={user.name}
            userPhone={user.phone}
            userEmail={user.email}
            userHomeAddress={user.address}
            userAvatar={user.avatarUrl}
            issues={issues}
            onNavigateToMyReports={() => setCurrentScreen("my-reports")}
            onNavigateToListService={() => {
              setActiveTab("services");
              setCurrentScreen("tabs");
            }}
            onUpdateProfile={handleUpdateProfile}
            onLogOut={handleLogOut}
          />
        );
      case "dashboard":
        return <ImpactDashboard issues={issues} areaName={areaName} />;
      default:
        return null;
    }
  };

  // Pre-seed layout if server dataset is fetching
  if (isLoading && issues.length === 0) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
          <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          <div className="text-sm font-semibold text-gray-800">Synchronizing Local Hub...</div>
          <div className="text-[10px] text-gray-500 max-w-[220px]">
            Please wait while we establish a connection with Jubilee Hills civic database.
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      {!user ? (
        /* Lightweight Login screen */
        <div className="flex-1 flex flex-col justify-center px-6 py-12 select-none bg-white animate-in fade-in duration-200">
          <div className="text-center mb-8 space-y-3">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl mx-auto flex items-center justify-center shadow-md relative border border-gray-800">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Community Hero</h1>
              <p className="text-xs text-gray-500 mt-1">Hyperlocal Civic Issue Reporting Platform</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="bg-white border border-gray-100 p-5 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center border-b border-gray-100 pb-2">
              Citizen Entry Form
            </h2>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Uday Tammali"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="+91 91234 56789"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="udaytammali@gmail.com"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Home Address
              </label>
              <input
                type="text"
                value={loginAddress}
                onChange={(e) => setLoginAddress(e.target.value)}
                placeholder="Plot 42, Jubilee Hills"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-md pt-3 pb-3"
            >
              <Check className="w-4 h-4 text-white shrink-0" />
              <span>Enter Community</span>
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Stack Navigation */
        <div className="flex-1 flex flex-col h-full relative">
          {/* Main content viewport */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {currentScreen === "tabs" && renderTabContent()}

            {currentScreen === "report" && (
              <ReportIssue
                onClose={() => {
                  setCurrentScreen("tabs");
                  setPrefillReport(null);
                }}
                onSubmit={handleCreateReport}
                prefill={prefillReport}
                userHomeAddress={user.address}
              />
            )}

            {currentScreen === "detail" && selectedIssue && (
              <IssueDetail
                issue={selectedIssue}
                onClose={() => setCurrentScreen("tabs")}
                onConfirm={handleConfirmIssue}
                onMove={handleMoveParking}
              />
            )}

            {currentScreen === "my-reports" && (
              <MyReports
                issues={issues}
                onClose={() => setCurrentScreen("tabs")}
                onSelectIssue={handleSelectIssue}
              />
            )}
          </div>

          {/* ------------------- BOTTOM NAVIGATION BAR ------------------- */}
          {currentScreen === "tabs" && (
            <div className="h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 relative z-40 select-none">
              {/* Tab 1: Home */}
              <button
                onClick={() => {
                  setActiveTab("home");
                  setCurrentScreen("tabs");
                }}
                className={`flex flex-col items-center gap-1 transition-colors cursor-pointer w-12 ${
                  activeTab === "home" ? "text-gray-950 font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <HomeIcon className="w-5 h-5 shrink-0" />
                <span className="text-[9px]">Home</span>
              </button>

              {/* Tab 2: Map */}
              <button
                onClick={() => {
                  setActiveTab("map");
                  setCurrentScreen("tabs");
                }}
                className={`flex flex-col items-center gap-1 transition-colors cursor-pointer w-12 ${
                  activeTab === "map" ? "text-gray-950 font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <MapIcon className="w-5 h-5 shrink-0" />
                <span className="text-[9px]">Map</span>
              </button>

              {/* Tab 3: Raised Circular Report Button (Center) */}
              <div className="relative w-12 h-12 flex justify-center items-center">
                <button
                  onClick={() => handleNavigateToReport()}
                  className="absolute bottom-3 w-13 h-13 rounded-full bg-white border-3 border-gray-100 text-gray-950 flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-90 transition-transform cursor-pointer z-50 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-950 text-white flex items-center justify-center transition-colors group-hover:bg-gray-800">
                    <Plus className="w-5.5 h-5.5" />
                  </div>
                </button>
              </div>

              {/* Tab 4: Local Services */}
              <button
                onClick={() => {
                  setActiveTab("services");
                  setCurrentScreen("tabs");
                }}
                className={`flex flex-col items-center gap-1 transition-colors cursor-pointer w-12 ${
                  activeTab === "services" ? "text-gray-950 font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <PhoneIcon className="w-5 h-5 shrink-0" />
                <span className="text-[9px]">Services</span>
              </button>

              {/* Tab 5: Profile */}
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setCurrentScreen("tabs");
                }}
                className={`flex flex-col items-center gap-1 transition-colors cursor-pointer w-12 ${
                  activeTab === "profile" ? "text-gray-950 font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <UserIcon className="w-5 h-5 shrink-0" />
                <span className="text-[9px]">Profile</span>
              </button>
            </div>
          )}
        </div>
      )}
    </PhoneFrame>
  );
}

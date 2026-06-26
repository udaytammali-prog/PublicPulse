import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-0 md:p-6 text-gray-900 overflow-x-hidden antialiased">
      {/* Main Container */}
      <div className="relative w-full max-w-[410px] md:h-[840px] h-screen bg-white md:border-[10px] md:border-[#111827] md:rounded-[44px] md:shadow-2xl overflow-hidden flex flex-col justify-between select-none">
        {/* Dynamic Island / Notch */}
        <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#111827] rounded-b-xl z-50">
          <div className="w-2 h-2 bg-gray-950 rounded-full absolute right-8 top-2" />
          <div className="w-12 h-1 bg-gray-800 rounded-full absolute left-1/2 transform -translate-x-1/2 top-2.5" />
        </div>

        {/* Status Bar */}
        <div className="h-11 bg-white text-gray-700 flex items-end justify-between px-6 pb-2 text-[11px] font-sans font-semibold tracking-wide relative z-40 select-none border-b border-gray-100">
          <div>{time || "01:40 AM"}</div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-[9px] text-gray-500">5G</span>
            <Wifi className="w-3.5 h-3.5 text-gray-700" />
            <Battery className="w-4 h-4 text-green-600 fill-green-600/25" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 bg-white overflow-y-auto relative flex flex-col scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}

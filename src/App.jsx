import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Hammer, Users, Trophy } from "lucide-react";
import TapScreen from "./tabs/TapScreen";
import UpgradesTab from "./tabs/UpgradesTab";
import FriendsTab from "./tabs/FriendsTab";
import LeaderboardTab from "./tabs/LeaderboardTab";

const TABS = [
  { id: "home", title: "Биржа", icon: <Home /> },
  { id: "upgrades", title: "Майнинг", icon: <Hammer /> },
  { id: "friends", title: "Друзья", icon: <Users /> },
  { id: "leaders", title: "Лидеры", icon: <Trophy /> }
];

export default function App() {
  const [selectedTab, setSelectedTab] = useState("home");

  const renderTab = () => {
    switch (selectedTab) {
      case "home":
        return <TapScreen />;
      case "upgrades":
        return <UpgradesTab />;
      case "friends":
        return <FriendsTab />;
      case "leaders":
        return <LeaderboardTab />;
      default:
        return <TapScreen />;
    }
  };

  return (
    <div className="bg-[#1c1c1e] text-white min-h-screen flex flex-col justify-between">
      <div className="p-4 flex-grow">{renderTab()}</div>
      <div className="bg-[#2b2b2e] border-t border-gray-700 p-2 flex justify-around">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center text-xs ${selectedTab === tab.id ? "text-yellow-400" : "text-gray-400"}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            <div className="w-6 h-6">{tab.icon}</div>
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
}
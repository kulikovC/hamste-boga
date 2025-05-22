// App.jsx — главный компонент приложения с вкладками и Telegram-данными
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Hammer, Users, Trophy, Gift } from "lucide-react";
import TapScreen from "./tabs/TapScreen";
import UpgradesTab from "./tabs/UpgradesTab";
import FriendsTab from "./tabs/FriendsTab";
import LeaderboardTab from "./tabs/LeaderboardTab";
import RewardsTab from "./tabs/RewardsTab";

const TABS = [
  { id: "home", title: "Биржа", icon: <Home /> },
  { id: "upgrades", title: "Майнинг", icon: <Hammer /> },
  { id: "friends", title: "Друзья", icon: <Users /> },
  { id: "leaders", title: "Лидеры", icon: <Trophy /> },
  { id: "rewards", title: "Награды", icon: <Gift /> }
];

export default function App() {
  const [selectedTab, setSelectedTab] = useState("home");
  const [username, setUsername] = useState("Вы");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) {
      setUsername(tg.user.username || tg.user.first_name || "Вы");
      setAvatar(tg.user.photo_url || "");
    }
  }, []);

  const renderTab = () => {
    switch (selectedTab) {
      case "home": return <TapScreen />;
      case "upgrades": return <UpgradesTab />;
      case "friends": return <FriendsTab />;
      case "leaders": return <LeaderboardTab />;
      case "rewards": return <RewardsTab />;
      default: return <TapScreen />;
    }
  };

  return (
    <div className="bg-[#1c1c1e] text-white min-h-screen flex flex-col justify-between">
      {/* Верхняя панель с ником и аватаром */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {avatar && <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full" />}
          <span className="text-sm">@{username}</span>
        </div>
        {renderTab()}
      </div>

      {/* Нижняя навигация */}
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

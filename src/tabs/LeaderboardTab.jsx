// LeaderboardTab.jsx — вкладка с топом игроков по доходу в час
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function LeaderboardTab() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("coinsPerHour", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      const top = [];
      snap.forEach((doc) => top.push(doc.data()));
      setLeaders(top);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-yellow-300 text-center">🏆 Лидерборд</h2>
      <div className="bg-[#2e2e30] rounded-xl p-4">
        {leaders.map((user, index) => (
          <div key={index} className="flex justify-between border-b border-gray-700 py-2 text-sm">
            <span>
              #{index + 1} @{user.username || "пользователь"}
            </span>
            <span>{user.coinsPerHour || 0}/ч</span>
          </div>
        ))}
      </div>
    </div>
  );
}

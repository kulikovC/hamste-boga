// UpgradesTab.jsx — вкладка с улучшениями, расчётом стоимости и дохода
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

const upgradesList = [
  { id: 1, name: "Автокликер", baseCost: 100, income: 5 },
  { id: 2, name: "Помощник", baseCost: 500, income: 25 },
  { id: 3, name: "Мега лапка", baseCost: 1500, income: 100 },
  { id: 4, name: "Супер лапка", baseCost: 5000, income: 250 },
  { id: 5, name: "Фабрика лапок", baseCost: 20000, income: 1000 },
  { id: 6, name: "Фурри Империя", baseCost: 100000, income: 5000 },
];

export default function UpgradesTab() {
  const [userId, setUserId] = useState(null);
  const [coins, setCoins] = useState(0);
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  const [upgrades, setUpgrades] = useState({});

  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) setUserId(tg.user.id.toString());
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCoins(data.coins || 0);
        setCoinsPerHour(data.coinsPerHour || 0);
        setUpgrades(data.upgrades || {});
      }
    });
  }, [userId]);

  const buyUpgrade = (upgrade) => {
    const level = upgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.25, level));
    if (coins >= cost) {
      const newCoins = coins - cost;
      const newUpgrades = { ...upgrades, [upgrade.id]: level + 1 };
      const newIncome = coinsPerHour + upgrade.income;

      setCoins(newCoins);
      setUpgrades(newUpgrades);
      setCoinsPerHour(newIncome);

      const ref = doc(db, "users", userId);
      updateDoc(ref, {
        coins: newCoins,
        upgrades: newUpgrades,
        coinsPerHour: newIncome,
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-yellow-300 mb-4 text-center">🛠 Улучшения</h2>
      <div className="space-y-4">
        {upgradesList.map((upgrade) => {
          const level = upgrades[upgrade.id] || 0;
          const cost = Math.floor(upgrade.baseCost * Math.pow(1.25, level));
          return (
            <div key={upgrade.id} className="bg-[#2e2e30] rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{upgrade.name}</div>
                <div className="text-sm text-gray-400">ур. {level} / +{upgrade.income} в час</div>
              </div>
              <Button onClick={() => buyUpgrade(upgrade)}>
                Купить за {cost}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

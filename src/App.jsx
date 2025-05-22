import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit
} from "firebase/firestore";

const upgradesList = [
  { id: 1, name: "Автокликер", baseCost: 100, income: 5 },
  { id: 2, name: "Помощник", baseCost: 500, income: 25 },
  { id: 3, name: "Мега лапка", baseCost: 1500, income: 100 },
  { id: 4, name: "Супер лапка", baseCost: 5000, income: 250 },
  { id: 5, name: "Фабрика лапок", baseCost: 20000, income: 1000 },
  { id: 6, name: "Фурри Империя", baseCost: 100000, income: 5000 },
];

export default function App() {
  const [coins, setCoins] = useState(0);
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  const [upgrades, setUpgrades] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [clicksInSecond, setClicksInSecond] = useState(0);
  const [username, setUsername] = useState("Вы");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState(null);

  const furryImage = "https://e7.pngegg.com/pngimages/815/828/png-clipart-cat-demon-dog-canidae-cat-legendary-creature-mammal.png";

  // Получаем данные пользователя из Telegram
  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) {
      setUsername(tg.user.username || tg.user.first_name || "Вы");
      setUserId(tg.user.id.toString());
      if (tg.user.photo_url) setAvatarUrl(tg.user.photo_url);
    }
  }, []);

  // Ограничение по кликам в секунду
  useEffect(() => {
    const interval = setInterval(() => setClicksInSecond(0), 1000);
    return () => clearInterval(interval);
  }, []);

  // Доход в час каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) => prev + coinsPerHour / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [coinsPerHour]);

  // Загрузка и авто-сохранение прогресса
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);

    // Загрузка
    getDoc(ref).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCoins(data.coins || 0);
        setCoinsPerHour(data.coinsPerHour || 0);
        setUpgrades(data.upgrades || {});
      } else {
        setDoc(ref, { coins: 0, coinsPerHour: 0, upgrades: {}, username });
      }
    });

    // Лидерборд
    const q = query(collection(db, "users"), orderBy("coinsPerHour", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id }));
      setLeaderboard(list);
    });

    return () => unsub();
  }, [userId]);

  // Сохраняем прогресс при изменении
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    updateDoc(ref, {
      coins,
      coinsPerHour,
      upgrades,
      username
    });
  }, [coins, coinsPerHour, upgrades]);

  // Клик по картинке
  const handleClick = () => {
    if (clicksInSecond < 10) {
      setCoins((c) => c + 1);
      setClicksInSecond((c) => c + 1);
    }
  };

  // Покупка улучшения
  const buyUpgrade = (upgrade) => {
    const level = upgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.25, level));
    if (coins >= cost) {
      setCoins(coins - cost);
      setUpgrades({ ...upgrades, [upgrade.id]: level + 1 });
      setCoinsPerHour(coinsPerHour + upgrade.income);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-white bg-[#1c1c1e] min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-2 text-yellow-400">🐾 Hamste Boga</h1>

      <div className="flex items-center justify-center mb-4 gap-2">
        {avatarUrl && (
          <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
        )}
        <span className="text-lg font-semibold">@{username}</span>
      </div>

      <motion.img
        src={furryImage}
        alt="furry"
        className="mx-auto w-48 h-48 cursor-pointer rounded-xl"
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
      />

      <div className="text-center my-4">
        <p>💰 Монет: {Math.floor(coins)}</p>
        <p>📈 Доход в час: {coinsPerHour}</p>
      </div>

      <Card className="mb-4 bg-[#2c2c30]">
        <CardContent>
          <h2 className="text-lg font-semibold mb-2 text-yellow-300">🛠 Улучшения</h2>
          <ScrollArea className="h-40 pr-2">
            {upgradesList.map((upgrade) => {
              const level = upgrades[upgrade.id] || 0;
              const cost = Math.floor(upgrade.baseCost * Math.pow(1.25, level));
              return (
                <div key={upgrade.id} className="flex justify-between items-center mb-2">
                  <span>{upgrade.name} (ур. {level})</span>
                  <Button onClick={() => buyUpgrade(upgrade)}>Купить за {cost}</Button>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-[#2c2c30]">
        <CardContent>
          <h2 className="text-lg font-semibold mb-2 text-yellow-300">🏆 Лидеры</h2>
          {leaderboard.map((entry, idx) => (
            <div key={idx} className="flex justify-between border-b py-1 text-sm">
              <span>@{entry.username || "?"}</span>
              <span>{entry.coinsPerHour || 0}/ч</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
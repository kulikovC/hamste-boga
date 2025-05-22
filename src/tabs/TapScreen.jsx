import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function TapScreen() {
  const [coins, setCoins] = useState(0);
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  const [clicksLeft, setClicksLeft] = useState(7000);
  const [nextReset, setNextReset] = useState(Date.now() + 3600000);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("Вы");
  const [loaded, setLoaded] = useState(false);

  const furryImage = "https://newday.kherson.ua/wp-content/uploads/2024/06/image-4.png";

  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) {
      setUsername(tg.user.username || tg.user.first_name || "Вы");
      setUserId(tg.user.id.toString());
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCoins(data.coins || 0);
        setCoinsPerHour(data.coinsPerHour || 0);
      } else {
        setDoc(ref, { coins: 0, coinsPerHour: 0, upgrades: {}, username }, { merge: true });
      }
      setLoaded(true);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || !loaded) return;
    const ref = doc(db, "users", userId);
    updateDoc(ref, {
      coins,
      coinsPerHour,
      username
    });
  }, [coins]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) => prev + coinsPerHour / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [coinsPerHour]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() >= nextReset) {
        setClicksLeft(7000);
        setNextReset(Date.now() + 3600000);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextReset]);

  const handleClick = () => {
    if (clicksLeft > 0) {
      setCoins(coins + 1);
      setClicksLeft(clicksLeft - 1);
    }
  };

  return (
    <div className="text-center">
      {/* Новый стиль персонажа с обводкой */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="w-36 h-36 mx-auto rounded-full border-4 border-[#6c5ce7] p-1 bg-gradient-to-b from-[#1e1e1e] to-[#2c2c2e] shadow-lg cursor-pointer mb-4"
      >
        <img
          src={furryImage}
          alt="tap"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>

      <div className="text-center">
        <div>💰 Монет: {Math.floor(coins)}</div>
        <div>🔘 Осталось тапов: {clicksLeft}</div>
        <div className="text-sm text-gray-400">
          ⏳ Обновление через: {Math.floor((nextReset - Date.now()) / 1000)} сек.
        </div>
      </div>
    </div>
  );
}


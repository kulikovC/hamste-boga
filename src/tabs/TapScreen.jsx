// TapScreen.jsx — вкладка с кликом по персонажу, монетами, лимитом и доходом
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function TapScreen() {
  const [coins, setCoins] = useState(0);
  const [coinsPerHour, setCoinsPerHour] = useState(0);
  const [clicksLeft, setClicksLeft] = useState(7000);
  const [nextReset, setNextReset] = useState(Date.now() + 3600000);
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("Вы");
  const [userId, setUserId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const furryImage = "https://e7.pngegg.com/pngimages/815/828/png-clipart-cat-demon-dog-canidae-cat-legendary-creature-mammal.png";

  useEffect(() => {
    const tg = window?.Telegram?.WebApp?.initDataUnsafe;
    if (tg?.user) {
      setUsername(tg.user.username || tg.user.first_name || "Вы");
      setUserId(tg.user.id.toString());
      if (tg.user.photo_url) setAvatar(tg.user.photo_url);
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
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          {avatar && <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />}
          <span>@{username}</span>
        </div>
        <div className="text-yellow-400 font-semibold">📈 {Math.floor(coinsPerHour)}/ч</div>
      </div>

      <motion.img
        src={furryImage}
        alt="tap"
        className="mx-auto w-40 h-40 cursor-pointer rounded-xl mb-4"
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      />

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

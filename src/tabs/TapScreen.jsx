// TapScreen.jsx — вкладка с кликом по персонажу, монетами, лимитом и доходом с анимацией +1 и блоком прибыли
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showPlusOne, setShowPlusOne] = useState(false);

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
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 500);
    }
  };

  return (
    <div className="text-center flex flex-col items-center justify-center relative">
      {/* Блок справа сверху */}
      <div className="absolute top-2 right-3 bg-[#2c2c2e] border border-yellow-500 rounded-xl px-3 py-1 flex items-center gap-1 text-sm shadow-md">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Coin_icon.png/32px-Coin_icon.png" className="w-4 h-4" alt="coin" />
        <span className="text-green-400 font-semibold">+{Math.floor(coinsPerHour)} в час</span>
      </div>

      {/* Анимация +1 */}
      <AnimatePresence>
        {showPlusOne && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -40 }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute text-yellow-400 text-xl font-bold"
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>

      {/* Картинка персонажа */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="w-48 h-48 rounded-full border-4 border-[#6c5ce7] p-1 bg-gradient-to-b from-[#1e1e1e] to-[#2c2c2e] shadow-xl cursor-pointer"
      >
        <img
          src={furryImage}
          alt="tap"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>

      {/* Инфо */}
      <div className="text-center mt-4">
        <div>🔘 Осталось тапов: {clicksLeft}</div>
        <div className="text-sm text-gray-400">
          ⏳ Обновление через: {Math.floor((nextReset - Date.now()) / 1000)} сек.
        </div>
      </div>
    </div>
  );
}

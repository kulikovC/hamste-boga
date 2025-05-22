// RewardsTab.jsx — вкладка с ежедневной наградой (раз в 24 часа)
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function RewardsTab() {
  const [userId, setUserId] = useState(null);
  const [lastClaim, setLastClaim] = useState(null);
  const [canClaim, setCanClaim] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const REWARD_AMOUNT = 500;
  const REWARD_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

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
        const last = data.lastRewardTime || 0;
        setLastClaim(last);
        const now = Date.now();
        const diff = now - last;
        if (diff >= REWARD_INTERVAL) {
          setCanClaim(true);
        } else {
          setSecondsLeft(Math.floor((REWARD_INTERVAL - diff) / 1000));
        }
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!canClaim && secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setCanClaim(true);
            clearInterval(interval);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [secondsLeft, canClaim]);

  const claimReward = async () => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const newCoins = (data.coins || 0) + REWARD_AMOUNT;

    await updateDoc(ref, {
      coins: newCoins,
      lastRewardTime: Date.now()
    });

    setCanClaim(false);
    setSecondsLeft(REWARD_INTERVAL / 1000);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}ч ${m}м ${s}с`;
  };

  return (
    <div className="text-center mt-8">
      <h2 className="text-xl font-bold text-yellow-300 mb-4">🎁 Ежедневная награда</h2>
      <p className="mb-2">Вы можете получать +{REWARD_AMOUNT} монет каждый день!</p>
      {canClaim ? (
        <Button onClick={claimReward}>Забрать награду</Button>
      ) : (
        <p className="text-sm text-gray-400">Доступно через: {formatTime(secondsLeft)}</p>
      )}
    </div>
  );
}
